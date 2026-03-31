/**
 * 多角色流水线：在单宿主会话内按「检索门禁 → 主笔 → 各层审校」顺序编排；
 * 各角色由宿主注入 async 函数；未注入时返回待办提示与规范指针。
 */

'use strict';

const { executeChapterGate } = require('./SearchBundle');

/** 章内写作默认顺序（与 persona / SKILL 岗位对齐，不含 researcher——已由门禁覆盖） */
const DEFAULT_POST_RESEARCH_ROLES = ['writer', 'critic_s', 'critic_l1', 'critic_l2', 'critic_l3', 'proofer'];

/** 每个已注入 agents.* 单步默认超时（毫秒），默认开启；opts.roleStepTimeoutMs === 0 可关闭 */
const DEFAULT_ROLE_STEP_TIMEOUT_MS = 300_000;

function safeEmit(onProgress, event, events) {
  const e = { ts: new Date().toISOString(), ...event };
  events.push(e);
  if (typeof onProgress === 'function') {
    try {
      onProgress(e);
    } catch (_) {}
  }
}

function withTimeout(promise, ms, label) {
  let tid;
  const t = new Promise((_, rej) => {
    tid = setTimeout(() => rej(new Error(`${label} timeout after ${ms}ms`)), ms);
  });
  return Promise.race([promise, t]).finally(() => clearTimeout(tid));
}

/**
 * @param {{
 *   chapterId: string,
 *   topic: string,
 *   webSearch: Function,
 *   ledger?: object,
 *   policy: object,
 *   year?: number,
 *   logger?: Console,
 *   agents?: Record<string, (ctx: object) => Promise<any>>,
 *   skillPointers?: object,
 *   roleOrder?: string[],
 *   searchTimeoutMs?: number,
 *   roleStepTimeoutMs?: number,
 *   progressThrottleMs?: number,
 *   auditMeta?: object,
 * }} opts
 */
