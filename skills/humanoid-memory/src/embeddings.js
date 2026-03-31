/**
 * Embeddings - Vectorization providers
 *
 * Supports:
 * - openai: OpenAI embeddings API
 * - local: Local model via Ollama
 * - mock: For testing
 */

import { HNSW } from './hnsw.js'; // Local vector index

/**
 * Create embedding provider based on type
 * @param {string} type - 'openai', 'ollama', or 'mock'
 * @param {Object} options - Provider options
 */
export function createEmbeddingProvider(type, options = {}) {
  switch (type) {
    case 'openai':
      return new OpenAIEmbeddings(options);
    case 'ollama':
      return new OllamaEmbeddings(options);
    case 'mock':
      return new MockEmbeddings(options);
    default:
      throw new Error(`Unknown embedding provider: ${type}`);
  }
}

/**
 * OpenAI Embeddings
 */
export class OpenAIEmbeddings {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.OPENAI_API_KEY;
    this.model = options.model || 'text-embedding-3-small';
    this.dimension = options.dimension || 1536;
    this.baseUrl = options.baseUrl || 'https://api.openai.com/v1';
  }

  async generate(text) {
    const response = await fetch(`${this.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        input: text
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  }

  getDimension() {
    return this.dimension;
  }
}

/**
 * Ollama Embeddings (local)
 */
export class OllamaEmbeddings {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || process.env.OLLAMA_URL || 'http://localhost:11434';
    this.model = options.model || 'nomic-embed-text';
  }

  async generate(text) {
    const response = await fetch(`${this.baseUrl}/api/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        prompt: text
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.embedding;
  }

  async generateBatch(texts) {
    // Ollama doesn't support batch, so we parallelize
    return Promise.all(texts.map(text => this.generate(text)));
  }

  getDimension() {
    // nomic-embed-text is 768 dimensions
    return 768;
  }
}

/**
 * Mock embeddings for testing
 */
export class MockEmbeddings {
  constructor(options = {}) {
    this.dimension = options.dimension || 384;
  }

  /**
   * Generate deterministic fake embedding based on text hash
   */
  generate(text) {
    const hash = this._hashString(text);
    const embedding = new Array(this.dimension);

    for (let i = 0; i < this.dimension; i++) {
      // Pseudo-random based on hash
      embedding[i] = ((hash * (i + 1)) % 1000) / 1000 - 0.5;
    }

    // Normalize
    const mag = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
    return embedding.map(v => v / mag);
  }

  _hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  getDimension() {
    return this.dimension;
  }
}
