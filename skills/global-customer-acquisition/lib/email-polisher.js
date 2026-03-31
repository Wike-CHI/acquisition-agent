/**
 * 开发信润色器
 * 使用 article-writing 技能润色开发信
 */

class EmailPolisher {
  constructor() {
    // 禁用模式（来自 article-writing 技能）
    this.bannedPatterns = [
      "In today's rapidly evolving landscape",
      "Moreover",
      "Furthermore",
      "game-changer",
      "cutting-edge",
      "revolutionary",
      "state-of-the-art",
      "best-in-class",
      "world-class",
      "industry-leading",
      "seamlessly",
      "leverage",
      "synergy",
      "paradigm shift",
      "disruptive",
      "innovative solutions"
    ];

    // 品牌语调（红龙）
    this.brandVoice = {
      tone: 'professional but approachable', // 专业但不失亲和
      style: 'direct and concrete', // 直接、具体
      sentenceLength: 'short to medium', // 短句到中句
      rhetoricalDevices: ['specific numbers', 'examples', 'questions'],
      humorTolerance: 'low', // 低容忍度
      opinionLevel: 'moderate', // 适度观点
      formattingHabits: ['bullets', 'short paragraphs', 'clear CTA']
    };

    // 行业特定词汇
    this.industryTerms = {
      products: [
        'air-cooled press',
        'water-cooled press',
        'finger puncher',
        'ply separator',
        'belt cutting machine',
        'guide strip machine'
      ],
      benefits: [
        'temperature control ±2°C',
        'belt width 300-2400mm',
        '15 years of experience',
        '50+ countries served',
        '24-hour response'
      ]
    };
  }

  /**
   * 润色开发信
   * @param {Object} email - 原始开发信
   * @returns {Object} - 润色后的开发信
   */
  polish(email) {
    const { subject, body, customerName, customerCompany, product } = email;

    // 1. 检查禁用模式
    const issues = this.checkBannedPatterns(body);

    // 2. 分析语调
    const toneAnalysis = this.analyzeTone(body);

    // 3. 提供改进建议
    const suggestions = this.generateSuggestions({
      subject,
      body,
      customerName,
      customerCompany,
      product,
      issues,
      toneAnalysis
    });

    // 4. 生成润色版本
    const polishedVersion = this.generatePolishedVersion({
      subject,
      body,
      customerName,
      customerCompany,
      product
    });

    return {
      original: { subject, body },
      polished: polishedVersion,
      issues,
      suggestions,
      score: this.calculateScore(body, issues)
    };
  }

  /**
   * 检查禁用模式
   */
  checkBannedPatterns(text) {
    const issues = [];

    this.bannedPatterns.forEach(pattern => {
      if (text.toLowerCase().includes(pattern.toLowerCase())) {
        issues.push({
          type: 'banned_pattern',
          pattern: pattern,
          message: `避免使用 "${pattern}" - 过于空泛或陈词滥调`
        });
      }
    });

    return issues;
  }

  /**
   * 分析语调
   */
  analyzeTone(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/);

