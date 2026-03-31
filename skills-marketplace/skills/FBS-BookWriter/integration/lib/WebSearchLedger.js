/**
 * 检索账本：JSONL 追加，便于长文档项目审计「每章是否满足门禁」
 */

'use strict';

const fs = require('fs');
const path = require('path');

class WebSearchLedger {
  /**
   * @param {{ projectRoot: string, fileRelative?: string }} options
   */
  constructor(options) {
    if (!options || !options.projectRoot) {
      throw new Error('WebSearchLedger requires projectRoot');
    }
    this.projectRoot = path.resolve(options.projectRoot);
    this.fileRelative = options.fileRelative || path.join('.fbs', 'search-ledger.jsonl');
    this.ledgerPath = path.join(this.projectRoot, this.fileRelative);
    this._ensureDir();
  }

  _ensureDir() {
    const dir = path.dirname(this.ledgerPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * @param {{
   *   stage: string,
   *   chapterId?: string|null,
   *   query: string,
   *   ok?: boolean,
   *   summary?: string,
   *   meta?: object
   * }} entry
   */
  append(entry) {
    const line = JSON.stringify({
      ts: new Date().toISOString(),
      ...entry,
    });
    fs.appendFileSync(this.ledgerPath, line + '\n', 'utf8');
  }

  /** @returns {Array<object>} */
  readAll() {
    if (!fs.existsSync(this.ledgerPath)) return [];
    const text = fs.readFileSync(this.ledgerPath, 'utf8');
    return text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        try {
          return JSON.parse(l);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  }

  countQueriesForChapter(chapterId) {
    if (!chapterId) return 0;
    return this.readAll().filter((e) => e.chapterId === chapterId && e.kind === 'search').length;
  }

  meetsChapterMin(chapterId, minQueries) {
    return this.countQueriesForChapter(chapterId) >= minQueries;
  }
}

module.exports = { WebSearchLedger };
