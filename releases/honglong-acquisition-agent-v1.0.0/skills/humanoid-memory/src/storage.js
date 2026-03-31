/**
 * Humanoid Storage - Memory persistence layer
 *
 * Features:
 * - HNSW index for fast vector search
 * - JSON file persistence for metadata
 * - Dual-track: user_text (document) + ai_text (metadata)
 */

import { readFile, writeFile, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { HNSW, FlatIndex } from './hnsw.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Memory Store - Vector database + metadata
 */
export class MemoryStore {
  constructor(options = {}) {
    this.dataDir = options.dataDir || join(__dirname, '..', 'data');
    this.agentWallet = options.agentWallet || 'default';
    this.dimension = options.dimension || 768;

    // Create data directory
    if (!existsSync(this.dataDir)) {
      mkdirSync(this.dataDir, { recursive: true });
    }

    // Storage paths
    this.indexPath = join(this.dataDir, `${this.agentWallet}_index.json`);
    this.memoriesPath = join(this.dataDir, `${this.agentWallet}_memories.json`);

    // Initialize index (use FlatIndex for small datasets, HNSW for large)
    this.useHNSW = options.useHNSW !== false && this.dimension > 0;
    this.index = this.useHNSW
      ? new HNSW({ dimension: this.dimension, m: 8, efConstruction: 100 })
      : new FlatIndex({ dimension: this.dimension });

    // Memory metadata storage
    this.memories = new Map();

    // Load existing data
    this._load();
  }

  /**
   * Add a memory to the store
   */
  add(userText, aiText, vector, metadata = {}) {
    const id = metadata.id || this._generateId();

    const memoryItem = {
      id,
      user_text: userText,
      ai_text: aiText,
      vector,
      metadata: {
        ...metadata,
        timestamp: metadata.timestamp || Date.now(),
        initial_v: metadata.initial_v || 0.5
      }
    };

    // Add to vector index
    this.index.add(id, vector, {
      user_text: userText,
      ai_text: aiText
    });

    // Store metadata
    this.memories.set(id, memoryItem);

    // Persist
    this._save();

    return id;
  }

  /**
   * Search for similar memories
   */
  search(queryVector, topK = 3, minSimilarity = 0.5) {
    const results = this.index.search(queryVector, topK * 3); // Get more for filtering

    return results
      .filter(r => r.similarity >= minSimilarity)
      .map(r => {
        const memory = this.memories.get(r.id);
        if (!memory) return null;

        return {
          id: r.id,
          user_text: memory.user_text,
          ai_text: memory.ai_text,
          similarity: r.similarity,
          metadata: memory.metadata
        };
      })
      .filter(Boolean)
      .slice(0, topK);
  }

  /**
   * Get memory by ID
   */
  get(id) {
    return this.memories.get(id) || null;
  }

  /**
   * Get all memories
   */
  getAll() {
    return Array.from(this.memories.values());
  }

  /**
   * Update memory metadata
   */
  update(id, updates) {
    const memory = this.memories.get(id);
    if (!memory) return false;

    memory.metadata = { ...memory.metadata, ...updates };
    this.memories.set(id, memory);
    this._save();

    return true;
  }

  /**
   * Update memory vector (after fusion)
   */
  updateVector(id, newVector, newUserText = null) {
    const memory = this.memories.get(id);
    if (!memory) return false;

    // Remove old and add new
    this.index.remove(id);
    this.index.add(id, newVector, {
      user_text: newUserText || memory.user_text,
      ai_text: memory.ai_text
    });

    if (newUserText) {
      memory.user_text = newUserText;
    }
    memory.vector = newVector;

    this._save();
    return true;
  }

  /**
   * Delete memory
   */
  delete(id) {
    this.index.remove(id);
    this.memories.delete(id);
    this._save();
  }

  /**
   * Count memories
   */
  count() {
    return this.memories.size;
  }

  /**
   * Get memory count
   */
  getCount() {
    return this.memories.size;
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      count: this.memories.size,
      indexType: this.useHNSW ? 'HNSW' : 'flat',
      dimension: this.dimension,
      indexStats: this.index.getStats()
    };
  }

  /**
   * Clear all memories
   */
  clear() {
    this.memories.clear();
    // Re-initialize index
    this.index = this.useHNSW
      ? new HNSW({ dimension: this.dimension, m: 8, efConstruction: 100 })
      : new FlatIndex({ dimension: this.dimension });
    this._save();
  }

  // Private methods

  _generateId() {
    return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  _load() {
    // Load index (if exists)
    if (existsSync(this.indexPath)) {
      try {
        const data = JSON.parse(readFile(this.indexPath, 'utf-8'));
        // Reconstruct index from stored vectors
        if (data.nodes && Array.isArray(data.nodes)) {
          for (const node of data.nodes) {
            this.index.add(node.id, node.vector, node.metadata || {});
          }
        }
      } catch (e) {
        console.warn(`[MemoryStore] Failed to load index: ${e.message}`);
      }
    }

    // Load memories metadata
    if (existsSync(this.memoriesPath)) {
      try {
        const data = JSON.parse(readFile(this.memoriesPath, 'utf-8'));
        if (data.memories && Array.isArray(data.memories)) {
          for (const mem of data.memories) {
            this.memories.set(mem.id, mem);
          }
        }
      } catch (e) {
        console.warn(`[MemoryStore] Failed to load memories: ${e.message}`);
      }
    }
  }

  _save() {
    try {
      // Save index data
      const indexNodes = this.index.getAll();
      writeFile(this.indexPath, JSON.stringify({
        type: 'hnsw_index',
        version: 1,
        nodes: indexNodes
      }), 'utf-8');

      // Save memories metadata
      writeFile(this.memoriesPath, JSON.stringify({
        type: 'memories',
        version: 1,
        memories: Array.from(this.memories.values())
      }), 'utf-8');
    } catch (e) {
      console.error(`[MemoryStore] Failed to save: ${e.message}`);
    }
  }
}
