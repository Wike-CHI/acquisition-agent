/**
 * Humanoid Memory Configuration
 *
 * V3 - Brain-inspired memory system with:
 * - V-score: Memory consolidation based on C( coherence), S(significance), N(noise), M(resonance)
 * - Tensor resonance: Similarity-based memory fusion
 * - Ebbinghaus forgetting: Exponential decay over time
 */

export const DEFAULT_CONFIG = {
  // Storage
  db_store_path: null, // Will be set by MemoryManager

  // Weights: Breaking "echo chamber", S (Significance) is king!
  w_c: 1.0,   // C (Coherence) - fluency
  w_s: 1.8,   // S (Significance) - absolute value (highest weight!)
  w_n: 1.2,   // N (Noise) - penalty
  w_m: 0.8,   // M (Memory Resonance) - tensor fusion bonus

  // Thresholds
  v_threshold: 0.50,              // Memory consolidation threshold
  forget_rate: 0.005,             // Ebbinghaus decay coefficient
  death_threshold: 0.1,           // Physical deletion threshold
  m_consolidation_threshold: 8.5, // Trigger fusion at M > 8.5
  m_extreme_repeat_threshold: 9.5 // Trigger consolidation-only at M > 9.5

  // Retrieval
  retrieval_top_k: 3,             // Number of similar memories to retrieve
  retrieval_decay_top_k: 2        // Top memories to return with decay
};

/**
 * Custom significance description for S evaluation
 * Can be customized based on use case
 */
export const DEFAULT_S_DESC = "Does this contain user's personal emotions, daily chatter, relationships, or preferences? Natural conversations should score high.";

export class HumanoidConfig {
  constructor(options = {}) {
    this.w_c = options.w_c ?? DEFAULT_CONFIG.w_c;
    this.w_s = options.w_s ?? DEFAULT_CONFIG.w_s;
    this.w_n = options.w_n ?? DEFAULT_CONFIG.w_n;
    this.w_m = options.w_m ?? DEFAULT_CONFIG.w_m;

    this.v_threshold = options.v_threshold ?? DEFAULT_CONFIG.v_threshold;
    this.forget_rate = options.forget_rate ?? DEFAULT_CONFIG.forget_rate;
    this.death_threshold = options.death_threshold ?? DEFAULT_CONFIG.death_threshold;
    this.m_consolidation_threshold = options.m_consolidation_threshold ?? DEFAULT_CONFIG.m_consolidation_threshold;
    this.m_extreme_repeat_threshold = options.m_extreme_repeat_threshold ?? DEFAULT_CONFIG.m_extreme_repeat_threshold;

    this.s_desc = options.s_desc ?? DEFAULT_S_DESC;
  }

  /**
   * Create config from environment variables or defaults
   */
  static fromEnv() {
    return new HumanoidConfig({
      w_c: parseFloat(process.env.HUMANOID_W_C) || DEFAULT_CONFIG.w_c,
      w_s: parseFloat(process.env.HUMANOID_W_S) || DEFAULT_CONFIG.w_s,
      w_n: parseFloat(process.env.HUMANOID_W_N) || DEFAULT_CONFIG.w_n,
      w_m: parseFloat(process.env.HUMANOID_W_M) || DEFAULT_CONFIG.w_m,
      v_threshold: parseFloat(process.env.HUMANOID_V_THRESHOLD) || DEFAULT_CONFIG.v_threshold,
      forget_rate: parseFloat(process.env.HUMANOID_FORGET_RATE) || DEFAULT_CONFIG.forget_rate,
      death_threshold: parseFloat(process.env.HUMANOID_DEATH_THRESHOLD) || DEFAULT_CONFIG.death_threshold,
      m_consolidation_threshold: parseFloat(process.env.HUMANOID_M_CONSOLIDATION) || DEFAULT_CONFIG.m_consolidation_threshold,
      m_extreme_repeat_threshold: parseFloat(process.env.HUMANOID_M_EXTREME) || DEFAULT_CONFIG.m_extreme_repeat_threshold,
      s_desc: process.env.HUMANOID_S_DESC || DEFAULT_S_DESC
    });
  }
}
