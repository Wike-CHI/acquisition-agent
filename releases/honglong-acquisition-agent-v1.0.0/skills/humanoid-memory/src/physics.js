/**
 * Humanoid Physics - Core mathematical algorithms
 *
 * Pure mathematical calculations, no AI model dependencies:
 * - V-score: Sigmoid collapse formula
 * - Tensor resonance (M): Cosine similarity
 * - Ebbinghaus forgetting: Exponential decay
 */

import { dotProduct, magnitude, cosineSimilarity } from './utils/math.js';

/**
 * Calculate V-score (memory consolidation score)
 * V = 1 / (1 + e^-(wc*C + ws*S + wm*M - wn*N))
 *
 * @param {number} C - Coherence score (0-10)
 * @param {number} S - Significance score (0-10)
 * @param {number} N - Noise score (0-10)
 * @param {number} M - Memory resonance score (0-10)
 * @param {Object} weights - {w_c, w_s, w_n, w_m}
 * @returns {number} V-score (0-1)
 */
export function calculateVScore(C, S, N, M, weights) {
  const { w_c, w_s, w_n, w_m } = weights;

  // Normalize to [-2.5, 2.5] centered at 0
  const norm_c = (C - 5) / 2.0;
  const norm_s = (S - 5) / 2.0;
  const norm_n = (N - 5) / 2.0;

  // Anti echo-chamber: Non-linear penalty for extreme M values
  let norm_m;
  if (M > 9.0) {
    norm_m = -2.0; // Extreme repeat penalty
  } else if (M < 3.0) {
    norm_m = -1.0; // Low resonance penalty
  } else {
    norm_m = (M - 5) / 2.0;
  }

  // Logit calculation
  const logit = (w_c * norm_c) + (w_s * norm_s) + (w_m * norm_m) - (w_n * norm_n);

  // Sigmoid
  return 1.0 / (1.0 + Math.exp(-logit));
}

/**
 * Calculate tensor resonance (M) - cosine similarity scaled to [0, 10]
 *
 * @param {number[]} newVec - New memory embedding
 * @param {number[][]} oldVecs - Previous memory embeddings
 * @returns {number} M score (0-10)
 */
export function calculatePhysicalM(newVec, oldVecs) {
  if (!oldVecs || oldVecs.length === 0) {
    return 5.0; // Default M when no old memories
  }

  // Calculate similarities to all old memories
  const similarities = oldVecs.map(oldVec => cosineSimilarity(newVec, oldVec));

  // Use max similarity (conservative approach)
  const maxSim = Math.max(...similarities);

  // Scale to [0, 10] range
  const mScore = maxSim * 10.0;

  // Clamp to [0, 10]
  return Math.max(0.0, Math.min(10.0, mScore));
}

/**
 * Calculate Ebbinghaus forgetting curve decay factor
 * decay = exp(-forget_rate * hours_elapsed)
 *
 * @param {number} hoursElapsed - Hours since memory was stored
 * @param {number} forgetRate - Decay coefficient
 * @returns {number} Decay factor (0-1)
 */
export function calculateEbbinghausDecay(hoursElapsed, forgetRate) {
  return Math.exp(-forgetRate * hoursElapsed);
}

/**
 * Calculate effective memory value after decay
 * effective_v = initial_v * decay
 *
 * @param {number} initialV - Initial V-score when stored
 * @param {number} hoursElapsed - Hours since stored
 * @param {number} forgetRate - Decay coefficient
 * @returns {number} Effective V after decay
 */
export function calculateEffectiveV(initialV, hoursElapsed, forgetRate) {
  return initialV * calculateEbbinghausDecay(hoursElapsed, forgetRate);
}

/**
 * Calculate retrieval weight for a memory
 * Combines similarity, initial V, and decay
 *
 * @param {number} similarity - Cosine similarity (0-1)
 * @param {number} initialV - Initial V-score
 * @param {number} decayFactor - Ebbinghaus decay factor
 * @returns {number} Final retrieval weight
 */
export function calculateRetrievalWeight(similarity, initialV, decayFactor) {
  return similarity * initialV * decayFactor;
}

/**
 * Convert distance to similarity score
 * sim = 1 / (1 + dist)
 *
 * @param {number} distance - Vector distance
 * @returns {number} Similarity score
 */
export function distanceToSimilarity(distance) {
  return 1.0 / (1.0 + distance);
}
