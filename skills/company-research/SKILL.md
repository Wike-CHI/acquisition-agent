---
name: company-research
version: 2.0.0
description: "红龙获客系统·海外B2B企业背景调查 — 输入海外企业名称，自动搜集企业公开信息并输出结构化背调报告，用于客户资质评估和开发信个性化。支持全球搜索引擎、LinkedIn、海关数据交叉验证。"
metadata: {"openclaw":{"requires":{"bins":["agent-browser"]}}}
allowed-tools: Bash(agent-browser:*)
triggers:
  - 公司调研
  - company research
  - 企业背调
---

# 海外B2B企业背景调查 v2.0

红龙获客系统的海外客户企业背调工具。输入企业名称（英文），自动搜索公开信息并输出结构化背调报告，用于评估客户资质和开发信个性化。

> 🔄 v2.0 变更：从通用企业查询工具重构为红龙B2B获客场景专用，增加ICP匹配度评估。

## 环境检测（首次运行必须执行）

在开始搜索前，先检测 `agent-browser` 是否可用：

```bash
which agent-browser
```

- **如果输出路径**（如 `/usr/local/bin/agent-browser`）：环境就绪，使用 `agent-browser` 模式。
- **如果输出为空或 not found**：告知用户需要安装：

> ⚠️ 本技能需要 agent-browser（headless 浏览器工具）才能获取完整的企业数据。
> 推荐通过 ClawHub 技能注册表安装（已审核）：
> ```
> clawhub install TheSethRose/agent-browser
> ```
> 或通过 npm 手动安装：
> ```
> npm install -g agent-browser && agent-browser install --with-deps
> ```
> 安装完成后重新发起查询即可。

## 浏览器工具

使用 `agent-browser` 的以下三个只读命令进行网页访问：

```bash
agent-browser open "<url>"       # 打开页面
agent-browser snapshot -c        # 获取页面文本内容（compact 模式）
agent-browser close              # 完成后关闭浏览器
```

> **重要**：每次 `open` 后必须 `snapshot -c` 读取内容，然后从 snapshot 输出中提取所需信息。

### 安全约束

本技能**仅使用**以下 agent-browser 命令：`open`、`snapshot`、`close`。

**禁止使用**以下功能：
- `state save` / `state load`（会话状态保存/加载）
- `cookies` / `storage`（Cookie 和本地存储访问）
- `network route`（网络请求拦截）
- `eval`（JavaScript 执行）
- `fill` / `click` / `type`（表单交互）

本技能不请求任何凭据、不访问已认证资源、不保存任何浏览器状态。所有访问目标均为公共搜索引擎和企业官网。

## 搜索引擎

优先使用国际搜索引擎（面向海外客户）：

| 引擎 | URL 模板 | 用途 |
|------|----------|------|
| Google | `https://www.google.com/search?q={keyword}` | 全球企业信息、新闻、官网（主力） |
| Google News | `https://news.google.com/search?q={keyword}` | 近期新闻、融资动向 |
| LinkedIn | `https://www.linkedin.com/company/{company}` | 企业规模、员工、业务范围 |
| Bing | `https://www.bing.com/search?q={keyword}` | 补充搜索、企业信息验证 |

> **备选引擎**：如果 Google 被限制，使用 Bing 作为主力搜索引擎。

## 搜索步骤

收到企业名称 `{company}`（通常为英文）后，按以下顺序执行：

### 第一轮：企业基础信息

```bash
# 1. 企业核心信息（官网、规模、行业、总部）
agent-browser open "https://www.google.com/search?q={company}+company+profile+headquarters+industry"
agent-browser snapshot -c
# 提取：官网URL、总部地址、成立年份、员工规模、主营业务

# 2. 企业官网
agent-browser open "https://www.google.com/search?q={company}+official+website"
agent-browser snapshot -c
# 提取：官网URL、About页面信息、产品/服务列表

# 3. LinkedIn 企业页
agent-browser open "https://www.linkedin.com/company/{company-slug}"
agent-browser snapshot -c
# 提取：员工总数、行业分类、总部、 specialties、近期动态
```

### 第二轮：业务与市场信息

```bash
# 4. 产品和业务范围
agent-browser open "https://www.google.com/search?q={company}+products+services+business"
agent-browser snapshot -c
# 提取：主要产品线、目标市场、业务范围

# 5. 近期新闻
agent-browser open "https://news.google.com/search?q={company}"
agent-browser snapshot -c
# 提取：近6个月新闻、扩张动态、合作签约

# 6. 融资与财务
agent-browser open "https://www.google.com/search?q={company}+funding+revenue+investment"
agent-browser snapshot -c
# 提取：融资轮次、投资方、营收规模

# 7. 进出口贸易信息
agent-browser open "https://www.google.com/search?q={company}+import+export+trade+customs"
agent-browser snapshot -c
# 提取：贸易伙伴、进出口品类、采购规模
```

