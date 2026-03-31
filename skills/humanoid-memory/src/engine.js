/**
 * Cognitive Engine - Core memory orchestration
 *
 * Manages the lifecycle of memories:
 * 1. Perceive: Add to pending queue
 * 2. Sleep: Process queue - evaluate, fuse, consolidate
 * 3. Recall: Retrieve relevant memories
 * 4. Garbage Collect: Remove decayed memories
 */

import { v4 as uuidv4 } from 'uuid';
import { calculatePhysicalM, calculateVScore, calculateEffectiveV, distanceToSimilarity } from './physics.js';

/**
 * Cognitive Engine
 */
export class CognitiveEngine {
  constructor(options = {}) {
    this.config = options.config;
    this.storage = options.storage;
    this.getEmbedding = options.getEmbedding; // Function to get embedding
    this.evaluator = options.evaluator;     // CSN Evaluator
    this.getEmbeddingFromTexts = options.getEmbeddingFromTexts; // Batch embedding

    this.pendingQueue = [];
  }

  /**
   * Perceive: Add user-AI interaction to pending queue
   */
  perceive(userText, aiText) {
    const item = {
      id: uuidv4(),
      user_text: userText,
      ai_text: aiText,
      timestamp: Date.now()
    };

    this.pendingQueue.push(item);
    return item.id;
  }

  /**
   * Sleep: Process pending queue
   * - Check tensor resonance (M)
   * - Evaluate C, S, N via LLM
   * - Calculate V-score
   * - Consolidate or discard
   */
  async sleep() {
    if (this.pendingQueue.length === 0) {
      return { processed: 0, stored: 0, fused: 0, discarded: 0 };
    }

    console.log(`\n🌙 [Sleep] Processing ${this.pendingQueue.length} memories...`);

    let stored = 0;
    let fused = 0;
    let discarded = 0;

    while (this.pendingQueue.length > 0) {
      const item = this.pendingQueue.shift();

      try {
        const result = await this._processItem(item);
        if (result.action === 'stored') stored++;
        else if (result.action === 'fused') fused++;
        else discarded++;
      } catch (error) {
        console.error(`[Sleep] Error processing item: ${error.message}`);
        discarded++;
      }
    }

    // Garbage collect after processing
    const removed = await this.garbageCollect();

    console.log(`🏁 [Sleep] Done. stored:${stored} fused:${fused} discarded:${discarded} gc:${removed}`);

    return { processed: stored + fused + discarded, stored, fused, discarded, gc: removed };
  }

  /**
   * Process a single memory item
   */
  async _processItem(item) {
    const { id, user_text, ai_text, timestamp } = item;

    // 1. Get embedding for user text
    const currentVec = await this.getEmbedding(user_text);

    // 2. Check tensor resonance with existing memories
    let M = 5.0;
    let bestMatch = null;

    if (this.storage.count() > 0) {
      const candidates = this.storage.search(currentVec, 3, 0.3);

      if (candidates.length > 0) {
        // Calculate M for the best match
        M = calculatePhysicalM(currentVec, candidates.map(c => c.vector || c.metadata?.vector));
        bestMatch = candidates[0];
      }
    }

    // 3. Check for fusion/consolidation
    if (M > this.config.m_consolidation_threshold && bestMatch) {
      return this._fuseMemory(item, bestMatch, M, currentVec);
    }

    // 4. Evaluate via LLM
    let C, S, N;
    try {
      const evaluation = await this.evaluator.evaluate(user_text);
      C = evaluation.C;
      S = evaluation.S;
      N = evaluation.N;
    } catch (error) {
      console.warn(`[Engine] LLM evaluation failed: ${error.message}`);
      C = 5; S = 5; N = 5;
    }

    // 5. Calculate V-score
    const vScore = calculateVScore(C, S, N, M, {
      w_c: this.config.w_c,
      w_s: this.config.w_s,
      w_n: this.config.w_n,
      w_m: this.config.w_m
    });

    // 6. Consolidate or discard
    if (vScore >= this.config.v_threshold) {
      this.storage.add(user_text, ai_text, currentVec, {
        id,
        timestamp,
        initial_v: vScore,
        C, S, N, M
      });

      console.log(`  ✅ [Consolidated] V:${vScore.toFixed(2)} C:${C} S:${S} N:${N} M:${M.toFixed(1)} | ${user_text.substring(0, 30)}...`);

      return { action: 'stored', vScore };
    } else {
      console.log(`  🗑️ [Discarded] V:${vScore.toFixed(2)} C:${C} S:${S} N:${N} M:${M.toFixed(1)} | ${user_text.substring(0, 30)}...`);

      return { action: 'discarded', vScore };
    }
  }

