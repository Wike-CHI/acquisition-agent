/**
 * Math utilities - Pure mathematical functions
 */

/**
 * Dot product of two vectors
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number}
 */
export function dotProduct(a, b) {
  if (a.length !== b.length) {
    throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
  }
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
}

/**
 * Magnitude (L2 norm) of a vector
 * @param {number[]} a
 * @returns {number}
 */
export function magnitude(a) {
  return Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
}

/**
 * Cosine similarity between two vectors
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number} Similarity in [-1, 1]
 */
export function cosineSimilarity(a, b) {
  const magA = magnitude(a);
  const magB = magnitude(b);

  if (magA === 0 || magB === 0) {
    return 0; // Edge case: zero vector
  }

  return dotProduct(a, b) / (magA * magB);
}

/**
 * Normalize a vector to unit length
 * @param {number[]} a
 * @returns {number[]}
 */
export function normalize(a) {
  const mag = magnitude(a);
  if (mag === 0) return a;
  return a.map(val => val / mag);
}

/**
 * Euclidean distance between two vectors
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number}
 */
export function euclideanDistance(a, b) {
  if (a.length !== b.length) {
    throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
  }
  return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
}