    return {
      sentenceCount: sentences.length,
      averageSentenceLength: words.length / sentences.length,
      hasNumbers: /\d+/.test(text),
      hasQuestions: /\?/.test(text),
      hasBullets: /[•\-\*]/.test(text),
      isTooLong: words.length > 200,
      isTooShort: words.length < 50
    };
  }

  /**
   * 生成改进建议
   */
  generateSuggestions(context) {
    const suggestions = [];

    // 主题行建议
    if (!context.subject || context.subject.length < 10) {
      suggestions.push({
        type: 'subject',
        message: '主题行太短，应包含具体价值点',
        example: `Enhance ${context.customerCompany}'s Production with HOLO Belt Splicing Equipment`
      });
    }

    // 开头建议
    if (!context.body.toLowerCase().includes(context.customerCompany.toLowerCase())) {
      suggestions.push({
        type: 'opening',
        message: '开头应提及客户公司名，显示个性化',
        example: `I noticed ${context.customerCompany} has been...`
      });
    }

    // 具体数字建议
    if (!context.toneAnalysis.hasNumbers) {
      suggestions.push({
        type: 'content',
        message: '缺少具体数字，应添加产品参数或案例数据',
        example: 'temperature control ±2°C, belt width 300-2400mm'
      });
    }

    // CTA 建议
    if (!context.body.includes('?') && !context.body.toLowerCase().includes('would you')) {
      suggestions.push({
        type: 'cta',
        message: '缺少明确的行动号召（CTA）',
        example: 'Would you be open to a brief conversation about potential synergies?'
      });
    }

    // 长度建议
    if (context.toneAnalysis.isTooLong) {
      suggestions.push({
        type: 'length',
        message: '邮件过长（>200词），应精简到150词以内'
      });
    }

    if (context.toneAnalysis.isTooShort) {
      suggestions.push({
        type: 'length',
        message: '邮件过短（<50词），应添加更多具体信息'
      });
    }

    return suggestions;
  }

  /**
   * 生成润色版本
   */
  generatePolishedVersion(context) {
    const { customerName, customerCompany, product } = context;

    // 根据产品类型选择模板
    const productInfo = this.getProductInfo(product);

    return {
      subject: `Enhance ${customerCompany}'s Production with HOLO ${productInfo.category}`,
      body: `Hi ${customerName || 'there'},

I noticed ${customerCompany} ${this.getCustomerContext(customerCompany)}.

We manufacture ${productInfo.name} that might complement your operations:

${productInfo.benefits.map(b => `• ${b}`).join('\n')}

${productInfo.caseStudy}

Would you be open to a brief conversation about potential synergies?

Best regards,
[Your Name] | [Your Title]
HOLO Industrial Equipment
[Your Mobile] (WhatsApp available) | [your@email.com]`
    };
  }

  /**
   * 获取客户上下文
   */
  getCustomerContext(companyName) {
    const contexts = [
      'has been a leader in the conveyor belt industry',
      'distributes conveyor belts across multiple regions',
      'operates in the material handling equipment sector',
      'specializes in industrial belt solutions'
    ];

    return contexts[Math.floor(Math.random() * contexts.length)];
  }

  /**
   * 获取产品信息
   */
  getProductInfo(productType) {
    const products = {
      'air-cooled': {
        name: 'air-cooled belt splicing presses',
        category: 'Air-Cooled Presses',
        benefits: [
          'Temperature control: ±2°C precision',
          'Belt width capacity: 300-2400mm',
          '15 years of proven performance',
          '24-hour technical support'
        ],
        caseStudy: 'We\'ve helped 50+ companies in [region] improve their splicing efficiency by 30%.'
      },
      'water-cooled': {
        name: 'water-cooled belt splicing presses',
        category: 'Water-Cooled Presses',
        benefits: [
          'Superior temperature stability',
          'Ideal for high-volume production',
          'Energy-efficient cooling system',
          'Longer equipment lifespan'
        ],
        caseStudy: 'Our water-cooled systems are running in 20+ mines across Africa.'
      },
      'finger-puncher': {
        name: 'belt finger punchers',
        category: 'Finger Punchers',
        benefits: [
          'Pneumatic operation for precision',
          'Multiple finger patterns available',
          'High-speed processing',
          'Low maintenance design'
        ],
        caseStudy: 'Leading belt manufacturers in Southeast Asia use our punchers for daily operations.'
      }
    };

    return products[productType] || products['air-cooled'];
  }

  /**
   * 计算评分
   */
  calculateScore(body, issues) {
    let score = 100;

    // 扣分项
    issues.forEach(issue => {
      score -= 10;
    });

    // 加分项
    if (/\d+/.test(body)) score += 5; // 包含数字
    if (/\?/.test(body)) score += 5; // 包含问题
    if (/[•\-\*]/.test(body)) score += 5; // 包含列表
    if (body.length >= 100 && body.length <= 200) score += 5; // 长度适中

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 批量润色
   */
  batchPolish(emails) {
    return emails.map(email => this.polish(email));
  }
}

module.exports = EmailPolisher;