async function runProfessionalChapterPipeline(opts) {
  const logger = opts.logger || console;
  const year = opts.year || new Date().getFullYear();
  const stages = [];
  const progressEvents = [];
  const totalSteps = 1 + (Array.isArray(opts.roleOrder) ? opts.roleOrder.length : DEFAULT_POST_RESEARCH_ROLES.length);
  let completedSteps = 0;
  const throttleMs = Number(opts.progressThrottleMs) || 0;
  let lastProgressTs = 0;
  const emit = (event) => {
    if (throttleMs > 0 && event && event.type === 'progress') {
      const now = Date.now();
      if (now - lastProgressTs < throttleMs) return;
      lastProgressTs = now;
    }
    safeEmit(opts.onProgress, event, progressEvents);
  };

  emit({
    type: 'progress',
    currentStage: 'research_gate',
    percent: 0,
    nextAction: 'run chapter research gate',
    chapterId: opts.chapterId,
  });

  const gate = await executeChapterGate({
    chapterId: opts.chapterId,
    topic: opts.topic,
    webSearch: opts.webSearch,
    ledger: opts.ledger,
    policy: opts.policy,
    year,
    logger,
    searchTimeoutMs: opts.searchTimeoutMs,
    auditMeta: opts.auditMeta,
    onProgress: (e) => {
      if (!e) return;
      const pctBase = Math.round((completedSteps / Math.max(totalSteps, 1)) * 100);
      const slice = Math.round((100 / Math.max(totalSteps, 1)) * 0.85);
      const qPct =
        e.total > 0 ? Math.round((e.index / e.total) * slice) : 0;
      emit({
        type: 'progress',
        currentStage: e.phase === 'start' ? 's3_chapter_gate_query_start' : 's3_chapter_gate_query_done',
        percent: Math.min(99, pctBase + qPct),
        nextAction:
          e.phase === 'start'
            ? `章前检索 ${e.index}/${e.total} 进行中（S3）`
            : `章前检索 ${e.index}/${e.total} 已结束${e.ok === false ? '（失败）' : ''}`,
        chapterId: opts.chapterId,
        gateQueryIndex: e.index,
        gateQueryTotal: e.total,
        queryPreview: e.query != null ? String(e.query).slice(0, 120) : undefined,
      });
    },
  });
  stages.push({
    role: 'researcher',
    done: gate.gatePassed,
    detail: gate,
    note: '章前检索门禁：满足 minQueriesPerChapter，并写入 ledger',
  });
  completedSteps += 1;
  emit({
    type: 'progress',
    currentStage: 'research_gate_done',
    percent: Math.round((completedSteps / totalSteps) * 100),
    nextAction: gate.gatePassed ? 'start writer role' : 'fix chapter research gate',
    chapterId: opts.chapterId,
  });

  // 硬门禁：章前检索未达标时，禁止继续主笔与审校角色。
  if (!gate.gatePassed) {
    return {
      success: false,
      blocked: true,
      reason: 'CHAPTER_RESEARCH_GATE_NOT_PASSED',
      stages,
      progressEvents,
      ctx: {
        chapterId: opts.chapterId,
        topic: opts.topic,
        year,
        researchGate: gate,
        skillPointers: opts.skillPointers || {},
      },
    };
  }

  const ctx = {
    chapterId: opts.chapterId,
    topic: opts.topic,
    year,
    researchGate: gate,
    skillPointers: opts.skillPointers || {},
  };

  let stepMs = DEFAULT_ROLE_STEP_TIMEOUT_MS;
  if (opts.roleStepTimeoutMs === 0) {
    stepMs = 0;
  } else if (typeof opts.roleStepTimeoutMs === 'number' && opts.roleStepTimeoutMs > 0) {
    stepMs = opts.roleStepTimeoutMs;
  }

  const order = opts.roleOrder || DEFAULT_POST_RESEARCH_ROLES;
  let hasRoleFailure = false;
  let writerState = { exists: false, done: false, pending: false };
  for (const role of order) {
    emit({
      type: 'progress',
      currentStage: `role_${role}_start`,
      percent: Math.round((completedSteps / totalSteps) * 100),
      nextAction: `execute role ${role}`,
      chapterId: opts.chapterId,
    });
    const fn = opts.agents && opts.agents[role];
    if (typeof fn === 'function') {
      try {
        const call = Promise.resolve(fn(ctx));
        const result =
          stepMs > 0
            ? await withTimeout(call, stepMs, `agents.${role}`)
            : await call;
        stages.push({ role, done: true, result });
        ctx[`last_${role}`] = result;
        if (role === 'writer') writerState = { exists: true, done: true, pending: false };
        completedSteps += 1;
        emit({
          type: 'progress',
          currentStage: `role_${role}_done`,
          percent: Math.round((completedSteps / totalSteps) * 100),
          nextAction: 'continue next role',
          chapterId: opts.chapterId,
        });
      } catch (e) {
        logger.error(`[MultiAgentPipeline] role ${role}`, e);
        stages.push({ role, done: false, error: e.message });
        hasRoleFailure = true;
        if (role === 'writer') writerState = { exists: true, done: false, pending: false };
        emit({
          type: 'progress',
          currentStage: `role_${role}_failed`,
          percent: Math.round((completedSteps / totalSteps) * 100),
          nextAction: role === 'writer' ? 'fix writer and retry chapter' : 'inspect role error',
          chapterId: opts.chapterId,
        });
        if (role === 'writer') {
          stages.push({
            role: 'pipeline_control',
            done: true,
            detail: 'writer failed -> fail-fast stop downstream roles',
          });
          break;
        }
      }
    } else {
      stages.push({
        role,
        pending: true,
        hint: `请向宿主注入 agents.${role}（async）以接主笔/审校`,
      });
      if (role === 'writer') writerState = { exists: true, done: false, pending: true };
      emit({
        type: 'progress',
        currentStage: `role_${role}_missing`,
        percent: Math.round((completedSteps / totalSteps) * 100),
        nextAction: `inject agents.${role}`,
        chapterId: opts.chapterId,
      });
      if (role === 'writer') {
        stages.push({
          role: 'pipeline_control',
          done: true,
          detail: 'writer missing -> skip downstream reviewer roles',
        });
        break;
      }
    }
  }

  const success = gate.gatePassed && !hasRoleFailure && writerState.exists && writerState.done;
  emit({
    type: 'progress',
    currentStage: success ? 'pipeline_done' : 'pipeline_failed',
    percent: success ? 100 : Math.round((completedSteps / totalSteps) * 100),
    nextAction: success ? 'run chapter quality gate' : 'inspect blocked reason',
    chapterId: opts.chapterId,
  });
  return { success, stages, ctx, progressEvents };
}

module.exports = {
  runProfessionalChapterPipeline,
  DEFAULT_POST_RESEARCH_ROLES,
  DEFAULT_ROLE_STEP_TIMEOUT_MS,
};
