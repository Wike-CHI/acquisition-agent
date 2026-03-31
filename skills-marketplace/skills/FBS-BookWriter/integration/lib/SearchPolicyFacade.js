/**
 * 加载并暴露 search-policy.json（与 SKILL / section-3-workflow 对齐）
 */

'use strict';

const fs = require('fs');
const path = require('path');

class SearchPolicyFacade {
  /**
   * @param {{ skillRoot: string, policyRelativePath?: string }} options
   */
  constructor(options) {
    if (!options || !options.skillRoot) {
      throw new Error('SearchPolicyFacade requires skillRoot');
    }
    this.skillRoot = path.resolve(options.skillRoot);
    const rel = options.policyRelativePath || path.join('references', '05-ops', 'search-policy.json');
    this.policyPath = path.join(this.skillRoot, rel);
    this._policy = null;
    this._load();
  }

  _load() {
    const raw = fs.readFileSync(this.policyPath, 'utf8');
    this._policy = JSON.parse(raw);
  }

  getPolicy() {
    return this._policy;
  }

  getMandatoryStages() {
    return this._policy.mandatoryWebSearchStages || [];
  }

  getMinQueriesPerChapter() {
    const n = this._policy.chapterWriting && this._policy.chapterWriting.minQueriesPerChapter;
    return typeof n === 'number' && n >= 0 ? n : 2;
  }

  getS0ParallelCounts() {
    return (
      this._policy.s0ParallelQueries || {
        competitorDomestic: 3,
        competitorOverseas: 3,
        readerAnalysis: 4,
        monetization: 4,
      }
    );
  }

  /** @returns {Record<string, unknown> | null} search-policy.json 的 topicLock 节；缺省时 null */
  getTopicLock() {
    const t = this._policy.topicLock;
    return t && typeof t === "object" ? t : null;
  }

  /** @returns {Record<string, unknown> | null} userMemoryIntegration 节（WorkBuddy 记忆摄取策略） */
  getUserMemoryIntegration() {
    const u = this._policy.userMemoryIntegration;
    return u && typeof u === "object" ? u : null;
  }

  /** @returns {Record<string, unknown> | null} environmentSnapshot 节 */
  getEnvironmentSnapshot() {
    const e = this._policy.environmentSnapshot;
    return e && typeof e === "object" ? e : null;
  }
}

module.exports = { SearchPolicyFacade };
