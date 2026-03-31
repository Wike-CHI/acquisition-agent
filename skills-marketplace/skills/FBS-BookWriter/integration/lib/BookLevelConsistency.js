/**
 * 全书级一致性（C0）中与编排层可对齐的部分：全书破折号（——）密度。
 * 与 references/02-quality/book-level-consistency.md、quality-S.md S6 阈值一致。
 */

'use strict';

function stripFencedCode(text) {
  return String(text || '').replace(/```[\s\S]*?```/g, ' ');
}

/** 近似「正文字数」：CJK 统一表意文字 + 全角字符（与 quality 文档「千字」口径可比对） */
function countBodyUnits(text) {
  const t = stripFencedCode(text);
  const m = t.match(/[\u4e00-\u9fff\u3400-\u4dbf\uff00-\uffef]/g);
  return m ? m.length : 0;
}

function countEmDashPairs(text) {
  const t = stripFencedCode(text);
  const m = t.match(/——/g);
  return m ? m.length : 0;
}

/**
 * @param {string} fullManuscriptText
 * @param {{ warnAbove?: number, blockAbove?: number }} [opts]
 * @returns {{
 *   emDashCount: number,
 *   bodyUnits: number,
 *   perThousand: number|null,
 *   level: 'ok'|'warn'|'block'|'empty',
 * }}
 */
function evaluateEmDashBookLevel(fullManuscriptText, opts = {}) {
  const warnAbove = Number.isFinite(Number(opts.warnAbove)) ? Number(opts.warnAbove) : 1;
  const blockAbove = Number.isFinite(Number(opts.blockAbove)) ? Number(opts.blockAbove) : 3;
  const body = countBodyUnits(fullManuscriptText);
  const em = countEmDashPairs(fullManuscriptText);
  if (body <= 0) {
    return {
      emDashCount: em,
      bodyUnits: body,
      perThousand: em > 0 ? null : 0,
      level: em > 0 ? 'block' : 'empty',
    };
  }
  const perThousand = (em / body) * 1000;
  let level = 'ok';
  if (perThousand > blockAbove) level = 'block';
  else if (perThousand > warnAbove) level = 'warn';
  return { emDashCount: em, bodyUnits: body, perThousand, level };
}

module.exports = {
  stripFencedCode,
  countBodyUnits,
  countEmDashPairs,
  evaluateEmDashBookLevel,
};
