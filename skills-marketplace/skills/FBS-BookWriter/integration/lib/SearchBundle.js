/**
 * 按 search-policy 执行：S0 并行检索包、章前门禁检索
 * 面向「文字量大、时效性、专业性」：多查询模板 + 强制落账
 */

'use strict';
const fs = require('fs');
const path = require('path');

/** 单次 webSearch 默认超时（毫秒），防止宿主检索挂死拖垮整章流水线 */
const DEFAULT_SEARCH_TIMEOUT_MS = 15_000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_BLOCK_DAYS = 7;
const DEFAULT_DAILY_TIMEOUT_LIMIT = 3;

/** 进程内运行态：runId -> { blockedDomains:Set<string> } */
const RUN_DOMAIN_STATE = new Map();
/** 进程内域名态：domain -> { timeoutAt:number[], blockedUntil:number } */
const DOMAIN_STATE = new Map();

function normalizeDomain(d) {
  return String(d || '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '');
}

function extractDomainsFromText(text) {
  const t = String(text || '');
  const out = new Set();
  const urlMatches = t.match(/\bhttps?:\/\/[^\s)"'<>]+/giu) || [];
  for (const u of urlMatches) {
    try {
      const host = new URL(u).hostname;
      const d = normalizeDomain(host);
      if (d) out.add(d);
    } catch (_) {}
  }
  const bareDomainMatches = t.match(/\b(?:[a-z0-9-]+\.)+[a-z]{2,}\b/giu) || [];
  for (const m of bareDomainMatches) {
    const d = normalizeDomain(m);
    if (d) out.add(d);
  }
  return Array.from(out);
}

function ensureRunState(runId) {
  const key = runId || 'run-unknown';
  if (!RUN_DOMAIN_STATE.has(key)) {
    RUN_DOMAIN_STATE.set(key, { blockedDomains: new Set() });
  }
  return RUN_DOMAIN_STATE.get(key);
}

function getDomainState(domain) {
  const d = normalizeDomain(domain);
  if (!DOMAIN_STATE.has(d)) {
    DOMAIN_STATE.set(d, { timeoutAt: [], blockedUntil: 0 });
  }
  return DOMAIN_STATE.get(d);
}

function isDomainBlockedGlobally(domain, nowMs) {
  const st = getDomainState(domain);
  return st.blockedUntil > nowMs;
}

function markDomainTimeout(domain, nowMs) {
  const st = getDomainState(domain);
  st.timeoutAt = st.timeoutAt.filter((ts) => nowMs - ts <= ONE_DAY_MS);
  st.timeoutAt.push(nowMs);
}

function resolveAccessPolicy(runtimePolicy = {}) {
  const p = (runtimePolicy && runtimePolicy.accessPolicy) || {};
  const dailyTimeoutLimit = Number.isFinite(Number(p.dailyTimeoutLimitPerDomain))
    ? Math.max(1, Math.floor(Number(p.dailyTimeoutLimitPerDomain)))
    : DEFAULT_DAILY_TIMEOUT_LIMIT;
  const blockDays = Number.isFinite(Number(p.blockDaysAfterDailyLimit))
    ? Math.max(1, Math.floor(Number(p.blockDaysAfterDailyLimit)))
    : DEFAULT_BLOCK_DAYS;
  const blockOnTimeoutInCurrentRun = p.blockOnTimeoutInCurrentRun !== false;
  return {
    dailyTimeoutLimit,
    blockDays,
    blockOnTimeoutInCurrentRun,
  };
}

function applyDomainTimeoutPolicy(domain, nowMs, cfg) {
  const st = getDomainState(domain);
  if (st.timeoutAt.length >= cfg.dailyTimeoutLimit) {
    st.blockedUntil = Math.max(st.blockedUntil || 0, nowMs + cfg.blockDays * ONE_DAY_MS);
  }
}

function extractDomainsFromResult(raw) {
  if (!raw) return [];
  const text = typeof raw === 'string' ? raw : JSON.stringify(raw);
  return extractDomainsFromText(text);
}

function loadPersistentDomainState(filePath) {
  const p = String(filePath || '').trim();
  if (!p) return;
  try {
    if (!fs.existsSync(p)) {
      return;
    }
    const raw = fs.readFileSync(p, 'utf8');
    const json = JSON.parse(raw);
    const now = Date.now();
    const domains = json && json.domains && typeof json.domains === 'object' ? json.domains : {};
    Object.keys(domains).forEach((d0) => {
      const d = normalizeDomain(d0);
      if (!d) return;
      const rec = domains[d0] || {};
      const st = getDomainState(d);
      const timeoutAt = Array.isArray(rec.timeoutAt) ? rec.timeoutAt.filter((x) => Number.isFinite(Number(x))) : [];
      st.timeoutAt = Array.from(new Set([...(st.timeoutAt || []), ...timeoutAt])).filter((ts) => now - ts <= ONE_DAY_MS);
      if (Number.isFinite(Number(rec.blockedUntil))) {
        st.blockedUntil = Math.max(st.blockedUntil || 0, Number(rec.blockedUntil));
      }
    });
  } catch (_) {}
}

function persistDomainState(filePath) {
  const p = String(filePath || '').trim();
  if (!p) return;
  try {
    const dir = path.dirname(p);
    fs.mkdirSync(dir, { recursive: true });
    const now = Date.now();
    const domains = {};
    DOMAIN_STATE.forEach((st, domain) => {
      const timeoutAt = Array.isArray(st.timeoutAt) ? st.timeoutAt.filter((ts) => now - ts <= ONE_DAY_MS) : [];
      const blockedUntil = Number.isFinite(Number(st.blockedUntil)) ? Number(st.blockedUntil) : 0;
      if (timeoutAt.length > 0 || blockedUntil > now) {
        domains[domain] = { timeoutAt, blockedUntil };
      }
    });
    fs.writeFileSync(
      p,
      JSON.stringify(
        {
          updatedAt: new Date().toISOString(),
          domains,
        },
        null,
        2
      ),
      'utf8'
    );
  } catch (_) {}
}

function withTimeout(promise, ms) {
  let tid;
  const timeoutPromise = new Promise((_, rej) => {
    tid = setTimeout(() => rej(new Error(`search timeout after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(tid));
}

/**
 * @param {number} year
 * @param {string} topic
 */
function buildS0Queries(topic, counts, year) {
  const y = year || new Date().getFullYear();
  const t = (topic || '').trim() || '本书主题';
  const q = [];
  const domesticComp = [
    `${t} 同类书籍 白皮书 研报 书评 对比 ${y}`,
    `${t} 同主题 深度长文 综述 替代读物 ${y}`,
    `${t} 付费专栏 电子课 同议题 内容竞品 ${y}`,
  ];
  const overseasComp = [
    `${t} similar books whitepaper longform comparison ${y}`,
    `${t} same topic report essay reader alternatives ${y}`,
    `${t} paid newsletter online course competitive content ${y}`,
  ];
  const readerQs = [
    `${t} 目标读者 痛点 需求 阅读场景 ${y}`,
    `${t} 谁会读 为什么读 未满足需求 ${y}`,
    `${t} reader pain points why read this topic ${y}`,
    `${t} 读者评价 吐槽 对同类书的期望 ${y}`,
  ];
  const monetizationQs = [
    `${t} 图书 文章 付费阅读 版税 出版 变现 ${y}`,
    `${t} 白皮书 手册 ToB 采购 定价 授权 变现 ${y}`,
    `${t} book article monetization publishing revenue model ${y}`,
    `${t} 本主题 内容付费 订阅 授权转载 变现路径 ${y}`,
  ];
  let i;
  const nDom = Math.max(0, Math.floor(Number(counts.competitorDomestic) || 0));
  for (i = 0; i < nDom; i++) {
    q.push(domesticComp[i % domesticComp.length]);
  }
  const nOs = Math.max(0, Math.floor(Number(counts.competitorOverseas) || 0));
  for (i = 0; i < nOs; i++) {
    q.push(overseasComp[i % overseasComp.length]);
  }
  const nReader = Math.max(0, Math.floor(Number(counts.readerAnalysis) || 0));
  for (i = 0; i < nReader; i++) {
    q.push(readerQs[i % readerQs.length]);
  }
  const nMon = Math.max(0, Math.floor(Number(counts.monetization) || 0));
  for (i = 0; i < nMon; i++) {
    q.push(monetizationQs[i % monetizationQs.length]);
  }
  return q;
}

function buildChapterQueries(topic, minN, year) {
  const y = year || new Date().getFullYear();
  const t = (topic || '').trim() || '本章主题';
  const out = [];
  for (let i = 0; i < minN; i++) {
    out.push(`${t} 专业资料 权威来源 ${y} [检索轮次 ${i + 1}]`);
  }
  return out;
}

/**
 * @param {Function} webSearch async (string) => any
 * @param {number} [timeoutMs]
 */
async function runOneSearch(
  webSearch,
  query,
  logger,
  timeoutMs = DEFAULT_SEARCH_TIMEOUT_MS,
  runtimePolicy = {}
) {
  const ms = typeof timeoutMs === 'number' && timeoutMs > 0 ? timeoutMs : DEFAULT_SEARCH_TIMEOUT_MS;
  const runId = runtimePolicy.runId || 'run-unknown';
  const blocklistPath = runtimePolicy.blocklistPath || null;
  const cfg = resolveAccessPolicy(runtimePolicy);
  if (blocklistPath) {
    loadPersistentDomainState(blocklistPath);
  }
  const nowMs = Date.now();
  const domains = Array.from(
    new Set([...(runtimePolicy.targetDomains || []), ...extractDomainsFromText(query)].map(normalizeDomain).filter(Boolean))
  );
  const runState = ensureRunState(runId);
  const blockedDomain = domains.find((d) => runState.blockedDomains.has(d) || isDomainBlockedGlobally(d, nowMs));
  if (blockedDomain) {
    return {
      ok: false,
      query,
      error: `domain blocked: ${blockedDomain}`,
      errorCode: runState.blockedDomains.has(blockedDomain)
        ? 'SEARCH_DOMAIN_BLOCKED_THIS_RUN'
        : 'SEARCH_DOMAIN_BLOCKED_WEEKLY',
      blockedDomain,
    };
  }
  try {
    const raw = await withTimeout(Promise.resolve(webSearch(query)), ms);
    const discoveredDomains = extractDomainsFromResult(raw);
    discoveredDomains.forEach((d) => {
      const nd = normalizeDomain(d);
      if (nd && !domains.includes(nd)) domains.push(nd);
    });
    const summary =
      typeof raw === 'string'
        ? raw.slice(0, 500)
        : JSON.stringify(raw).slice(0, 500);
    return { ok: true, query, summary, raw, domains };
  } catch (e) {
    logger.warn('[SearchBundle] search failed', query, e.message);
    const msg = String(e && e.message ? e.message : 'search failed');
    const errorCode = /timeout/iu.test(msg) ? 'SEARCH_TIMEOUT' : 'SEARCH_FAILED';
    const errorDomains = extractDomainsFromText(msg);
    errorDomains.forEach((d) => {
      const nd = normalizeDomain(d);
      if (nd && !domains.includes(nd)) domains.push(nd);
    });
    if (errorCode === 'SEARCH_TIMEOUT') {
      for (const d of domains) {
        if (cfg.blockOnTimeoutInCurrentRun) {
          runState.blockedDomains.add(d);
        }
        markDomainTimeout(d, nowMs);
        applyDomainTimeoutPolicy(d, nowMs, cfg);
      }
      if (blocklistPath) {
        persistDomainState(blocklistPath);
      }
    }
    return { ok: false, query, error: msg, errorCode, domains };
  }
}

/**
 * S0：并行多路检索（内容竞品 / 读者 / 本书变现），强化时效与专业面。
 * 「竞品」模板优先指向同类书/白皮书/长文等可替代读物，避免默认滑向行业产品矩阵；
 * 「变现」模板优先指向本稿出版与内容付费路径，与 section-3-workflow S0 主体内涵锚定一致。
 */
async function executeS0ParallelResearch({
  topic,
  webSearch,
  ledger,
  policy,
  year,
  logger,
  searchTimeoutMs,
  auditMeta,
}) {
  const accessPolicy = (policy && policy.searchAccessPolicy) || {};
  const t =
    typeof searchTimeoutMs === 'number' && searchTimeoutMs > 0
      ? searchTimeoutMs
      : Number.isFinite(Number(accessPolicy.singlePageTimeoutMs)) && Number(accessPolicy.singlePageTimeoutMs) > 0
        ? Number(accessPolicy.singlePageTimeoutMs)
        : DEFAULT_SEARCH_TIMEOUT_MS;
  if (typeof webSearch !== 'function') {
    return {
      success: false,
      reason: 'NO_WEB_SEARCH',
      hint: '请注入 skillServices.webSearch',
    };
  }
  const counts = policy.s0ParallelQueries || {};
  const queries = buildS0Queries(topic, counts, year);
  const results = await Promise.all(
    queries.map((q) =>
      runOneSearch(webSearch, q, logger, t, {
        runId: auditMeta && auditMeta.runId ? auditMeta.runId : 'run-unknown',
        blocklistPath: auditMeta && auditMeta.blocklistPath ? auditMeta.blocklistPath : null,
        targetDomains: auditMeta && Array.isArray(auditMeta.targetDomains) ? auditMeta.targetDomains : [],
        accessPolicy,
      })
    )
  );
  const L = ledger || null;
  results.forEach((r) => {
    if (L && L.append) {
      L.append({
        kind: 'search',
        stage: 'S0',
        chapterId: null,
        query: r.query,
        ok: r.ok,
        summary: r.summary || r.error,
        book_id: auditMeta && auditMeta.bookId ? auditMeta.bookId : null,
        run_id: auditMeta && auditMeta.runId ? auditMeta.runId : null,
        attempt_no: auditMeta && typeof auditMeta.nextS0Attempt === 'function' ? auditMeta.nextS0Attempt() : null,
        policy_version: auditMeta && auditMeta.policyVersion ? auditMeta.policyVersion : null,
        error_code: r.ok ? null : r.errorCode || 'SEARCH_FAILED',
      });
    }
  });
  const okCount = results.filter((r) => r.ok).length;
  return {
    success: okCount > 0,
    stage: 'S0',
    totalQueries: queries.length,
    okCount,
    results,
  };
}

/**
 * 章前门禁：每章至少 minQueriesPerChapter 次主题检索（可审计）
 */
async function executeChapterGate({
  chapterId,
  topic,
  webSearch,
  ledger,
  policy,
  year,
  logger,
  searchTimeoutMs,
  auditMeta,
  onProgress,
}) {
  const accessPolicy = (policy && policy.searchAccessPolicy) || {};
  const t =
    typeof searchTimeoutMs === 'number' && searchTimeoutMs > 0
      ? searchTimeoutMs
      : Number.isFinite(Number(accessPolicy.singlePageTimeoutMs)) && Number(accessPolicy.singlePageTimeoutMs) > 0
        ? Number(accessPolicy.singlePageTimeoutMs)
        : DEFAULT_SEARCH_TIMEOUT_MS;
  if (typeof webSearch !== 'function') {
    return {
      gatePassed: false,
      reason: 'NO_WEB_SEARCH',
      hint: '请注入 skillServices.webSearch',
    };
  }
  const minN =
    policy.chapterWriting && typeof policy.chapterWriting.minQueriesPerChapter === 'number'
      ? policy.chapterWriting.minQueriesPerChapter
      : 2;
  const queries = buildChapterQueries(topic, minN, year);
  const results = [];
  const L = ledger && typeof ledger.append === 'function' ? ledger : null;
  const totalQ = queries.length;
  for (let qi = 0; qi < queries.length; qi++) {
    const q = queries[qi];
    const idx = qi + 1;
    if (typeof onProgress === 'function') {
      try {
        onProgress({ phase: 'start', index: idx, total: totalQ, query: q, chapterId });
      } catch (_) {}
    }
    if (logger && typeof logger.info === 'function') {
      logger.info(`[S3 chapter_gate] ${chapterId || 'CH'} 检索 ${idx}/${totalQ}: ${q}`);
    }
    const r = await runOneSearch(webSearch, q, logger, t, {
      runId: auditMeta && auditMeta.runId ? auditMeta.runId : 'run-unknown',
      blocklistPath: auditMeta && auditMeta.blocklistPath ? auditMeta.blocklistPath : null,
      targetDomains: auditMeta && Array.isArray(auditMeta.targetDomains) ? auditMeta.targetDomains : [],
      accessPolicy,
    });
    results.push(r);
    if (typeof onProgress === 'function') {
      try {
        onProgress({ phase: 'done', index: idx, total: totalQ, ok: r.ok, chapterId });
      } catch (_) {}
    }
    if (L && L.append) {
      L.append({
        kind: 'search',
        stage: 'S3',
        chapterId: chapterId || null,
        query: q,
        ok: r.ok,
        summary: r.summary || r.error,
        book_id: auditMeta && auditMeta.bookId ? auditMeta.bookId : null,
        run_id: auditMeta && auditMeta.runId ? auditMeta.runId : null,
        attempt_no: auditMeta && typeof auditMeta.nextS3Attempt === 'function' ? auditMeta.nextS3Attempt() : null,
        policy_version: auditMeta && auditMeta.policyVersion ? auditMeta.policyVersion : null,
        error_code: r.ok ? null : r.errorCode || 'SEARCH_FAILED',
      });
    }
  }
  const okCount = results.filter((r) => r.ok).length;
  return {
    gatePassed: okCount >= minN,
    chapterId,
    minQueries: minN,
    okCount,
    results,
  };
}

module.exports = {
  executeS0ParallelResearch,
  executeChapterGate,
  buildS0Queries,
  buildChapterQueries,
  DEFAULT_SEARCH_TIMEOUT_MS,
};
