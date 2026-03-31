/**
 * WorkBuddy 用户记忆摘要（稳妥摄取）：随宿主记忆能力演进，仅做有界只读聚合，不替代主题锁。
 * 供 integration/workbuddy-memory-digest.mjs 与宿主集成方调用。
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { redactJsonObject } = require('./PathRedaction.js');

const DEFAULT_USER_MEMORY = {
  maxBytesPerFile: 32768,
  maxTotalDigestChars: 12000,
  workspaceMemory: {
    relativeDir: '.workbuddy/memory',
    preferFilenames: ['MEMORY.md'],
    includeDateLogsMax: 3,
  },
  userProfileDir: {
    relativeToUserHome: '.workbuddy',
    preferFilenames: ['USER.md', 'BOOTSTRAP.md', 'IDENTITY.md', 'SOUL.md'],
  },
  injectIntoBookAs: '.fbs/workbuddy-memory-digest.json',
  mode: 'opt_in',
};

function mergeUserMemoryIntegration(policy) {
  const u = policy && policy.userMemoryIntegration ? policy.userMemoryIntegration : {};
  const wm = { ...DEFAULT_USER_MEMORY.workspaceMemory, ...(u.workspaceMemory || {}) };
  const upd = { ...DEFAULT_USER_MEMORY.userProfileDir, ...(u.userProfileDir || {}) };
  return {
    maxBytesPerFile: typeof u.maxBytesPerFile === 'number' ? u.maxBytesPerFile : DEFAULT_USER_MEMORY.maxBytesPerFile,
    maxTotalDigestChars:
      typeof u.maxTotalDigestChars === 'number' ? u.maxTotalDigestChars : DEFAULT_USER_MEMORY.maxTotalDigestChars,
    workspaceMemory: wm,
    userProfileDir: upd,
    injectIntoBookAs: typeof u.injectIntoBookAs === 'string' ? u.injectIntoBookAs : DEFAULT_USER_MEMORY.injectIntoBookAs,
    mode: typeof u.mode === 'string' ? u.mode : DEFAULT_USER_MEMORY.mode,
    versionNote: u.versionNote || '',
    mustPassGatesBeforeUse: Array.isArray(u.mustPassGatesBeforeUse) ? u.mustPassGatesBeforeUse : [],
  };
}

function loadSearchPolicy(skillRoot) {
  const policyPath = path.join(skillRoot, 'references', '05-ops', 'search-policy.json');
  try {
    const raw = fs.readFileSync(policyPath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * @param {string} absPath
 * @param {number} maxBytes
 * @returns {{ path: string, text: string, truncated: boolean, error?: string }}
 */
function readBoundedFile(absPath, maxBytes) {
  try {
    const st = fs.statSync(absPath);
    const fd = fs.openSync(absPath, 'r');
    try {
      const toRead = Math.min(st.size, maxBytes);
      const buf = Buffer.alloc(toRead);
      fs.readSync(fd, buf, 0, toRead, 0);
      let text = buf.toString('utf8');
      const truncated = st.size > maxBytes;
      if (truncated) text += '\n…(文件超出单文件上限，已截断)';
      return { path: absPath, text, truncated };
    } finally {
      fs.closeSync(fd);
    }
  } catch (e) {
    return { path: absPath, text: '', truncated: false, error: e.message || String(e) };
  }
}

/**
 * @param {string} memoryDir
 * @param {number} max
 * @returns {string[]}
 */
function listRecentDateLogs(memoryDir, max) {
  if (!fs.existsSync(memoryDir) || !fs.statSync(memoryDir).isDirectory()) return [];
  const files = fs
    .readdirSync(memoryDir, { withFileTypes: true })
    .filter((d) => d.isFile() && /^\d{4}-\d{2}-\d{2}\.md$/i.test(d.name))
    .map((d) => {
      const full = path.join(memoryDir, d.name);
      return { full, mtime: fs.statSync(full).mtimeMs };
    })
    .sort((a, b) => b.mtime - a.mtime)
    .slice(0, max)
    .map((x) => x.full);
  return files;
}

