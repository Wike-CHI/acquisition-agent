/**
 * FBS-BookWriter — 成员心跳状态（文件后端，供 team-lead / 宿主注入 ScenarioManager）
 * 规范对齐：references/05-ops/heartbeat-protocol.md、test-reports/03·08
 *
 * 成员通过更新 .fbs/member-heartbeats.json 汇报；本类负责读取与超时判定。
 * 非 WorkBuddy 内置定时器：可由外部 cron/宿主每 30s 调用 evaluate()。
 */
'use strict';

const fs = require('fs');
const path = require('path');

const DEFAULT_WARN_MS = 120_000;
const DEFAULT_CRIT_MS = 300_000;

class HeartbeatService {
  /**
   * @param {Object} opts
   * @param {string} opts.bookRoot - 本书根目录（须含 .fbs）
   * @param {string} [opts.relativeStateFile=.fbs/member-heartbeats.json]
   * @param {number} [opts.warnAfterMs=120000]
   * @param {number} [opts.criticalAfterMs=300000]
   */
  constructor(opts = {}) {
    if (!opts.bookRoot || typeof opts.bookRoot !== 'string') {
      throw new Error('HeartbeatService: bookRoot 必填');
    }
    this.bookRoot = path.resolve(opts.bookRoot);
    this.relativeStateFile = opts.relativeStateFile || path.join('.fbs', 'member-heartbeats.json');
    this.statePath = path.join(this.bookRoot, this.relativeStateFile.replace(/\//g, path.sep));
    this.warnAfterMs = opts.warnAfterMs ?? DEFAULT_WARN_MS;
    this.criticalAfterMs = opts.criticalAfterMs ?? DEFAULT_CRIT_MS;
  }

  _readState() {
    if (!fs.existsSync(this.statePath)) {
      return { version: 1, members: {} };
    }
    try {
      const j = JSON.parse(fs.readFileSync(this.statePath, 'utf8'));
      if (!j || typeof j !== 'object') return { version: 1, members: {} };
      if (!j.members) j.members = {};
      return j;
    } catch {
      return { version: 1, members: {}, _parseError: true };
    }
  }

  _writeState(j) {
    const dir = path.dirname(this.statePath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(this.statePath, JSON.stringify(j, null, 2) + '\n', 'utf8');
  }

  /**
   * 记录或更新成员心跳（可由 CLI / 宿主在收到 send_message 后调用）
   * @param {string} memberId
   * @param {Object} [payload]
   */
  recordHeartbeat(memberId, payload = {}) {
    if (!memberId || typeof memberId !== 'string') return false;
    const j = this._readState();
    const now = new Date().toISOString();
    j.members[memberId] = {
      lastHeartbeat: now,
      ...(typeof payload === 'object' && payload ? payload : {}),
    };
    j.updatedAt = now;
    this._writeState(j);
    return true;
  }

  /**
   * @returns {{ ok: boolean, stale: Array<{id:string, elapsedMs:number, level:'warn'|'critical'}>, now: string }}
   */
  evaluate() {
    const j = this._readState();
    const nowMs = Date.now();
    const stale = [];
    for (const [id, row] of Object.entries(j.members || {})) {
      const raw = row.lastHeartbeat || row.ts || row.timestamp;
      if (!raw) continue;
      const t = Date.parse(raw);
      if (Number.isNaN(t)) continue;
      const elapsedMs = nowMs - t;
      if (elapsedMs >= this.criticalAfterMs) {
        stale.push({ id, elapsedMs, level: 'critical' });
      } else if (elapsedMs >= this.warnAfterMs) {
        stale.push({ id, elapsedMs, level: 'warn' });
      }
    }
    return {
      ok: stale.length === 0,
      stale,
      now: new Date().toISOString(),
      statePath: this.statePath,
    };
  }
}

module.exports = { HeartbeatService, DEFAULT_WARN_MS, DEFAULT_CRIT_MS };
