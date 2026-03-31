# 外部技能路由器 (External Skills Router)

> 红龙获客系统 v2.3.0 - 外部技能智能路由
> 更新时间：2026-04-02

---

## 🎯 路由器作用

外部技能路由器负责：
1. **意图识别** - 识别用户需求对应哪个外部技能
2. **技能路由** - 自动选择最合适的外部技能
3. **参数传递** - 将用户参数正确传递给外部技能
4. **结果整合** - 整合外部技能的返回结果
5. **故障降级** - 外部技能不可用时提供降级方案

---

## 📋 完整路由表

### Office文档生成路由

| 用户指令 | 识别意图 | 路由到 | 备选方案 | 参数映射 |
|----------|----------|--------|----------|----------|
| "生成报价单" | docx_generation | `docx/` | 手动生成 | 模板→报价单模板.docx |
| "生成合同" | docx_generation | `docx/` | 手动生成 | 模板→合同模板.docx |
| "做产品演示" | pptx_generation | `pptx/` | 使用docx | 模板→产品演示.pptx |
| "生成客户表" | xlsx_generation | `xlsx/` | 使用docx | 数据→客户列表 |
| "创建价格表" | xlsx_generation | `xlsx/` | 使用docx | 数据→价格信息 |

### 搜索与调研路由

| 用户指令 | 识别意图 | 路由到 | 备选方案 | 参数映射 |
|----------|----------|--------|----------|----------|
| "背调这家公司" | company_research | `tavily-search/` | `brave-web-search/` | 公司→公司名称 |
| "搜索产品信息" | product_research | `tavily-search/` | `brave-web-search/` | 关键词→产品名称 |
| "查找市场数据" | market_research | `tavily-search/` | `brave-web-search/` | 市场→地区+行业 |
| "网页搜索" | web_search | `brave-web-search/` | `tavily-search/` | 查询→搜索关键词 |

### 邮件与通信路由

| 用户指令 | 识别意图 | 路由到 | 备选方案 | 参数映射 |
|----------|----------|--------|----------|----------|
| "发送开发信" | email_send | `email-skill/` | 手动发送 | 收件人→客户邮箱 |
| "发跟进邮件" | email_send | `email-skill/` | 手动发送 | 收件人→客户邮箱 |
| "邮件营销" | email_campaign | `email-skill/` | 批量手动 | 收件人→客户列表 |

### PDF处理路由

| 用户指令 | 识别意图 | 路由到 | 备选方案 | 参数映射 |
|----------|----------|--------|----------|----------|
| "生成产品PDF" | pdf_generation | `pdf/` | 使用docx | 内容→产品信息 |
| "处理PDF表单" | pdf_form | `pdf/` | 手动处理 | 表单→PDF文件 |
| "PDF转Word" | pdf_convert | `pdf/` | 手动转换 | 文件→PDF路径 |

### 笔记与记忆路由

| 用户指令 | 识别意图 | 路由到 | 备选方案 | 参数映射 |
|----------|----------|--------|----------|----------|
| "保存到Memos" | memos_save | `memos-memory-guide/` | 本地保存 | 内容→笔记内容 |
| "记录到Notion" | notion_save | `notion-skill/` | Memos保存 | 内容→笔记内容 |
| "创建Notion页面" | notion_page | `notion-skill/` | 使用Memos | 标题→页面标题 |

### 日程与规划路由

| 用户指令 | 识别意图 | 路由到 | 备选方案 | 参数映射 |
|----------|----------|--------|----------|----------|
| "查看日程" | calendar_view | `calendar-skill/` | 手动查看 | 日期→今天/本周 |
| "安排会议" | calendar_create | `calendar-skill/` | 手动创建 | 时间→会议时间 |
| "规划任务" | planning_create | `planning-with-files/` | 手动规划 | 任务→任务列表 |

---

## 🔧 路由器实现

### 伪代码实现