/**
 * @param {string} workspaceRoot
 * @param {ReturnType<typeof mergeUserMemoryIntegration>} cfg
 */
function collectWorkspaceSources(workspaceRoot, cfg) {
  const rel = cfg.workspaceMemory.relativeDir.split('/').join(path.sep);
  const memoryDir = path.join(workspaceRoot, rel);
  const out = [];
  for (const name of cfg.workspaceMemory.preferFilenames) {
    const p = path.join(memoryDir, name);
    if (fs.existsSync(p) && fs.statSync(p).isFile()) {
      const r = readBoundedFile(p, cfg.maxBytesPerFile);
      out.push({
        role: 'workspace_memory',
        label: name,
        workspaceRoot: path.resolve(workspaceRoot),
        ...r,
      });
    }
  }
  for (const p of listRecentDateLogs(memoryDir, cfg.workspaceMemory.includeDateLogsMax)) {
    const r = readBoundedFile(p, cfg.maxBytesPerFile);
    out.push({
      role: 'workspace_date_log',
      label: path.basename(p),
      workspaceRoot: path.resolve(workspaceRoot),
      ...r,
    });
  }
  return out;
}

/**
 * @param {string} userHome
 * @param {ReturnType<typeof mergeUserMemoryIntegration>} cfg
 */
function collectUserProfileSources(userHome, cfg) {
  const base = path.join(userHome, cfg.userProfileDir.relativeToUserHome.split('/').join(path.sep));
  const out = [];
  for (const name of cfg.userProfileDir.preferFilenames) {
    const p = path.join(base, name);
    if (fs.existsSync(p) && fs.statSync(p).isFile()) {
      const r = readBoundedFile(p, cfg.maxBytesPerFile);
      out.push({
        role: 'user_profile',
        label: name,
        userHome: path.resolve(userHome),
        ...r,
      });
    }
  }
  return out;
}

/**
 * @param {Array<{ text: string, truncated?: boolean, [k: string]: unknown }>} sources
 * @param {number} maxTotalChars
 */
/**
 * 启发式：本书是否像「首次开写」（无 S0 产出、无主题锁/记忆摘要落盘）。非门禁，仅供宿主优化话术。
 * @param {string|null|undefined} bookRoot
 * @returns {boolean|null}
 */
function inferFirstRunBookProject(bookRoot) {
  if (!bookRoot || !fs.existsSync(bookRoot)) return null;
  let hasS0 = false;
  try {
    const files = fs.readdirSync(bookRoot, { withFileTypes: true });
    hasS0 = files.some((d) => d.isFile() && d.name.startsWith('[S0'));
  } catch {
    return null;
  }
  const fbs = path.join(bookRoot, '.fbs');
  const hasLock = fs.existsSync(path.join(fbs, 'topic-lock.json'));
  const hasDigest = fs.existsSync(path.join(fbs, 'workbuddy-memory-digest.json'));
  return !(hasS0 || hasLock || hasDigest);
}

function buildCombinedExcerpt(sources, maxTotalChars) {
  let used = 0;
  const parts = [];
  for (const s of sources) {
    if (s.error) continue;
    const header = `\n---\n[${s.role}:${s.label}]\n`;
    const body = s.text || '';
    const room = maxTotalChars - used;
    if (room <= 0) break;
    let chunk = header;
    let innerTrunc = false;
    const innerBudget = room - header.length;
    if (innerBudget <= 0) break;
    let bodyUse = body;
    if (body.length > innerBudget) {
      bodyUse = body.slice(0, innerBudget) + '\n…(摘要预算已用尽)';
      innerTrunc = true;
    }
    chunk += bodyUse;
    used += chunk.length;
    parts.push({ chunk, truncated: Boolean(s.truncated || innerTrunc) });
  }
  return parts.map((p) => p.chunk).join('').trim();
}

