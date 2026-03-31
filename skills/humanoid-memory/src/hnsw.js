/**
 * HNSW - Hierarchical Navigable Small World
 *
 * A fast approximate nearest neighbor search algorithm
 * Simplified implementation for memory system
 */

import { cosineSimilarity, euclideanDistance } from './utils/math.js';

/**
 * HNSW Index for fast vector search
 */
export class HNSW {
  constructor(options = {}) {
    this.dimension = options.dimension || 384;
    this.maxLayers = options.maxLayers || 16;
    this.efConstruction = options.efConstruction || 200;
    this.efSearch = options.efSearch || 100;
    this.m = options.m || 12;

    this.layers = []; // Array of layers, each is a set of nodes
    this.entryPoint = null;
    this.nodeCount = 0;

    // Initialize layers
    for (let i = 0; i < this.maxLayers; i++) {
      this.layers.push(new Map()); // nodeId -> HNSWNode
    }
  }

  /**
   * Add a vector to the index
   */
  add(id, vector, metadata = {}) {
    if (vector.length !== this.dimension) {
      throw new Error(`Vector dimension ${vector.length} doesn't match index ${this.dimension}`);
    }

    // Determine number of layers for this node (geometric distribution)
    const level = this._getRandomLevel();

    // Create node
    const node = {
      id,
      vector,
      metadata,
      level,
      connections: new Array(this.maxLayers).fill(null).map(() => [])
    };

    // Insert into index
    if (this.entryPoint === null) {
      // First node
      this.entryPoint = node;
      for (let l = 0; l <= level; l++) {
        this.layers[l].set(id, node);
      }
    } else {
      // Find insertion point at each layer
      let current = this.entryPoint;

      for (let l = this.maxLayers - 1; l >= 0; l--) {
        // Search at this layer
        current = this._searchLayer(current, vector, this.efConstruction, l);

        // Connect to neighbors at this layer
        if (l <= level) {
          this._connect(node, current, l);
        }
      }

      // Add to all relevant layers
      for (let l = 0; l <= level; l++) {
        this.layers[l].set(id, node);
      }
    }

    this.nodeCount++;
    return id;
  }

  /**
   * Search for k nearest neighbors
   */
  search(queryVector, k = 5, ef = null) {
    if (this.nodeCount === 0) {
      return [];
    }

    ef = ef || this.efSearch;

    // Start from entry point
    let current = this.entryPoint;

    // Search from top layer down
    for (let l = this.maxLayers - 1; l >= 0; l--) {
      if (this.layers[l].size === 0) continue;

      // Move towards query
      current = this._searchLayer(current, queryVector, 1, l)[0];
    }

    // Final search at layer 0
    const candidates = this._searchLayer(current, queryVector, ef, 0);

    // Sort and return top k
    const results = candidates
      .map(node => ({
        id: node.id,
        vector: node.vector,
        metadata: node.metadata,
        similarity: cosineSimilarity(queryVector, node.vector)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k);

    return results;
  }

  /**
   * Get node by ID
   */
  get(id) {
    // Search all layers
    for (const layer of this.layers) {
      if (layer.has(id)) {
        return layer.get(id);
      }
    }
    return null;
  }

  /**
   * Remove node by ID
   */
  remove(id) {
    for (const layer of this.layers) {
      layer.delete(id);
    }
    this.nodeCount--;
  }

  /**
   * Get all nodes at layer 0 (for iteration)
   */
  getAll() {
    return Array.from(this.layers[0].values()).map(node => ({
      id: node.id,
      vector: node.vector,
      metadata: node.metadata
    }));
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      nodeCount: this.nodeCount,
      dimension: this.dimension,
      layers: this.layers.filter(l => l.size > 0).length,
      maxLayers: this.maxLayers
    };
  }

  // Private methods

  _getRandomLevel() {
    // Geometric distribution for layer selection
    let level = 0;
    while (Math.random() < 0.5 && level < this.maxLayers - 1) {
      level++;
    }
    return level;
  }

  _searchLayer(entry, query, ef, layer) {
    const visited = new Set();
    const candidates = [];
    const results = [];

    candidates.push(entry);
    visited.add(entry.id);
    results.push(entry);

    // Best result so far
    let best = entry;
    let bestDist = 1 - cosineSimilarity(query, entry.vector);

    while (candidates.length > 0) {
      // Sort by distance to query
      candidates.sort((a, b) => {
        const distA = 1 - cosineSimilarity(query, a.vector);
        const distB = 1 - cosineSimilarity(query, b.vector);
        return distA - distB;
      });

      const current = candidates.shift();

      // Check if we can stop
      const currentDist = 1 - cosineSimilarity(query, current.vector);
      if (currentDist > bestDist + 0.01) {
        break;
      }

      // Explore neighbors
      for (const neighborId of current.connections[layer] || []) {
        if (visited.has(neighborId)) continue;
        visited.add(neighborId);

        // Get neighbor from any layer (same node across layers)
        const neighbor = this.get(neighborId);
        if (!neighbor) continue;

        const dist = 1 - cosineSimilarity(query, neighbor.vector);

        if (results.length < ef || dist < bestDist) {
          candidates.push(neighbor);
          results.push(neighbor);

          if (dist < bestDist) {
            best = neighbor;
            bestDist = dist;
          }
        }
      }
    }

    return results.slice(0, ef);
  }

  _connect(node, entry, layer) {
    // Get neighbors at this layer
    const neighbors = Array.from(this.layers[layer].values())
      .filter(n => n.id !== node.id);

    // Sort by distance
    neighbors.sort((a, b) => {
      const distA = 1 - cosineSimilarity(node.vector, a.vector);
      const distB = 1 - cosineSimilarity(node.vector, b.vector);
      return distA - distB;
    });

    // Connect to nearest neighbors (up to m)
    const connectCount = Math.min(this.m, neighbors.length);

    for (let i = 0; i < connectCount; i++) {
      const neighbor = neighbors[i];

      // Add bidirectional connections
      if (!node.connections[layer].includes(neighbor.id)) {
        node.connections[layer].push(neighbor.id);
      }
      if (!neighbor.connections[layer].includes(node.id)) {
        neighbor.connections[layer].push(node.id);
      }
    }
  }
}

/**
 * Simple flat index (brute force) - fallback for small datasets
 */
export class FlatIndex {
  constructor(options = {}) {
    this.dimension = options.dimension || 384;
    this.nodes = [];
  }

  add(id, vector, metadata = {}) {
    this.nodes.push({ id, vector, metadata });
  }

  search(queryVector, k = 5) {
    return this.nodes
      .map(node => ({
        id: node.id,
        vector: node.vector,
        metadata: node.metadata,
        similarity: cosineSimilarity(queryVector, node.vector)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k);
  }

  remove(id) {
    this.nodes = this.nodes.filter(n => n.id !== id);
  }

  get(id) {
    return this.nodes.find(n => n.id === id);
  }

  getAll() {
    return this.nodes.map(n => ({
      id: n.id,
      vector: n.vector,
      metadata: n.metadata
    }));
  }

  getStats() {
    return {
      nodeCount: this.nodes.length,
      dimension: this.dimension,
      type: 'flat'
    };
  }
}
