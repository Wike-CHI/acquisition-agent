/**
 * 知识图谱系统
 * 构建知识之间的关联关系
 */

class KnowledgeGraph {
  constructor() {
    this.nodes = new Map(); // 节点（知识）
    this.edges = new Map(); // 边（关系）
    this.index = new Map(); // 索引
  }

  /**
   * 添加知识节点
   */
  addNode(knowledge) {
    const nodeId = knowledge.id || this.generateId();

    const node = {
      id: nodeId,
      type: knowledge.type,
      data: knowledge.data,
      connections: [],
      importance: knowledge.importance || 5,
      createdAt: new Date().toISOString()
    };

    this.nodes.set(nodeId, node);
    this.indexNode(node);

    return nodeId;
  }

  /**
   * 添加关系边
   */
  addEdge(fromId, toId, relationship) {
    const edgeId = `${fromId}-${relationship}-${toId}`;

    const edge = {
      id: edgeId,
      from: fromId,
      to: toId,
      relationship,
      weight: 1,
      createdAt: new Date().toISOString()
    };

    this.edges.set(edgeId, edge);

    // 更新节点的连接列表
    const fromNode = this.nodes.get(fromId);
    const toNode = this.nodes.get(toId);

    if (fromNode) {
      fromNode.connections.push(edgeId);
    }

    if (toNode) {
      toNode.connections.push(edgeId);
    }

    return edgeId;
  }

  /**
   * 索引节点
   */
  indexNode(node) {
    // 按类型索引
    const typeKey = `type:${node.type}`;
    if (!this.index.has(typeKey)) {
      this.index.set(typeKey, []);
    }
    this.index.get(typeKey).push(node.id);

    // 按数据字段索引
    if (node.data) {
      Object.entries(node.data).forEach(([key, value]) => {
        if (typeof value === 'string') {
          const fieldKey = `${key}:${value.toLowerCase()}`;
          if (!this.index.has(fieldKey)) {
            this.index.set(fieldKey, []);
          }
          this.index.get(fieldKey).push(node.id);
        }
      });
    }
  }

  /**
   * 查询节点
   */
  query(criteria) {
    let resultIds = new Set();

    // 按类型查询
    if (criteria.type) {
      const typeIds = this.index.get(`type:${criteria.type}`) || [];
      typeIds.forEach(id => resultIds.add(id));
    }

    // 按字段查询
    if (criteria.fields) {
      Object.entries(criteria.fields).forEach(([key, value]) => {
        const fieldIds = this.index.get(`${key}:${value.toLowerCase()}`) || [];
        if (resultIds.size === 0) {
          fieldIds.forEach(id => resultIds.add(id));
        } else {
          // 取交集
          resultIds = new Set(fieldIds.filter(id => resultIds.has(id)));
        }
      });
    }

    // 返回节点
    return Array.from(resultIds).map(id => this.nodes.get(id));
  }

  /**
   * 获取关联节点
   */
  getRelated(nodeId, depth = 1) {
    const visited = new Set();
    const result = [];

    const traverse = (id, currentDepth) => {
      if (currentDepth > depth || visited.has(id)) {
        return;
      }

      visited.add(id);
      const node = this.nodes.get(id);

      if (node) {
        result.push({
          node,
          depth: currentDepth
        });

        // 遍历连接
        node.connections.forEach(edgeId => {
          const edge = this.edges.get(edgeId);
          if (edge) {
            const nextId = edge.from === id ? edge.to : edge.from;
            traverse(nextId, currentDepth + 1);
          }
        });
      }
    };

    traverse(nodeId, 0);

    return result;
  }

  /**
   * 获取关系路径
   */
  getPath(fromId, toId, maxDepth = 5) {
    const visited = new Set();
    const paths = [];

    const traverse = (currentId, targetId, path, depth) => {
      if (depth > maxDepth) {
        return;
      }

      if (currentId === targetId) {
        paths.push([...path]);
        return;
      }

      if (visited.has(currentId)) {
        return;
      }

      visited.add(currentId);

      const node = this.nodes.get(currentId);
      if (!node) {
        return;
      }

      node.connections.forEach(edgeId => {
        const edge = this.edges.get(edgeId);
        if (edge) {
          const nextId = edge.from === currentId ? edge.to : edge.from;

          path.push({
            from: currentId,
            to: nextId,
            relationship: edge.relationship
          });

          traverse(nextId, targetId, path, depth + 1);

          path.pop();
        }
      });

      visited.delete(currentId);
    };

    traverse(fromId, toId, [], 0);

    return paths;
  }

  /**
   * 构建客户知识图谱
   */
  buildCustomerGraph(customerData) {
    // 添加客户节点
    const customerId = this.addNode({
      type: 'customer',
      data: customerData
    });

    // 添加产品节点和关系
    if (customerData.product_interest) {
      customerData.product_interest.forEach(product => {
        let productId = this.findOrCreateProduct(product);
        this.addEdge(customerId, productId, 'interested_in');
      });
    }

    // 添加地区节点和关系
    if (customerData.country) {
      const regionId = this.findOrCreateRegion(customerData.country);
      this.addEdge(customerId, regionId, 'located_in');
    }

    // 添加行业节点和关系
    if (customerData.industry) {
      const industryId = this.findOrCreateIndustry(customerData.industry);
      this.addEdge(customerId, industryId, 'operates_in');
    }

    return customerId;
  }

  /**
   * 查找或创建产品节点
   */
  findOrCreateProduct(productData) {
    const existing = this.query({
      type: 'product',
      fields: { product_name: productData.name || productData }
    });

    if (existing.length > 0) {
      return existing[0].id;
    }

    return this.addNode({
      type: 'product',
      data: typeof productData === 'string' ? { name: productData } : productData
    });
  }

  /**
   * 查找或创建地区节点
   */
  findOrCreateRegion(country) {
    const existing = this.query({
      type: 'region',
      fields: { country: country }
    });

    if (existing.length > 0) {
      return existing[0].id;
    }

    return this.addNode({
      type: 'region',
      data: { country }
    });
  }

  /**
   * 查找或创建行业节点
   */
  findOrCreateIndustry(industry) {
    const existing = this.query({
      type: 'industry',
      fields: { name: industry }
    });

    if (existing.length > 0) {
      return existing[0].id;
    }

    return this.addNode({
      type: 'industry',
      data: { name: industry }
    });
  }

  /**
   * 导出图谱
   */
  export() {
    return {
      nodes: Array.from(this.nodes.entries()).map(([id, node]) => ({
        id,
        ...node
      })),
      edges: Array.from(this.edges.entries()).map(([id, edge]) => ({
        id,
        ...edge
      }))
    };
  }

  /**
   * 导入图谱
   */
  import(data) {
    data.nodes.forEach(node => {
      this.nodes.set(node.id, node);
      this.indexNode(node);
    });

    data.edges.forEach(edge => {
      this.edges.set(edge.id, edge);
    });
  }

  /**
   * 生成ID
   */
  generateId() {
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 统计
   */
  stats() {
    return {
      nodes: this.nodes.size,
      edges: this.edges.size,
      types: this.getTypeStats()
    };
  }

  /**
   * 获取类型统计
   */
  getTypeStats() {
    const stats = {};

    this.nodes.forEach(node => {
      stats[node.type] = (stats[node.type] || 0) + 1;
    });

    return stats;
  }
}

module.exports = KnowledgeGraph;