const STATIC_WARNINGS = [
  'WorkBuddy 用户记忆格式与路径可能随版本变化；本摘要为只读启发，非权威事实源。',
  '注入模型上下文前须通过本书主题锁与 C0-4 / topic-consistency-gate；跨书内容必须 ASK_CONFIRMATION。',
  '勿将 USER.md / IDENTITY 中的 persona 与本书正文事实混为一谈。',
  'JSON 内 absolutePath 与 combinedExcerpt 可能含本机路径；提交仓库或外传前请脱敏。',
];

/**
 * @param {{
 *   skillRoot: string,
 *   workspaceRoots?: string[],
 *   userHome?: string | null,
 *   lockedTopic?: string | null,
 *   bookRoot?: string | null,
 *   redactPaths?: boolean,
 * }} opts
 */
function buildDigest(opts) {
  const skillRoot = path.resolve(opts.skillRoot);
  const policy = loadSearchPolicy(skillRoot);
  const cfg = mergeUserMemoryIntegration(policy);
  const workspaceRoots = (opts.workspaceRoots || []).map((r) => path.resolve(r)).filter(Boolean);
  const sources = [];
  for (const wr of workspaceRoots) {
    sources.push(...collectWorkspaceSources(wr, cfg));
  }
  if (opts.userHome) {
    sources.push(...collectUserProfileSources(path.resolve(opts.userHome), cfg));
  }

  const combinedExcerpt = buildCombinedExcerpt(sources, cfg.maxTotalDigestChars);
  const bookRootResolved = opts.bookRoot ? path.resolve(opts.bookRoot) : null;
  const firstRun = inferFirstRunBookProject(bookRootResolved);

  const digest = {
    schema: 'fbs.workbuddy-memory-digest',
    digestSpecVersion: '1.18.9',
    generatedAt: new Date().toISOString(),
    searchPolicyVersion: policy.version || null,
    lockedTopicHint: opts.lockedTopic || null,
    bookContextHeuristics: {
      bookRoot: bookRootResolved,
      firstRunBookProject: firstRun,
      heuristicNote:
        firstRun === true
          ? '未检测到 [S0] 产出或 .fbs 主题锁/记忆摘要；模型可建议用户可选运行 digest / 环境快照（仍须完成 S0 主题锁定）。'
          : firstRun === false
            ? '已存在 S0 产出或 .fbs 锁定/摘要之一；按续写语境处理。'
            : '未提供 bookRoot 或无法读取目录，不推断。',
    },
    mode: cfg.mode,
    userMemoryVersionNote: cfg.versionNote || null,
    mustPassGatesBeforeUse: cfg.mustPassGatesBeforeUse.length
      ? cfg.mustPassGatesBeforeUse
      : ['topic-consistency-gate', 'C0-4'],
    sources: sources.map((s) => ({
      role: s.role,
      label: s.label,
      absolutePath: s.path,
      workspaceRoot: s.workspaceRoot || null,
      userHome: s.userHome || null,
      charCount: (s.text || '').length,
      truncated: Boolean(s.truncated),
      error: s.error || null,
    })),
    combinedExcerpt,
    warnings: [...STATIC_WARNINGS],
  };

  if (!sources.length) {
    digest.warnings.push('未读取到任何匹配文件（路径不存在或尚未创建记忆文件）。');
  }

  if (opts.redactPaths) {
    digest.redactionApplied = true;
    return { digest: redactJsonObject(digest), cfg, policy };
  }
  digest.redactionApplied = false;
  return { digest, cfg, policy };
}

/**
 * @param {string} bookRoot
 * @param {object} digest
 * @param {string} relativePath
 */
function writeDigestToBook(bookRoot, digest, relativePath) {
  const root = path.resolve(bookRoot);
  const rel = relativePath.split('/').join(path.sep);
  const outPath = path.join(root, rel);
  const dir = path.dirname(outPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(digest, null, 2), 'utf8');
  return outPath;
}

module.exports = {
  DEFAULT_USER_MEMORY,
  mergeUserMemoryIntegration,
  loadSearchPolicy,
  readBoundedFile,
  inferFirstRunBookProject,
  buildDigest,
  writeDigestToBook,
};