### 第三轮：决策者与联系方式

```bash
# 8. 关键决策者
agent-browser open "https://www.google.com/search?q={company}+CEO+director+owner+management"
agent-browser snapshot -c
# 提取：CEO/CTO/采购总监等关键人姓名和职位

# 9. 采购/供应链信息
agent-browser open "https://www.google.com/search?q={company}+procurement+sourcing+supplier"
agent-browser snapshot -c
# 提取：采购需求、供应链模式、当前供应商

# 10. 补充验证（Bing）
agent-browser open "https://www.bing.com/search?q={company}+company+overview+reviews"
agent-browser snapshot -c
# 交叉验证之前获取的信息
```

> **注意**：每轮搜索后评估已获取信息，如某维度已有充分数据则跳过后续同类查询。完成后执行 `agent-browser close`。

## 输出格式

严格按以下结构输出。**如果某个小节没有搜索到相关信息，直接省略该小节，不要输出空内容或"暂无"。**

---

### 一、企业概况

#### 1.1 基础信息

- **企业名称**：{原文英文名}（{当地语言名，如有}）
- **基本信息**：{总部地址}、{成立年份}、{行业分类}（并列显示，用"、"隔开）
- **官网网址**：{官网链接}
- **主营业务**：{核心产品/服务描述}
- **员工规模**：{数量范围}
- **企业标签**：{上市公司、家族企业、跨国集团等}

#### 1.2 关键决策者

- **CEO/总经理**：{姓名}（{国籍，如有}）
- **采购/供应链负责人**：{姓名和职位}
- **其他关键人**：{CTO/COO等}

#### 1.3 近期动态

- **重要事件**：{近6个月的重要变更、扩张、合作}
- **融资/投资**：{最新融资信息及趋势}
- **市场扩张**：{新市场、新产品线、新工厂等}

---

### 二、ICP匹配度评估

根据搜得的企业信息，按 `skill://acquisition-workflow/references/ICP-STANDARDS.md` 的 6 维度体系评估：

| 维度 | 匹配条件 | 匹配结果 | 得分 |
|------|----------|----------|------|
| **行业匹配度**（20分） | 制造业/加工业/木工/3D打印 | ✅/❌ | {}/20 |
| **采购能力**（20分） | 海关金额等级 | ✅/❌ | {}/20 |
| **采购频率**（20分） | 交易次数+最新日期 | ✅/❌ | {}/20 |
| **客户类型**（15分） | 制造商/经销商/终端等 | ✅/❌ | {}/15 |
| **决策周期**（15分） | 企业规模推断 | ✅/❌ | {}/15 |
| **决策人联系**（10分） | LinkedIn/官网联系方式 | ✅/❌ | {}/10 |

**综合得分**：{}/100 → {A/B/C/D 级}

> 阈值：A≥75（立即触达）| B 50-74（正常跟进）| C 30-49（低优先级）| D<30（暂不开发）
> 详细评分细则见 `skill://acquisition-workflow/references/SCORING.md`

**匹配理由**：{一句话说明为什么匹配或不匹配}

---

### 三、开发信建议

#### 3.1 推荐触达产品

根据企业特征，推荐最适合的红龙产品：

- **首选**：{产品名} — {匹配理由}
- **备选**：{产品名} — {匹配理由}

#### 3.2 开发信切入点

- **痛点切入**：{基于企业特征的痛点假设}
- **利益切入**：{使用红龙产品可能带来的价值}
- **信任切入**：{可引用的同行业案例或认证}

---

## 信息质量规则

1. **优先级**：优先选择与企业采购行为、生产设备、供应链直接相关的信息
2. **信息整合**：如果多个参考片段涉及同一主题，整合为一段
3. **禁止编造**：只能根据搜索到的信息整理和总结，禁止引入外部知识或无依据推测
4. **防止混淆**：严禁混入名称相近但不是目标企业的信息
5. **时效性**：优先展示近2年的信息，超过3年的信息标注年份
6. **过滤噪音**：不要提供劳动纠纷、法律诉讼等与采购决策无关的信息
7. **语言处理**：搜索结果可能为多语言，统一整理为中文输出
