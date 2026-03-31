/**
 * WorkBuddy 使用环境快照：仅记录路径存在性 + search-policy 版本，不对记忆文件做内容 hash。
 */

'use strict';

const fs = require('fs');
const path = require('path');

const DEFAULT_SNAPSHOT = {
  mode: 'opt_in',
  relativeOutputFile: '.fbs/workbuddy-environment.json',
};

function mergeEnvironmentSnapshot(policy) {
  const e = policy && policy.environmentSnapshot ? policy.environmentSnapshot : {};
  return {
    mode: typeof e.mode === 'string' ? e.mode : DEFAULT_SNAPSHOT.mode,
    relativeOutputFile:
      typeof e.relativeOutputFile === 'string' ? e.relativeOutputFile : DEFAULT_SNAPSHOT.relativeOutputFile,
  };
}

function loadSearchPolicy(skillRoot) {
  const policyPath = path.join(skillRoot, 'references', '05-ops', 'search-policy.json');
  try {
    return JSON.parse(fs.readFileSync(policyPath, 'utf8'));
  } catch {
    return {};
  }
}

/**
 * @param {string} bookRoot
 * @param {string|null} userHome
 * @param {object} policy
 */
function collectProbes(bookRoot, userHome, policy) {
  const root = path.resolve(bookRoot);
  const umi = policy.userMemoryIntegration || {};
  const wm = umi.workspaceMemory || {};
  const relMem = (wm.relativeDir || '.workbuddy/memory').split('/').join(path.sep);
  const memoryDir = path.join(root, relMem);
  const prefer = Array.isArray(wm.preferFilenames) ? wm.preferFilenames : ['MEMORY.md'];
  const memMd = path.join(memoryDir, prefer[0] || 'MEMORY.md');

  const upd = umi.userProfileDir || {};
  const relUser = (upd.relativeToUserHome || '.workbuddy').split('/').join(path.sep);
  let userBase = null;
  if (userHome) {
    userBase = path.join(path.resolve(userHome), relUser);
  }

  const preferUser = Array.isArray(upd.preferFilenames)
    ? upd.preferFilenames
    : ['USER.md', 'BOOTSTRAP.md', 'IDENTITY.md', 'SOUL.md'];

  const probes = {
    book_dot_fbs_exists: fs.existsSync(path.join(root, '.fbs')),
    book_workspace_memory_dir_exists: fs.existsSync(memoryDir) && fs.statSync(memoryDir).isDirectory(),
    book_workspace_memory_md_exists: fs.existsSync(memMd) && fs.statSync(memMd).isFile(),
  };

  if (userBase) {
    probes.user_dot_workbuddy_dir_exists = fs.existsSync(userBase) && fs.statSync(userBase).isDirectory();
    for (const name of preferUser) {
      const key = `user_file_${name.replace(/\./g, '_')}_exists`;
      const p = path.join(userBase, name);
      probes[key] = fs.existsSync(p) && fs.statSync(p).isFile();
    }
  }

  return {
    schema: 'fbs.workbuddy-environment',
    snapshotSpecVersion: '1.18.9',
    capturedAt: new Date().toISOString(),
    searchPolicyVersion: policy.version != null ? String(policy.version) : null,
    bookRoot: root,
    probes,
    privacyNote: '仅路径存在性布尔值与策略版本；不含文件内容 hash。',
  };
}

/**
 * @param {object|null} previousFull previous on-disk JSON (entire file)
 * @param {object} current from collectProbes
 */
function diffProbes(previousFull, current) {
  const hints = [];
  if (!previousFull || !previousFull.probes) {
    hints.push('无历史快照可比对（首次写入或文件缺失）。');
    return { changedKeys: [], searchPolicyVersionChanged: false, hints };
  }
  const prevP = previousFull.probes;
  const nextP = current.probes;
  const keys = new Set([...Object.keys(prevP), ...Object.keys(nextP)]);
  const changedKeys = [];
  for (const k of keys) {
    if (prevP[k] !== nextP[k]) changedKeys.push(k);
  }
  const searchPolicyVersionChanged = previousFull.searchPolicyVersion !== current.searchPolicyVersion;
  if (searchPolicyVersionChanged) {
    hints.push(
      `search-policy 版本变化：${previousFull.searchPolicyVersion} → ${current.searchPolicyVersion}（建议重读运维文档并重跑 digest/audit）。`
    );
  }
  if (changedKeys.length) {
    hints.push(`路径探测变化字段：${changedKeys.join(', ')}（宿主或工作区布局可能已变，建议复核记忆摘要与环境）。`);
  }
  if (!changedKeys.length && !searchPolicyVersionChanged) {
    hints.push('与上次快照一致：未检测到路径存在性或策略版本变化。');
  }
  return { changedKeys, searchPolicyVersionChanged, hints };
}

/**
 * @param {string} bookRoot
 * @param {object} current
 * @param {object|null} previousFull
 * @param {string} relativeOutputFile
 */
function writeSnapshot(bookRoot, current, previousFull, relativeOutputFile) {
  const root = path.resolve(bookRoot);
  const rel = relativeOutputFile.split('/').join(path.sep);
  const outPath = path.join(root, rel);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  const payload = {
    ...current,
    previous:
      previousFull && previousFull.capturedAt
        ? {
            capturedAt: previousFull.capturedAt,
            searchPolicyVersion: previousFull.searchPolicyVersion,
            probes: previousFull.probes || {},
          }
        : null,
  };

  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf8');
  return outPath;
}

/**
 * @param {string} bookRoot
 * @param {string} relativeOutputFile
 */
function readSnapshotIfExists(bookRoot, relativeOutputFile) {
  const p = path.join(path.resolve(bookRoot), relativeOutputFile.split('/').join(path.sep));
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

module.exports = {
  DEFAULT_SNAPSHOT,
  mergeEnvironmentSnapshot,
  loadSearchPolicy,
  collectProbes,
  diffProbes,
  writeSnapshot,
  readSnapshotIfExists,
};