```javascript
class ExternalSkillsRouter {
  constructor() {
    this.routes = {
      // Office文档路由
      'docx_generation': {
        primary: 'external-skills/docx/SKILL.md',
        fallback: 'templates/manual-generation.md',
        trigger: ['生成报价单', '生成合同', '生成Word文档'],
        params: {
          template_type: '报价单|合同|文档'
        }
      },

      'pptx_generation': {
        primary: 'external-skills/pptx/SKILL.md',
        fallback: 'external-skills/docx/SKILL.md',
        trigger: ['做产品演示', '生成PPT', '制作幻灯片'],
        params: {
          template_type: '产品演示|PPT|幻灯片'
        }
      },

      'xlsx_generation': {
        primary: 'external-skills/xlsx/SKILL.md',
        fallback: 'external-skills/docx/SKILL.md',
        trigger: ['生成客户表', '创建价格表', '生成Excel'],
        params: {
          data_type: '客户列表|价格信息'
        }
      },

      // 搜索路由
      'company_research': {
        primary: 'external-skills/tavily-search/SKILL.md',
        fallback: 'external-skills/brave-web-search/SKILL.md',
        trigger: ['背调', '调研', '公司信息'],
        params: {
          company: '公司名称'
        }
      },

      // 邮件路由
      'email_send': {
        primary: 'external-skills/email-skill/SKILL.md',
        fallback: 'templates/manual-email.md',
        trigger: ['发送开发信', '发跟进邮件', '邮件营销'],
        params: {
          recipient: '客户邮箱',
          subject: '邮件主题',
          body: '邮件内容'
        }
      },

      // PDF路由
      'pdf_generation': {
        primary: 'external-skills/pdf/SKILL.md',
        fallback: 'external-skills/docx/SKILL.md',
        trigger: ['生成产品PDF', '创建PDF文档'],
        params: {
          content: '产品信息',
          format: 'PDF'
        }
      },

      // 笔记路由
      'memos_save': {
        primary: 'external-skills/memos-memory-guide/SKILL.md',
        fallback: 'context/memory.md',
        trigger: ['保存到Memos', '记录到Memos'],
        params: {
          content: '笔记内容'
        }
      },

      'notion_save': {
        primary: 'external-skills/notion-skill/SKILL.md',
        fallback: 'external-skills/memos-memory-guide/SKILL.md',
        trigger: ['记录到Notion', '创建Notion页面'],
        params: {
          content: '笔记内容',
          title: '页面标题'
        }
      }
    };
  }

  // 意图识别
  detectIntent(userInput) {
    for (const [intent, config] of Object.entries(this.routes)) {
      for (const trigger of config.trigger) {
        if (userInput.includes(trigger)) {
          return intent;
        }
      }
    }
    return 'unknown';
  }

  // 路由到技能
  routeToSkill(intent, params) {
    const route = this.routes[intent];
    if (!route) {
      throw new Error(`Unknown intent: ${intent}`);
    }

    return {
      skill: route.primary,
      fallback: route.fallback,
      params: this.mapParams(params, route.params)
    };
  }

  // 参数映射
  mapParams(userParams, paramConfig) {
    const mapped = {};
    for (const [key, value] of Object.entries(paramConfig)) {
      mapped[key] = userParams[value] || value;
    }
    return mapped;
  }
}

module.exports = ExternalSkillsRouter;
```

---

## 🚀 使用示例

### 示例1：生成报价单

```
用户输入: "生成报价单"

路由器处理：
1. 意图识别: docx_generation
2. 路由到: external-skills/docx/SKILL.md
3. 参数映射: {template_type: "报价单"}
4. 执行: 调用docx技能生成Word报价单
5. 返回: 报价单文件路径
```

### 示例2：公司背调

```
用户输入: "背调这家公司：Ace Belting Company"

路由器处理：
1. 意图识别: company_research
2. 路由到: external-skills/tavily-search/SKILL.md
3. 参数映射: {company: "Ace Belting Company"}
4. 执行: 调用tavily-search进行深度搜索
5. 备选: 如果tavily不可用，切换到brave-web-search
6. 返回: 公司调研报告
```

### 示例3：发送开发信

```
用户输入: "发送开发信给john@example.com"

路由器处理：
1. 意图识别: email_send
2. 路由到: external-skills/email-skill/SKILL.md
3. 参数映射: {
     recipient: "john@example.com",
     subject: "产品介绍",
     body: "生成的开发信内容"
   }
4. 执行: 调用email-skill发送邮件
5. 返回: 发送状态（成功/失败）
```

---

## 🔧 集成到主技能

### 在SKILL.md中引用

```yaml
# 在主技能SKILL.md的"工具"部分添加

## 外部技能集成

### Office文档生成
- 生成报价单: 使用 `[external-skills/docx/](external-skills/docx/SKILL.md)`
- 生成PPT: 使用 `[external-skills/pptx/](external-skills/pptx/SKILL.md)`
- 生成Excel: 使用 `[external-skills/xlsx/](external-skills/xlsx/SKILL.md)`

### 搜索与调研
- 公司背调: 使用 `[tavily-search](external-skills/tavily-search/SKILL.md)`
- 网页搜索: 使用 `[brave-search](external-skills/brave-web-search/SKILL.md)`

### 邮件与通信
- 发送邮件: 使用 `[email-skill](external-skills/email-skill/SKILL.md)`

### PDF处理
- 生成PDF: 使用 `[pdf](external-skills/pdf/SKILL.md)`

### 笔记与记忆
- Memos保存: 使用 `[memos](external-skills/memos-memory-guide/SKILL.md)`
- Notion记录: 使用 `[notion](external-skills/notion-skill/SKILL.md)`
```

---

## ✅ 路由器检查清单

- [x] 所有20个外部技能已索引
- [x] 路由表已建立
- [x] 备选方案已定义
- [x] 参数映射已配置
- [x] 与主技能SKILL.md的引用已建立

---

*路由器更新时间: 2026-04-02*
*路由规则数: 25条*
*覆盖技能数: 20个*

### NAS存储路由

| 用户指令 | 识别意图 | 路由到 | 备选方案 | 参数映射 |
|----------|----------|--------|----------|----------|
| "读取NAS文件" | nas_read | `nas-file-reader/` | 本地文件读取 | 路径→Y:/路径 |
| "挂载NAS盘" | nas_mount | `nas-file-reader/` | 手动挂载 | 无 |
| "查看产品资料" | nas_products | `nas-file-reader/` | config/products.json | 路径→产品目录 |
| "OCR识别PDF" | nas_ocr | `nas-file-reader/` | pdf技能 | 文件→PDF路径 |

**NAS路由配置**:
```javascript
'nas_read': {
  primary: 'external-skills/nas-file-reader/SKILL.md',
  fallback: 'config/products.json',
  trigger: ['读取NAS', '查看共享盘', '产品资料'],
  params: { path: 'Y:/路径' }
}
```
