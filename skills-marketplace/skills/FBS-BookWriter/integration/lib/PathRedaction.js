/**
 * 绝对路径脱敏：用于 digest / 环境快照落盘或外传，降低用户目录泄露风险。
 */

'use strict';

const crypto = require('crypto');
const path = require('path');

function fp(s) {
  return crypto.createHash('sha256').update(String(s), 'utf8').digest('hex').slice(0, 12);
}

function basenameOnly(p) {
  try {
    const n = path.basename(String(p).replace(/\\/g, path.sep));
    return n || 'path';
  } catch {
    return 'path';
  }
}

/** @param {string} s */
function redactStringContent(s) {
  if (typeof s !== 'string' || !s) return s;
  let out = s;
  out = out.replace(/[A-Za-z]:\\(?:[^\\\n\r]+\\)*[^\\\n\r]*/g, (m) => {
    return `<REDACTED_WIN fp="${fp(m)}" tail="${basenameOnly(m)}" />`;
  });
  out = out.replace(/\/(?:Users|home)\/[^/\s"']+(?:\/[^/\n\r"']+)*/g, (m) => {
    return `<REDACTED_UNIX fp="${fp(m)}" tail="${basenameOnly(m)}" />`;
  });
  return out;
}

/**
 * @param {unknown} val
 * @returns {unknown}
 */
function redactDeep(val) {
  if (val === null || val === undefined) return val;
  if (typeof val === 'string') return redactStringContent(val);
  if (Array.isArray(val)) return val.map((x) => redactDeep(x));
  if (typeof val === 'object') {
    const o = {};
    for (const [k, v] of Object.entries(val)) {
      o[k] = redactDeep(v);
    }
    return o;
  }
  return val;
}

/**
 * @param {object} digestOrSnapshot plain object (will be cloned)
 * @returns {object}
 */
function redactJsonObject(digestOrSnapshot) {
  const clone = JSON.parse(JSON.stringify(digestOrSnapshot));
  return redactDeep(clone);
}

module.exports = {
  redactStringContent,
  redactDeep,
  redactJsonObject,
  fp,
};
