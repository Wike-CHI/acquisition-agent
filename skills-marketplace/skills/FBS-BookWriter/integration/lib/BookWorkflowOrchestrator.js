/**
 * 默认「写书」工作流引擎：可被注入 ScenarioManager default / ScenarioRouter workflowEngine。
 * 组合：search-policy + 检索账本 + S0 并行包 + 多角色章内流水线。
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { SearchPolicyFacade } = require('./SearchPolicyFacade');
const { WebSearchLedger } = require('./WebSearchLedger');
const {
  executeS0ParallelResearch,
  executeChapterGate,
  DEFAULT_SEARCH_TIMEOUT_MS,
} = require('./SearchBundle');
const {
  runProfessionalChapterPipeline,
  DEFAULT_ROLE_STEP_TIMEOUT_MS,
} = require('./MultiAgentPipeline');
const { evaluateEmDashBookLevel } = require('./BookLevelConsistency');

const AI_FLAVOR_PATTERNS = [
  /在当今/gu,
  /随着/gu,
  /不是.{0,30}而是/gu,
  /非常关键/gu,
  /根本性/gu,
  /革命性/gu,
];

function normalizeText(text) {
  return typeof text === 'string' ? text : '';
}

function countRegex(text, regex) {
  const m = normalizeText(text).match(regex);
  return m ? m.length : 0;
}

function extractFirstSentence(block) {
  const text = normalizeText(block).trim();
  if (!text) return '';
  const parts = text.split(/[。！？!?]/u);
  return (parts[0] || '').trim();
}

function hasSpecificAnchor(sentence) {
  if (!sentence) return false;
  return /[\d%年月日]/u.test(sentence) || /“[^”]+”|"[^"]+"/u.test(sentence);
}

function parseRatio(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return null;
}
function clamp(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function parsePositiveInt(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function sanitizeFileToken(text, fallback) {
  const s = String(text || '').trim();
  if (!s) return fallback;
  return s.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').replace(/\s+/g, '_');
}

function extractDomainHints(text) {
  const s = String(text || '');
  const found = s.match(/\b(?:https?:\/\/)?(?:www\.)?(?:[a-z0-9-]+\.)+[a-z]{2,}\b/giu) || [];
  return Array.from(
    new Set(
      found
        .map((x) => String(x).replace(/^https?:\/\//i, '').replace(/^www\./i, '').toLowerCase())
        .filter(Boolean)
    )
  );
}

class BookWorkflowOrchestrator {
  /**
   * @param {{
   *   logger?: Console,
   *   skillRoot: string,
   *   bookRoot?: string|null,
   *   searchTimeoutMs?: number,
   *   roleStepTimeoutMs?: number,
   *   chapterCheckpointInterval?: number,
   *   progressThrottleMs?: number,
   * }} options
   */
  constructor(options) {
    if (!options || !options.skillRoot) {
      throw new Error('BookWorkflowOrchestrator requires skillRoot（含 search-policy.json 的技能根）');
    }
    this.logger = options.logger || console;
    this.skillRoot = path.resolve(options.skillRoot);
    this.bookRoot = options.bookRoot ? path.resolve(options.bookRoot) : null;
    this._searchTimeoutMs =
      typeof options.searchTimeoutMs === 'number' && options.searchTimeoutMs > 0
        ? options.searchTimeoutMs
        : undefined;

    if (options.roleStepTimeoutMs === 0) {
      this._roleStepTimeoutMs = 0;
    } else if (typeof options.roleStepTimeoutMs === 'number' && options.roleStepTimeoutMs > 0) {
      this._roleStepTimeoutMs = options.roleStepTimeoutMs;
    } else {
      this._roleStepTimeoutMs = DEFAULT_ROLE_STEP_TIMEOUT_MS;
    }
    this._chapterCheckpointInterval =
      typeof options.chapterCheckpointInterval === 'number' && options.chapterCheckpointInterval > 0
        ? Math.floor(options.chapterCheckpointInterval)
        : 5;
    this._progressThrottleMs =
      typeof options.progressThrottleMs === 'number' && options.progressThrottleMs > 0
        ? Math.floor(options.progressThrottleMs)
        : 0;

    this._policyFacade = new SearchPolicyFacade({ skillRoot: this.skillRoot });
    this._policy = this._policyFacade.getPolicy();
    /** @type {import('./WebSearchLedger').WebSearchLedger|null} */
    this._ledger = this.bookRoot
      ? new WebSearchLedger({ projectRoot: this.bookRoot })
      : null;
    /** @type {import('./WebSearchLedger').WebSearchLedger|null} */
    this._qualityLedger = this.bookRoot
      ? new WebSearchLedger({
          projectRoot: this.bookRoot,
          fileRelative: path.join('.fbs', 'quality-gate-ledger.jsonl'),
        })
      : null;
    /** @type {Function|null} */
    this._webSearch = null;
    this._outlineApproval = {
      approved: false,
      approvedAt: null,
      approvedBy: null,
      note: null,
    };
    this._chapterState = {
      completed: new Set(),
      checkpointPending: false,
      checkpointRequiredAtCount: 0,
      checkpointApprovedCount: 0,
      lastCheckpointApprovedAt: null,
      lastCheckpointPayload: null,
    };
    this._runId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    this._bookId = this.bookRoot ? path.basename(this.bookRoot) : 'book-unknown';
    this._attempt = { s0: 0, s3Gate: 0, s3Quality: 0, s5: 0 };
  }

  registerSkillServices(services) {
    if (!services) return;
    if (typeof services.webSearch === 'function') {
      this._webSearch = services.webSearch;
    }
    if (services.bookRoot && !this._ledger) {
      this.bookRoot = path.resolve(services.bookRoot);
      this._ledger = new WebSearchLedger({ projectRoot: this.bookRoot });
      this._qualityLedger = new WebSearchLedger({
        projectRoot: this.bookRoot,
        fileRelative: path.join('.fbs', 'quality-gate-ledger.jsonl'),
      });
    }
  }

  getPolicy() {
    return this._policy;
  }

  confirmOutlineApproval(payload = {}) {
    this._outlineApproval = {
      approved: true,
      approvedAt: new Date().toISOString(),
      approvedBy: payload.approvedBy || 'user',
      note: payload.note || null,
    };
    return { ok: true, outlineApproval: this._outlineApproval };
  }

  getWorkflowState() {
    return {
      outlineApproval: { ...this._outlineApproval },
      chapterProgress: {
        completedCount: this._chapterState.completed.size,
        completedChapterIds: Array.from(this._chapterState.completed),
        checkpointPending: this._chapterState.checkpointPending,
        checkpointRequiredAtCount: this._chapterState.checkpointRequiredAtCount,
        checkpointApprovedCount: this._chapterState.checkpointApprovedCount,
        chapterCheckpointInterval: this._chapterCheckpointInterval,
        lastCheckpointApprovedAt: this._chapterState.lastCheckpointApprovedAt,
      },
    };
  }

  approveMidCheckpoint(payload = {}) {
    if (!this._chapterState.checkpointPending) {
      return {
        ok: false,
        blocked: true,
        reason: 'NO_PENDING_CHECKPOINT',
        checkpoint: this._buildCheckpointSnapshot(),
      };
    }
    this._chapterState.checkpointPending = false;
    this._chapterState.checkpointApprovedCount = this._chapterState.completed.size;
    this._chapterState.lastCheckpointApprovedAt = new Date().toISOString();
    this._chapterState.lastCheckpointPayload = payload || null;
    return {
      ok: true,
      checkpointApprovedCount: this._chapterState.checkpointApprovedCount,
      approvedAt: this._chapterState.lastCheckpointApprovedAt,
    };
  }

  _buildCheckpointSnapshot() {
    return {
      completedCount: this._chapterState.completed.size,
      completedChapterIds: Array.from(this._chapterState.completed),
      checkpointRequiredAtCount: this._chapterState.checkpointRequiredAtCount,
      checkpointApprovedCount: this._chapterState.checkpointApprovedCount,
      chapterCheckpointInterval: this._chapterCheckpointInterval,
      note: '每 N 章硬性检查点：需先 approveMidCheckpoint 再继续 S3。',
    };
  }

  _validateS5ReleaseGate(input = {}) {
    const gatePolicy = (this._policy && this._policy.qualityGate) || {};
    const scoreThresholdConverted = Number(gatePolicy.minConvertedScore || 7.5);
    const scoreThresholdRaw = Number(gatePolicy.minRawScore || 15);
    const bLayerThreshold = Number(gatePolicy.minBLayerScore || 4);
    const checks = [];
    const hasQualityReport = !!input.qualityReport;
    checks.push({ key: 'qualityReport', ok: hasQualityReport, reason: hasQualityReport ? null : 'MISSING_QUALITY_REPORT' });

    const hasDataFreshnessTable = !!input.dataFreshnessTable;
    checks.push({
      key: 'dataFreshnessTable',
      ok: hasDataFreshnessTable,
      reason: hasDataFreshnessTable ? null : 'MISSING_DATA_FRESHNESS_TABLE',
    });

    const totalConverted = Number(input.totalScoreConverted);
    const totalRaw = Number(input.totalScoreRaw);
    const hasScore = Number.isFinite(totalConverted) || Number.isFinite(totalRaw);
    const passScore =
      (Number.isFinite(totalConverted) && totalConverted >= scoreThresholdConverted) ||
      (Number.isFinite(totalRaw) && totalRaw >= scoreThresholdRaw);
    checks.push({
      key: 'scoreThreshold',
      ok: hasScore && passScore,
      reason: hasScore ? (passScore ? null : 'SCORE_BELOW_THRESHOLD') : 'MISSING_SCORE',
    });

    const hasBLayerScore = Number.isFinite(Number(input.bLayerScore));
    checks.push({
      key: 'bLayerScore',
      ok: hasBLayerScore ? Number(input.bLayerScore) >= bLayerThreshold : false,
      reason: hasBLayerScore
        ? Number(input.bLayerScore) >= bLayerThreshold
          ? null
          : 'B_LAYER_BELOW_THRESHOLD'
        : 'MISSING_B_LAYER_SCORE',
    });
    const deletionRiskConfirmed = input.deletionRiskConfirmed === true;
    checks.push({
      key: 'deletionRiskConfirmed',
      gateType: 'USER_CONFIRM',
      ok: deletionRiskConfirmed,
      reason: deletionRiskConfirmed ? null : 'MISSING_DELETION_RISK_CONFIRMATION',
    });
    const hasAcademicRisk = input.hasAcademicRisk === true;
    const academicUseConfirmed = hasAcademicRisk ? input.academicUseConfirmed === true : true;
    checks.push({
      key: 'academicUseConfirmed',
      gateType: 'USER_CONFIRM',
      ok: academicUseConfirmed,
      reason: academicUseConfirmed ? null : 'MISSING_ACADEMIC_USE_CONFIRMATION',
    });
    const publishConfirmed = input.publishConfirmed === true;
    checks.push({
      key: 'publishConfirmed',
      gateType: 'USER_CONFIRM',
      ok: publishConfirmed,
      reason: publishConfirmed ? null : 'MISSING_PUBLISH_CONFIRMATION',
    });

    // S5-G5 / C0-1：全书破折号总密度（与 quality-check C0、book-level-consistency.md 对齐）
    const requireBookLevelC0 = gatePolicy.requireBookLevelC0 === true;
    const warnAbove = Number(gatePolicy.emDashPerThousandWarnAbove);
    const blockAbove = Number(gatePolicy.emDashPerThousandBlockAbove);
    const emDashOpts = {
      warnAbove: Number.isFinite(warnAbove) ? warnAbove : 1,
      blockAbove: Number.isFinite(blockAbove) ? blockAbove : 3,
    };
    const fullMs = input.fullManuscriptText;
    const hasFullText = typeof fullMs === 'string' && fullMs.trim().length > 0;
    let bookLevelOk = true;
    let bookLevelReason = null;
    /** @type {Record<string, unknown>} */
    let bookLevelDetail = {};

    if (hasFullText) {
      const c01 = evaluateEmDashBookLevel(fullMs, emDashOpts);
      bookLevelDetail = { source: 'fullManuscriptText', c01 };
      if (c01.level === 'block') {
        bookLevelOk = false;
        bookLevelReason = 'EM_DASH_BOOK_LEVEL_BLOCK';
      } else if (c01.level === 'warn' && requireBookLevelC0) {
        bookLevelOk = false;
        bookLevelReason = 'EM_DASH_BOOK_LEVEL_WARN_STRICT';
      } else if (c01.level === 'empty' && c01.emDashCount > 0) {
        bookLevelOk = false;
        bookLevelReason = 'EM_DASH_WITHOUT_BODY_UNITS';
      }
    } else if (input.bookLevelC0Pass === false) {
      bookLevelOk = false;
      bookLevelReason = 'BOOK_LEVEL_C0_EXPLICIT_FAIL';
      bookLevelDetail = { source: 'bookLevelC0Pass' };
    } else if (requireBookLevelC0) {
      bookLevelOk = false;
      bookLevelReason = 'BOOK_LEVEL_C0_TEXT_REQUIRED';
      bookLevelDetail = {
        note: 'qualityGate.requireBookLevelC0 为 true 时须在 payload 提供 fullManuscriptText',
      };
    } else if (input.bookLevelC0Pass === true) {
      bookLevelDetail = {
        skipped: true,
        hostOverride: true,
        note: '宿主已确认 C0 完成（未传全文则编排层未自动计 ρ_em）',
      };
    } else {
      bookLevelDetail = {
        skipped: true,
        note: '未提供 fullManuscriptText：C0-1 未自动核算；可传 bookLevelC0Pass:true 表示已在宿主侧完成',
      };
    }

    checks.push({
      key: 'bookLevelC0',
      gateType: 'SYSTEM',
      ok: bookLevelOk,
      reason: bookLevelOk ? null : bookLevelReason,
      detail: bookLevelDetail,
    });

    const blocked = checks.some((c) => !c.ok);
    const result = {
      blocked,
      checks,
      summary: blocked ? 'S5 发布门禁未通过' : 'S5 发布门禁通过',
      thresholds: {
        scoreThresholdConverted,
        scoreThresholdRaw,
        bLayerThreshold,
      },
    };
    if (this._qualityLedger) {
      this._attempt.s5 += 1;
      const failCheck = checks.find((c) => !c.ok);
      this._qualityLedger.append({
        kind: 'quality_gate',
        stage: 'S5',
        chapterId: null,
        query: 's5_release_gate',
        ok: !blocked,
        summary: result.summary,
        book_id: this._bookId,
        run_id: this._runId,
        attempt_no: this._attempt.s5,
        policy_version: (this._policy && this._policy.version) || null,
        error_code: failCheck ? failCheck.reason || null : null,
        meta: { checks, thresholds: result.thresholds },
      });
    }
    return result;
  }

  evaluateChapterQualityGate(payload = {}) {
    const gatePolicy = (this._policy && this._policy.qualityGate) || {};
    const aiContrastMax = parsePositiveInt(gatePolicy.aiContrastMax, 8);
    const aiAdverbMax = parsePositiveInt(gatePolicy.aiAdverbMax, 12);
    const minAnchorCoverage = clamp(parseRatio(gatePolicy.minAnchorCoverage), 0, 1, 0.5);
    const rhythmCvThreshold = clamp(
      parseRatio(payload.rhythmCvThreshold) ?? parseRatio(gatePolicy.minRhythmCv),
      0,
      2,
      0.2
    );

    const draft = normalizeText(payload.draft || payload.content).trim();
    const chapterPlan = payload.chapterPlan || {};
    const issues = [];
    const checks = [];

    // 1) 结构偏差：若有规划锚点，必须至少命中一类关键词。
    const anchors = Array.isArray(chapterPlan.requiredAnchors) ? chapterPlan.requiredAnchors : [];
    let anchorHit = true;
    if (anchors.length) {
      const hitCount = anchors.filter((k) => normalizeText(k) && draft.includes(k)).length;
      const coverage = anchors.length > 0 ? hitCount / anchors.length : 1;
      const structureDeviation = 1 - coverage;
      anchorHit = coverage >= minAnchorCoverage;
      checks.push({
        key: 'structureAnchors',
        ok: anchorHit,
        detail: { required: anchors.length, hit: hitCount, coverage, structureDeviation, minAnchorCoverage },
      });
      if (!anchorHit) {
        issues.push({
          severity: 'high',
          code: 'STRUCTURE_ANCHOR_MISSING',
          message: '章节规划锚点覆盖率不足，存在偏离 S2/S2.5 风险',
        });
      }
    } else {
      checks.push({ key: 'structureAnchors', ok: true, detail: { skipped: true } });
    }

    // 2) AI 味阻断：套话开场、排比模板、程度副词密度。
    const firstSentence = extractFirstSentence(draft);
    const openingGeneric = /(在当今|随着)/u.test(firstSentence);
    checks.push({ key: 'openingSpecificity', ok: !openingGeneric, detail: { firstSentence } });
    if (openingGeneric) {
      issues.push({
        severity: 'high',
        code: 'AI_OPENING_GENERIC',
        message: '章节首句出现套话开场（在当今/随着）',
      });
    }

    const aiStats = AI_FLAVOR_PATTERNS.map((p) => ({ pattern: p.source, count: countRegex(draft, p) }));
    const contrastCount = countRegex(draft, /不是.{0,30}而是/gu);
    const adverbCount = countRegex(draft, /(非常|极其|特别|根本性|革命性)/gu);
    const aiFlavorPass = contrastCount <= aiContrastMax && adverbCount <= aiAdverbMax;
    checks.push({
      key: 'aiFlavor',
      ok: aiFlavorPass,
      detail: { contrastCount, adverbCount, stats: aiStats, aiContrastMax, aiAdverbMax },
    });
    if (!aiFlavorPass) {
      issues.push({
        severity: 'high',
        code: 'AI_FLAVOR_OVERUSE',
        message: '模板化连接或程度副词使用过密，疑似 AI 味超标',
      });
    }

    // 3) 数据来源精确化：出现数据句时需有来源清单。
    const hasNumericClaims = /(\d+%|\d+万|\d+亿|\d{4}年)/u.test(draft);
    const citations = Array.isArray(payload.citations) ? payload.citations : [];
    const citationPrecise = citations.every((c) => c && c.org && c.report && (c.url || c.publishedAt));
    const citationPass = !hasNumericClaims || (citations.length > 0 && citationPrecise);
    checks.push({
      key: 'dataCitations',
      ok: citationPass,
      detail: {
        hasNumericClaims,
        citationCount: citations.length,
        precise: citationPrecise,
      },
    });
    if (!citationPass) {
      issues.push({
        severity: 'high',
        code: 'DATA_CITATION_INSUFFICIENT',
        message: '存在数据表述但来源不精确（缺机构/报告名/时间或链接）',
      });
    }

    // 4) 段落节奏基础检测（轻量）：过于均匀时告警。
    const paragraphs = draft
      .split(/\n{2,}/u)
      .map((p) => p.trim())
      .filter(Boolean);
    let rhythmPass = true;
    if (paragraphs.length >= 6) {
      const lengths = paragraphs.map((p) => p.length);
      const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
      const variance = lengths.reduce((sum, x) => sum + (x - avg) ** 2, 0) / lengths.length;
      const cv = avg > 0 ? Math.sqrt(variance) / avg : 0;
      rhythmPass = cv >= rhythmCvThreshold;
      checks.push({ key: 'paragraphRhythm', ok: rhythmPass, detail: { cv, cvThreshold: rhythmCvThreshold } });
      if (!rhythmPass) {
        issues.push({
          severity: 'medium',
          code: 'PARAGRAPH_RHYTHM_FLAT',
          message: '段落节奏过于均匀，信息密度可能偏低',
        });
      }
    } else {
      checks.push({ key: 'paragraphRhythm', ok: true, detail: { skipped: true } });
    }

    const blocked = issues.some((i) => i.severity === 'high');
    const result = {
      blocked,
      checks,
      issues,
      summary: blocked ? '章节质量门禁未通过（阻断）' : '章节质量门禁通过',
      recommendation: blocked
        ? '请先修复高危项后再继续下一章'
        : '可继续进入后续章节或中间检查点',
      thresholds: {
        aiContrastMax,
        aiAdverbMax,
        minAnchorCoverage,
        rhythmCvThreshold,
      },
    };
    if (this._qualityLedger) {
      this._attempt.s3Quality += 1;
      const highIssue = issues.find((i) => i && i.severity === 'high');
      this._qualityLedger.append({
        kind: 'quality_gate',
        stage: 'S3',
        chapterId: payload.chapterId || null,
        query: 'chapter_quality_gate',
        ok: !blocked,
        summary: result.summary,
        book_id: this._bookId,
        run_id: this._runId,
        attempt_no: this._attempt.s3Quality,
        policy_version: (this._policy && this._policy.version) || null,
        error_code: highIssue ? highIssue.code : null,
        meta: { checks, issues, thresholds: result.thresholds },
      });
    }
    return result;
  }

  skillPointers() {
    const r = (p) => path.join(this.skillRoot, p).replace(/\\/g, '/');
    return {
      workflow: r(path.join('references', '01-core', 'section-3-workflow.md')),
      searchPolicy: r(path.join('references', '05-ops', 'search-policy.json')),
      qualityPLC: r(path.join('references', '02-quality', 'quality-PLC.md')),
      qualityS: r(path.join('references', '02-quality', 'quality-S.md')),
    };
  }

  /** S0 前置：并行多路检索，覆盖竞品/读者/变现 */
  async runS0ParallelResearch(topic) {
    const auditMeta = {
      bookId: this._bookId,
      runId: this._runId,
      blocklistPath: this.bookRoot ? path.join(this.bookRoot, '.fbs', 'domain-blocklist.json') : null,
      targetDomains: extractDomainHints(topic),
      policyVersion: (this._policy && this._policy.version) || null,
      nextS0Attempt: () => {
        this._attempt.s0 += 1;
        return this._attempt.s0;
      },
    };
    return executeS0ParallelResearch({
      topic,
      webSearch: this._webSearch,
      ledger: this._ledger,
      policy: this._policyFacade.getPolicy(),
      year: new Date().getFullYear(),
      logger: this.logger,
      searchTimeoutMs: this._searchTimeoutMs,
      auditMeta,
    });
  }

  /** 单章检索门禁 */
  async runChapterResearchGate(chapterId, topic, onProgress) {
    const auditMeta = {
      bookId: this._bookId,
      runId: this._runId,
      blocklistPath: this.bookRoot ? path.join(this.bookRoot, '.fbs', 'domain-blocklist.json') : null,
      targetDomains: extractDomainHints(topic),
      policyVersion: (this._policy && this._policy.version) || null,
      nextS3Attempt: () => {
        this._attempt.s3Gate += 1;
        return this._attempt.s3Gate;
      },
    };
    return executeChapterGate({
      chapterId,
      topic,
      webSearch: this._webSearch,
      ledger: this._ledger,
      policy: this._policyFacade.getPolicy(),
      year: new Date().getFullYear(),
      logger: this.logger,
      searchTimeoutMs: this._searchTimeoutMs,
      auditMeta,
      onProgress,
    });
  }

  /** 长文档专业章：门禁 + 多角色（宿主注入 agents） */
  async runChapterWithAgents(chapterId, topic, agents, roleOrder, onProgress) {
    const progressEvents = [];
    const emitProgress = (currentStage, percent, nextAction, extra = {}) => {
      const event = {
        type: 'progress',
        ts: new Date().toISOString(),
        chapterId,
        currentStage,
        percent: clamp(percent, 0, 100, 0),
        nextAction: String(nextAction || ''),
        ...extra,
      };
      progressEvents.push(event);
      if (typeof onProgress === 'function') {
        try {
          onProgress(event);
        } catch (_) {}
      }
      return event;
    };
    const withProgress = (payload, currentStage, percent, nextAction) => ({
      ...payload,
      progress: emitProgress(currentStage, percent, nextAction),
      progressEvents: [...progressEvents],
    });

    emitProgress('preflight', 0, 'check outline and checkpoint gates');
    if (!this._outlineApproval.approved) {
      return withProgress({
        success: false,
        blocked: true,
        reason: 'OUTLINE_CONFIRMATION_REQUIRED',
        retryable: true,
        nextStep: 'confirm_outline',
        hint: 'S2→S3 硬门禁：请先执行 confirmOutlineApproval（用户显性确认大纲）',
      }, 'blocked_outline_confirmation', 0, 'call confirm_outline');
    }
    if (this._chapterState.checkpointPending) {
      return withProgress({
        success: false,
        blocked: true,
        reason: 'MID_CHECKPOINT_REQUIRED',
        retryable: true,
        nextStep: 'approve_mid_checkpoint',
        checkpoint: this._buildCheckpointSnapshot(),
      }, 'blocked_mid_checkpoint', 5, 'call approve_mid_checkpoint');
    }

    return runProfessionalChapterPipeline({
      chapterId,
      topic,
      webSearch: this._webSearch,
      ledger: this._ledger,
      policy: this._policyFacade.getPolicy(),
      year: new Date().getFullYear(),
      logger: this.logger,
      agents,
      roleOrder,
      skillPointers: this.skillPointers(),
      searchTimeoutMs: this._searchTimeoutMs,
      roleStepTimeoutMs: this._roleStepTimeoutMs,
      progressThrottleMs: this._progressThrottleMs,
      onProgress: (e) => {
        progressEvents.push(e);
        if (typeof onProgress === 'function') {
          try {
            onProgress(e);
          } catch (_) {}
        }
      },
      auditMeta: {
        bookId: this._bookId,
        runId: this._runId,
        blocklistPath: this.bookRoot ? path.join(this.bookRoot, '.fbs', 'domain-blocklist.json') : null,
        targetDomains: extractDomainHints(topic),
        policyVersion: (this._policy && this._policy.version) || null,
        nextS3Attempt: () => {
          this._attempt.s3Gate += 1;
          return this._attempt.s3Gate;
        },
      },
    }).then((result) => {
      if (result && !result.success) {
        const writerStage =
          Array.isArray(result.stages) && result.stages.find((s) => s.role === 'writer');
        if (writerStage && writerStage.pending) {
          return withProgress({
            success: false,
            blocked: true,
            reason: 'WRITER_MISSING',
            retryable: true,
            nextStep: 'inject_writer_agent',
            chapterId,
            stages: result.stages,
          }, 'blocked_writer_missing', 40, 'inject writer agent and retry');
        }
        if (writerStage && writerStage.done === false) {
          return withProgress({
            success: false,
            blocked: true,
            reason: 'WRITER_STAGE_FAILED',
            retryable: true,
            nextStep: 'fix_writer_agent_or_retry',
            chapterId,
            stages: result.stages,
          }, 'blocked_writer_failed', 45, 'fix writer agent and retry');
        }
        return withProgress(result, 'pipeline_blocked', 50, 'inspect pipeline stages');
      }
      if (result && result.success) {
        const writerStage =
          Array.isArray(result.stages) && result.stages.find((s) => s.role === 'writer');
        if (!writerStage) {
          return withProgress({
            success: false,
            blocked: true,
            reason: 'WRITER_STAGE_MISSING',
            retryable: true,
            nextStep: 'inject_writer_agent',
            chapterId,
            stages: result.stages,
          }, 'blocked_writer_stage_missing', 50, 'inject writer agent and retry');
        }
        if (writerStage.pending) {
          return withProgress({
            success: false,
            blocked: true,
            reason: 'WRITER_MISSING',
            retryable: true,
            nextStep: 'inject_writer_agent',
            chapterId,
            stages: result.stages,
          }, 'blocked_writer_missing', 50, 'inject writer agent and retry');
        }
        if (!writerStage.done) {
          return withProgress({
            success: false,
            blocked: true,
            reason: 'WRITER_STAGE_FAILED',
            retryable: true,
            nextStep: 'fix_writer_agent_or_retry',
            chapterId,
            stages: result.stages,
          }, 'blocked_writer_failed', 55, 'fix writer agent and retry');
        }
        const writerResult = writerStage.result && typeof writerStage.result === 'object' ? writerStage.result : {};
        const draft = normalizeText(writerResult.draft || writerResult.content).trim();
        if (!draft) {
          return withProgress({
            success: false,
            blocked: true,
            reason: 'EMPTY_DRAFT',
            retryable: true,
            nextStep: 'regenerate_writer_draft',
            chapterId,
            stages: result.stages,
          }, 'blocked_empty_draft', 60, 'regenerate writer draft');
        }
        emitProgress('writing_note', 72, 'persist chapter writing notes');
        const writingNote = this._saveChapterWritingNote({
          chapterId,
          topic,
          stageResult: result,
          writerResult,
        });
        if (writingNote) {
          result.writingNote = writingNote;
        }
        emitProgress('quality_gate', 84, 'evaluate chapter quality gate');
        const qualityGate = this.evaluateChapterQualityGate({
          chapterId,
          draft,
          chapterPlan: writerResult.chapterPlan || null,
          citations: writerResult.citations || [],
        });
        result.qualityGate = qualityGate;
        if (qualityGate.blocked) {
          return withProgress({
            success: false,
            blocked: true,
            reason: 'CHAPTER_QUALITY_GATE_NOT_PASSED',
            retryable: true,
            nextStep: 'revise_by_quality_gate',
            chapterId,
            qualityGate,
            stages: result.stages,
          }, 'blocked_quality_gate', 90, 'revise chapter by quality issues');
        }
      }
      if (result && result.success && chapterId) {
        this._chapterState.completed.add(chapterId);
        const completedCount = this._chapterState.completed.size;
        const reachedInterval =
          this._chapterCheckpointInterval > 0 &&
          completedCount - this._chapterState.checkpointApprovedCount >= this._chapterCheckpointInterval;
        if (reachedInterval) {
          this._chapterState.checkpointPending = true;
          this._chapterState.checkpointRequiredAtCount = completedCount;
        }
      }
      return withProgress(result, 'chapter_done', 100, 'start next chapter or checkpoint approval');
    });
  }

  /**
   * 统一入口（供路由或外部调用）
   * @param {{
   *   mode: 's0'|'chapter_gate'|'chapter_pipeline'|'confirm_outline'|'approve_mid_checkpoint'|'chapter_quality_gate'|'s5_release_gate'|'workflow_state',
   *   topic?: string,
   *   chapterId?: string,
   *   agents?: object,
   *   roleOrder?: string[],
   *   onProgress?: (e: object) => void,
   *   payload?: object,
   * }} input
   */
  async execute(input) {
    const mode = input && input.mode;
    if (mode === 's0') {
      return this.runS0ParallelResearch(input.topic || '');
    }
    if (mode === 'chapter_gate') {
      return this.runChapterResearchGate(input.chapterId || 'CH', input.topic || '', input.onProgress);
    }
    if (mode === 'chapter_pipeline') {
      return this.runChapterWithAgents(
        input.chapterId || 'CH',
        input.topic || '',
        input.agents,
        input.roleOrder,
        input.onProgress
      );
    }
    if (mode === 'confirm_outline') {
      return this.confirmOutlineApproval(input.payload || {});
    }
    if (mode === 'approve_mid_checkpoint') {
      return this.approveMidCheckpoint(input.payload || {});
    }
    if (mode === 'chapter_quality_gate') {
      return this.evaluateChapterQualityGate(input.payload || {});
    }
    if (mode === 's5_release_gate') {
      return this._validateS5ReleaseGate(input.payload || {});
    }
    if (mode === 'workflow_state') {
      return this.getWorkflowState();
    }
    return {
      error: 'UNKNOWN_MODE',
      modes: [
        's0',
        'chapter_gate',
        'chapter_pipeline',
        'confirm_outline',
        'approve_mid_checkpoint',
        'chapter_quality_gate',
        's5_release_gate',
        'workflow_state',
      ],
    };
  }

  async healthCheck() {
    return {
      healthy: !!this._webSearch,
      name: 'BookWorkflowOrchestrator',
      hasWebSearch: !!this._webSearch,
      hasLedger: !!this._ledger,
      hasQualityLedger: !!this._qualityLedger,
      skillRoot: this.skillRoot,
      searchTimeoutMs: this._searchTimeoutMs ?? DEFAULT_SEARCH_TIMEOUT_MS,
      roleStepTimeoutMs: this._roleStepTimeoutMs,
      runId: this._runId,
      outlineApproved: this._outlineApproval.approved,
      chapterCheckpointInterval: this._chapterCheckpointInterval,
      checkpointPending: this._chapterState.checkpointPending,
      completedChapterCount: this._chapterState.completed.size,
    };
  }

  _saveChapterWritingNote({ chapterId, topic, stageResult, writerResult }) {
    if (!this.bookRoot) return null;
    try {
      const citationList = Array.isArray(writerResult && writerResult.citations) ? writerResult.citations : [];
      const adopted = citationList
        .map((c) => ({
          title: c && (c.title || c.report || c.org || c.url) ? c.title || c.report || c.org || c.url : '未命名来源',
          url: c && c.url ? c.url : null,
          summary: c && (c.summary || c.note || c.snippet) ? c.summary || c.note || c.snippet : '（无摘要）',
        }))
        .filter((x) => x.url);
      const researcherStage =
        stageResult &&
        Array.isArray(stageResult.stages) &&
        stageResult.stages.find((s) => s && s.role === 'researcher' && s.detail && Array.isArray(s.detail.results));
      const gateAccepted = researcherStage
        ? researcherStage.detail.results
            .filter((r) => r && r.ok)
            .slice(0, 8)
            .map((r, idx) => ({
              idx: idx + 1,
              query: r.query || '',
              summary: r.summary || '',
            }))
        : [];

      const notesDir = path.join(this.bookRoot, '.fbs', 'writing-notes');
      fs.mkdirSync(notesDir, { recursive: true });
      const token = sanitizeFileToken(chapterId, 'chapter');
      const noteFile = `${token}.writing-notes.md`;
      const notePath = path.join(notesDir, noteFile);
      const now = new Date().toISOString();
      const lines = [];
      lines.push(`# 写作笔记 · ${chapterId || 'CH'}`);
      lines.push('');
      lines.push(`- 主题：${topic || '未提供'}`);
      lines.push(`- 记录时间：${now}`);
      lines.push(`- run_id：${this._runId}`);
      lines.push('');
      lines.push('## 采纳网页与摘要（事实证据）');
      if (adopted.length === 0) {
        lines.push('');
        lines.push('- 无可用 URL 引用（本章未提供 citations.url）。');
      } else {
        adopted.forEach((a, i) => {
          lines.push('');
          lines.push(`${i + 1}. [${a.title}](${a.url})`);
          lines.push(`   - 摘要：${String(a.summary).replace(/\r?\n/g, ' ').slice(0, 500)}`);
        });
      }
      lines.push('');
      lines.push('## 检索门禁通过项（摘录）');
      if (gateAccepted.length === 0) {
        lines.push('');
        lines.push('- 无（门禁结果未返回可用摘要）。');
      } else {
        gateAccepted.forEach((g) => {
          lines.push('');
          lines.push(`- Q${g.idx}: ${g.query}`);
          lines.push(`  - 摘要：${String(g.summary).replace(/\r?\n/g, ' ').slice(0, 300)}`);
        });
      }
      lines.push('');
      lines.push('> 说明：该文件用于过程资产沉淀与事实来源追溯。');
      fs.writeFileSync(notePath, `${lines.join('\n')}\n`, 'utf8');
      return {
        file: path.relative(this.bookRoot, notePath).replace(/\\/g, '/'),
        adoptedCount: adopted.length,
      };
    } catch (e) {
      this.logger.warn('[BookWorkflowOrchestrator] write chapter note failed', e && e.message ? e.message : e);
      return null;
    }
  }
}

function createDefaultBookWorkflowEngine(options) {
  return new BookWorkflowOrchestrator(options);
}

module.exports = {
  BookWorkflowOrchestrator,
  createDefaultBookWorkflowEngine,
};
