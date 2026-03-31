/**
 * CSN Evaluator - Coherence, Significance, Noise scoring
 *
 * Uses LLM to evaluate text quality:
 * - C (Coherence): Is the text fluent and logically coherent?
 * - S (Significance): Does it contain meaningful content?
 * - N (Noise): Is it gibberish or meaningless filler?
 */

import { calculateVScore } from './physics.js';

/**
 * CSN Evaluator
 */
export class CSNEvaluator {
  constructor(options = {}) {
    this.llmProvider = options.llmProvider; // OpenAI, Ollama, etc.
    this.sDesc = options.sDesc || "Does this contain valuable information worth remembering?";
    this.model = options.model || 'gpt-4';
  }

  /**
   * Evaluate text and return C, S, N scores
   * @param {string} text - Text to evaluate
   * @returns {Promise<{C: number, S: number, N: number}>}
   */
  async evaluate(text) {
    const prompt = this._buildPrompt(text);

    try {
      const response = await this._callLLM(prompt);
      const scores = this._parseResponse(response);

      return scores;
    } catch (error) {
      console.error(`[CSNEvaluator] Evaluation failed: ${error.message}`);
      // Fallback: high noise, low value
      return { C: 5.0, S: 1.0, N: 8.0 };
    }
  }

  /**
   * Calculate V-score from evaluation results
   */
  async calculateVScore(text, M, weights) {
    const { C, S, N } = await this.evaluate(text);
    return {
      C, S, N, M,
      vScore: calculateVScore(C, S, N, M, weights)
    };
  }

  _buildPrompt(text) {
    return `<|im_start|>system
You are an objective data evaluator. Please score the following text (0-10):

C (Coherence): Is the text fluent and logically coherent?
S (Significance): ${this.sDesc}
N (Noise): Does it contain meaningless filler, gibberish, or pure nonsense? (higher = more noise)

Output ONLY three numbers (C,S,N) separated by commas, e.g., 8,9,2
Do NOT output any other text or explanation!<|im_end|>
<|im_start|>user
Text:
${text}<|im_end|>
<|im_start|>assistant`;
  }

  async _callLLM(prompt) {
    if (!this.llmProvider) {
      throw new Error('No LLM provider configured');
    }

    // Support different providers
    if (this.llmProvider.type === 'openai') {
      return this._callOpenAI(prompt);
    } else if (this.llmProvider.type === 'ollama') {
      return this._callOllama(prompt);
    } else {
      throw new Error(`Unsupported LLM provider type: ${this.llmProvider.type}`);
    }
  }

  async _callOpenAI(prompt) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.llmProvider.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 10,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async _callOllama(prompt) {
    const response = await fetch(`${this.llmProvider.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.llmProvider.model || 'llama2',
        prompt,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  }

  _parseResponse(response) {
    // Match pattern: number,number,number
    const match = response.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);

    if (match) {
      return {
        C: parseFloat(match[1]),
        S: parseFloat(match[2]),
        N: parseFloat(match[3])
      };
    }

    // Fallback on parse failure
    console.warn(`[CSNEvaluator] Failed to parse response: ${response}`);
    return { C: 5.0, S: 1.0, N: 8.0 };
  }
}

/**
 * Simple rule-based evaluator (fallback when no LLM)
 */
export class RuleBasedEvaluator {
  constructor(options = {}) {
    this.sDesc = options.sDesc || '';
  }

  async evaluate(text) {
    // Very simple heuristics
    const words = text.trim().split(/\s+/);
    const length = words.length;

    // C: based on word count (longer = more coherent usually)
    const C = Math.min(10, Math.max(1, length / 2));

    // N: based on repeated characters
    const hasRepeats = /(.)\1{3,}/.test(text);
    const hasGibberish = /^[a-z]{20,}$/i.test(text);
    const N = hasRepeats || hasGibberish ? 9 : 2;

    // S: depends on custom description or default
    // Higher if contains personal info, emotions, preferences
    const personalPatterns = /I am|my name|I like|I prefer|feel|think|remember/gi;
    const personalCount = (text.match(personalPatterns) || []).length;
    const S = Math.min(10, 3 + personalCount * 2);

    return { C, S, N };
  }

  async calculateVScore(text, M, weights) {
    const { C, S, N } = await this.evaluate(text);
    return {
      C, S, N, M,
      vScore: calculateVScore(C, S, N, M, weights)
    };
  }
}