  /**
   * Fuse new memory with existing (similarity > threshold)
   */
  async _fuseMemory(item, bestMatch, M, currentVec) {
    const { user_text, ai_text, timestamp } = item;

    if (M > this.config.m_extreme_repeat_threshold) {
      // Extreme repeat: reinforce old memory, update ai_text only
      this.storage.update(bestMatch.id, {
        timestamp,
        ai_text,
        initial_v: Math.min(1.0, (bestMatch.metadata?.initial_v || 0.5) + 0.1)
      });

      console.log(`  🚫 [Extreme Repeat] M:${M.toFixed(1)} reinforced | ${user_text.substring(0, 30)}...`);

      return { action: 'fused', type: 'reinforced' };
    } else {
      // Similar: fuse user texts
      const fusedText = `${bestMatch.user_text}; ${user_text}`;
      const fusedVec = await this.getEmbedding(fusedText);

      this.storage.updateVector(bestMatch.id, fusedVec, fusedText);
      this.storage.update(bestMatch.id, {
        timestamp,
        ai_text,
        initial_v: Math.min(1.0, (bestMatch.metadata?.initial_v || 0.5) + 0.1)
      });

      console.log(`  🔄 [Fused] M:${M.toFixed(1)} merged | ${fusedText.substring(0, 30)}...`);

      return { action: 'fused', type: 'fused' };
    }
  }

  /**
   * Recall: Retrieve relevant memories for a query
   */
  async recall(query, topK = 2) {
    if (this.storage.count() === 0) {
      return [];
    }

    // Get query embedding
    const queryVec = await this.getEmbedding(query);

    // Search for similar memories
    const candidates = this.storage.search(queryVec, topK * 3, 0.3);

    const now = Date.now();
    const scoredMemories = [];

    for (const candidate of candidates) {
      const metadata = candidate.metadata || {};

      // Calculate decay
      const hoursElapsed = (now - metadata.timestamp) / (1000 * 60 * 60);
      const decayFactor = Math.exp(-this.config.forget_rate * hoursElapsed);

      // Calculate retrieval weight
      const distance = 1 - candidate.similarity;
      const simScore = distanceToSimilarity(distance);
      const initialV = metadata.initial_v || 0.5;

      const finalWeight = simScore * initialV * decayFactor;

      scoredMemories.push({
        id: candidate.id,
        text: candidate.user_text,
        ai_text: candidate.ai_text,
        similarity: candidate.similarity,
        initial_v: initialV,
        decay_factor: decayFactor,
        final_weight: finalWeight,
        metadata
      });
    }

    // Sort by final weight
    scoredMemories.sort((a, b) => b.final_weight - a.final_weight);

    // Reinforce top memories (update timestamp and initial_v)
    const topMemories = scoredMemories.slice(0, topK);
    for (const memory of topMemories) {
      this.storage.update(memory.id, {
        timestamp: now,
        initial_v: Math.min(1.0, memory.initial_v + 0.05)
      });
    }

    return topMemories;
  }

  /**
   * Garbage collect: Remove memories below death threshold
   */
  async garbageCollect() {
    if (this.storage.count() === 0) {
      return 0;
    }

    const allMemories = this.storage.getAll();
    const now = Date.now();
    const toDelete = [];

    for (const memory of allMemories) {
      const metadata = memory.metadata || {};
      const hoursElapsed = (now - metadata.timestamp) / (1000 * 60 * 60);
      const effectiveV = calculateEffectiveV(
        metadata.initial_v || 0.5,
        hoursElapsed,
        this.config.forget_rate
      );

      if (effectiveV < this.config.death_threshold) {
        toDelete.push(memory.id);
      }
    }

    for (const id of toDelete) {
      this.storage.delete(id);
    }

    if (toDelete.length > 0) {
      console.log(`💀 [GC] Removed ${toDelete.length} decayed memories`);
    }

    return toDelete.length;
  }

  /**
   * Wipe: Clear all memories
   */
  wipe() {
    this.storage.clear();
    console.log('💣 [Wipe] All memories erased');
  }

  /**
   * Get pending queue size
   */
  pendingSize() {
    return this.pendingQueue.length;
  }
}
