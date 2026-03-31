/**
 * Humanoid Memory System - Main Entry Point
 *
 * Brain-inspired memory for AI agents:
 * - V-score memory consolidation
 * - Tensor resonance fusion
 * - Ebbinghaus forgetting curve
 */

import { homedir } from 'os';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';
import { HumanoidConfig, DEFAULT_CONFIG } from './config.js';
import { MemoryStore } from './storage.js';
import { CognitiveEngine } from './engine.js';
import { CSNEvaluator, RuleBasedEvaluator } from './evaluator.js';
import { createEmbeddingProvider } from './embeddings.js';

export class HumanoidMemory {
  constructor(options = {}) {
    // Configuration
    this.config = options.config || HumanoidConfig.fromEnv();

    // Data directory
    this.dataDir = options.dataDir || join(homedir(), '.openclaw', 'humanoid-memory');
    if (!existsSync(this.dataDir)) {
      mkdirSync(this.dataDir, { recursive: true });
    }

    // Embedding provider
    const embeddingType = options.embeddingType || process.env.HUMANOID_EMBEDDING || 'ollama';
    this.embeddingProvider = createEmbeddingProvider(embeddingType, {
      apiKey: options.openaiKey || process.env.OPENAI_API_KEY,
      baseUrl: options.ollamaUrl || process.env.OLLAMA_URL || 'http://localhost:11434',
      model: options.embeddingModel || process.env.OLLAMA_MODEL || 'nomic-embed-text'
    });

    // LLM provider for evaluation
    const llmType = options.llmType || process.env.HUMANOID_LLM || 'ollama';
    this.llmProvider = {
      type: llmType,
      apiKey: options.openaiKey || process.env.OPENAI_API_KEY,
      baseUrl: options.ollamaUrl || process.env.OLLAMA_URL || 'http://localhost:11434',
      model: options.llmModel || process.env.OLLAMA_MODEL || 'llama2'
    };

    // Storage per agent
    this.stores = new Map();

    // Engines per agent
    this.engines = new Map();

    console.log(`[HumanoidMemory] Initialized with ${embeddingType} embeddings`);
  }

  /**
   * Get or create store for an agent
   */
  _getStore(agentWallet) {
    if (!this.stores.has(agentWallet)) {
      const storePath = join(this.dataDir, agentWallet);
      if (!existsSync(storePath)) {
        mkdirSync(storePath, { recursive: true });
      }

      const store = new MemoryStore({
        dataDir: storePath,
        agentWallet,
        dimension: this.embeddingProvider.getDimension(),
        useHNSW: true
      });

      this.stores.set(agentWallet, store);
    }

    return this.stores.get(agentWallet);
  }

  /**
   * Get or create engine for an agent
   */
  _getEngine(agentWallet) {
    if (!this.engines.has(agentWallet)) {
      const store = this._getStore(agentWallet);

      const evaluator = new CSNEvaluator({
        llmProvider: this.llmProvider,
        sDesc: this.config.s_desc
      });

      const engine = new CognitiveEngine({
        config: this.config,
        storage: store,
        getEmbedding: (text) => this.embeddingProvider.generate(text),
        evaluator
      });

      this.engines.set(agentWallet, engine);
    }

    return this.engines.get(agentWallet);
  }

  /**
   * Perceive: Store a user-AI interaction
   */
  perceive(agentWallet, userText, aiText) {
    const engine = this._getEngine(agentWallet);
    return engine.perceive(userText, aiText);
  }

  /**
   * Sleep: Process pending memories
   */
  async sleep(agentWallet) {
    const engine = this._getEngine(agentWallet);
    return engine.sleep();
  }

  /**
   * Recall: Get relevant memories for a query
   */
  async recall(agentWallet, query, topK = 2) {
    const engine = this._getEngine(agentWallet);
    return engine.recall(query, topK);
  }

  /**
   * Wipe: Clear all memories for an agent
   */
  wipe(agentWallet) {
    const engine = this._getEngine(agentWallet);
    engine.wipe();
  }

  /**
   * Get statistics
   */
  getStats(agentWallet) {
    const store = this._getStore(agentWallet);
    return store.getStats();
  }

  /**
   * Hook: Before request - inject memories
   */
  async beforeRequest(agentWallet, requestData) {
    try {
      const query = requestData.prompt || requestData.query || requestData.message || '';

      if (!query) return;

      const memories = await this.recall(agentWallet, query, 3);

      if (memories && memories.length > 0) {
        requestData.context = requestData.context || {};
        requestData.context.memories = memories.map(m => ({
          type: 'humanoid_memory',
          content: m.text,
          ai_content: m.ai_text,
          weight: m.final_weight
        }));

        console.log(`[HumanoidMemory] Injected ${memories.length} memories`);
      }
    } catch (error) {
      console.error('[HumanoidMemory] beforeRequest error:', error.message);
    }
  }

  /**
   * Hook: After request - store interaction
   */
  async afterRequest(agentWallet, request, response) {
    try {
      const userText = request.prompt || request.query || request.message || '';
      const aiText = response.content || response.text || response.message || '';

      if (!userText && !aiText) return;

      this.perceive(agentWallet, userText, aiText);

      // Process immediately (could also batch)
      await this.sleep(agentWallet);
    } catch (error) {
      console.error('[HumanoidMemory] afterRequest error:', error.message);
    }
  }

  /**
   * Hook: Session end
   */
  async sessionEnd(agentWallet) {
    console.log(`[HumanoidMemory] Session end for ${agentWallet}`);
    const stats = this.getStats(agentWallet);
    console.log(`  Memories: ${stats.count}`);
  }
}

// Singleton instance
let instance;

export function getHumanoidMemory(options = {}) {
  if (!instance) {
    instance = new HumanoidMemory(options);
  }
  return instance;
}

export function resetHumanoidMemory() {
  instance = null;
}

export default HumanoidMemory;
