---
name: inquiry-response
description: >
  询盘应答技能 v1.1.0 - 客户回复后的智能应答系统。
  覆盖五大类客户回复：异议处理(A)、技术问题(B)、竞品对比(C)、商务条款(D)、兴趣信号(E)。
  核心是异议应答库，提供"场景→策略→话术"三级结构，中英双语+6语种本地化。
  新增：谈判策略库（报价后价格拉锯、条款谈判、成交收尾）、各国文化画像（18国）。
  当用户说"客户说太贵了"、"客户问交期"、"客户提到Beltwin"、"询盘回复"、"FAQ"、
  "客户回了邮件"、"异议处理"、"客户拒绝了"、"回复客户"、"收到询盘"、"客户议价"
  "谈判策略"、"成交收尾"时使用。
version: 1.1.0
triggers:
  - 询盘
  - 客户回复
  - 异议
  - FAQ
  - 客户说
  - inquiry
  - objection
  - 回复客户
  - 收到询盘
  - 客户说太贵
  - 客户议价
  - 销售应答
  - negotiation
  - 谈判策略
  - 成交
  - objection handling
  - sales reply
---

# inquiry-response - 询盘应答技能

客户回复邮件后的智能应答系统。从获客的"单向输出"转为"双向对话"。

## 架构

```
客户回复
    ↓
┌─────────────────────────────────────────────┐
│  分类引擎：判断回复类型                        │
│  A=异议  B=技术  C=对比  D=商务  E=兴趣       │
│  + 识别客户语言/地区                           │
└─────────┬───────────────────────────────────┘
          ↓
┌─ A类 → references/objection-library.md       │ 异议应答库（英文策略）
│        → 非英语客户？查 references/             │
│           multilingual-objections.md          │ 多语种话术(6语种)
│        → 选策略 → 选语种 → 填背景 → 拟人化      │
├─ B类 → references/product-faq.md             │ 产品技术FAQ
│        → 查参数 → 补充说明                      │
├─ C类 → references/competitor-intel.md         竞品/经销商情报（Beltwin等）
│        → references/objection-library.md A15节  合作伙伴场景
├─ D类 → references/business-policy.md         商务条款
│        → references/negotiation-tactics.md   谈判策略库（价格拉锯/条款/成交）
└─ E类 → references/interest-signals.md        兴趣信号
         → references/cultural-profiles.md     18国文化画像（辅助适配）

### 新增模块（从 sales-response 迁移）

| 模块 | 文件 | 内容 |
|------|------|------|
| 竞品情报 | references/competitor-intel.md | Beltwin定位话术、其他竞品应对、覆盖地图 |
| 文化画像 | references/cultural-profiles.md | 18国商业文化+购买心理+话术 |
| 谈判策略 | references/negotiation-tactics.md | 让步策略、各国谈判风格、成交收尾 |
```

## 使用方式

### 方式一：直接问

告诉系统客户说了什么，自动匹配应答：

```
用户：客户说"你们的报价比Beltwin高20%"
→ 自动识别为C类对比 + Beltwin是合作伙伴 → 生成源头厂家话术

用户：客户问"1200型能处理多宽的皮带"
→ 自动识别为B类技术 → 查产品FAQ → 回复

用户：客户说"我们已经有稳定的供应商了，暂时不需要"
→ 自动识别为A类异议 → 查异议库 → 推荐策略
```

### 方式二：查特定场景

```
用户：异议处理：价格贵
用户：异议处理：已有供应商
用户：产品FAQ：风冷机参数
用户：商务FAQ：付款方式
```

## 核心原则

### 1. 先查竞品/合作伙伴情报

收到任何提到其他公司名的回复，先查 `references/competitor-intel.md`。
如果是合作伙伴（如Beltwin），切换到"源头厂家"话术，不做竞品攻击。
（旧的 PARTNER-REGISTRY.md 废除，以 competitor-intel.md 为准）

### 2. 异议不是拒绝

异议是购买意向的信号。客户愿意说"太贵了"，说明他在认真考虑。
应对思路：理解 → 确认 → 引导 → 推进，不是反驳。

### 3. 话术风格适配

| 客户区域 | 风格偏好 | 注意事项 |
|----------|----------|----------|
| 美国 | 直接、数据驱动 | 不喜欢绕弯，要具体数字 |
| 德国 | 技术严谨、质量导向 | 要认证、参数、测试报告 |
| 巴西 | 关系导向、热情 | 建立个人关系比价格重要 |
| 东南亚 | 价格敏感、忠诚度高 | 一旦建立关系很少换 |
| 中东 | 关系+价格 | 先建立信任再谈业务 |
| 澳洲 | 务实、不废话 | 喜欢no-nonsense风格 |

### 4. 去AI味

所有话术经过 sdr-humanizer 处理后再发送。避免：
- 过于完美的语法
- 模板化的开头结尾
- 过度热情的语气
- 不自然的条件句堆叠

## 多语种支持

### 覆盖语种

| 代码 | 语言 | 主要市场 |
|------|------|---------|
| PT-BR | 巴西葡萄牙语 | 巴西 |
| ES | 西班牙语 | 智利/阿根廷/哥伦比亚/墨西哥/秘鲁 |
| DE | 德语 | 德国/奥地利/瑞士 |
| AR | 阿拉伯语 | 沙特/阿联酋/埃及 |
| ID | 印尼语 | 印尼/马来西亚 |
| TR | 土耳其语 | 土耳其 |

### 使用流程

```
1. 客户用非英语回复
2. 识别语言 → 在 multilingual-objections.md 找对应语种
3. 找到对应异议场景的话术
4. 填入客户信息 → 微调 → 发送

注意：
- 话术不是机器翻译，是按当地商务文化写的
- 阿拉伯语客户建议 AR+EN 双语发送
- 德语客户要补技术参数，不能只靠话术
- 巴西客户可以加 WhatsApp 号码拉近距离
```

### 覆盖场景

6语种 × 8高频异议 = 48条话术 + 6条强信号推进模板

| 异议 | PT-BR | ES | DE | AR | ID | TR |
|------|-------|----|----|----|----|-----|
| A01 太贵了 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| A02 已有供应商 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| A04 让我考虑 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| A05 质量可靠吗 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| A08 暂时不需要 | ✓ | ✓ | — | ✓ | ✓ | — |
| A09 中国制造不行 | — | ✓ | ✓ | ✓ | — | — |
| A15 跟合作伙伴买 | ✓ | ✓ | ✓ | — | — | — |
| 强信号推进 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## 联动技能

| 技能 | 用途 |
|------|------|
| honglong-products | 查产品参数、技术规格 |
| references/competitor-intel.md | 判断是否合作伙伴、Beltwin话术 |
| references/cultural-profiles.md | 客户国家文化适配 |
| references/negotiation-tactics.md | 报价后拉锯、条款谈判、成交收尾 |
| smart-quote | 查价格区间、利润率 |
| sdr-humanizer | 话术拟人化 |
| 163-email-sender | 发送回复邮件 |
| cold-email-generator | 生成跟进邮件 |

## 目录结构

```
inquiry-response/
├── SKILL.md                           # 本文件
├── references/
│   ├── objection-library.md           # 异议应答库（英文，15个场景）
│   ├── multilingual-objections.md     # 多语种异议话术（6语种×8场景=54条）
│   ├── product-faq.md                 # 产品技术FAQ（30+问答）
│   ├── business-policy.md             # 商务条款FAQ
│   ├── interest-signals.md            # 兴趣信号应答（快速推进）
│   ├── competitor-intel.md            # 竞品/经销商情报（从sales-response迁入）
│   ├── cultural-profiles.md           # 18国商业文化画像（从sales-response迁入）
│   └── negotiation-tactics.md         # 谈判策略库（从sales-response迁入）
└── templates/
    └── response-templates.md          # 邮件回复模板
```

## 谈判与文化适配（v1.1新增）

### 报价后价格拉锯

查 `references/negotiation-tactics.md`，核心原则：
- **让步必须换东西**：降价必须换预付款/快速确认/批量，不无偿让步
- **分三步走**：先给最小让步 → 等值交换 → 最后给大让步同时要求承诺
- **美德日谈判风格不同**：美国人要ROI数字，德国人要合同条款细节，日本人要长期承诺

### 各国文化画像

查 `references/cultural-profiles.md`，18个国家的：
- 决策速度（美国快，日本慢）
- 价格敏感度（印度极高，德国低）
- 关系vs效率（巴西重关系，美国重效率）
- 沟通禁忌（德国不能催，日本不能绕弯）

---

## 学习机制

每次应答后，业务员可以反馈：
- ✅ 这个话术有效 → 标记为成功案例
- ❌ 客户不接受 → 记录原因，补充新策略
- 🆕 新场景 → 添加到异议库

积累的实际案例越多，应答越精准。

---

## 版本历史

| 版本 | 日期 | 更新内容 |
|------|------|---------|
| 1.0.0 | 2026-04-11 | 初始版本，15异议+6语种+产品FAQ |
| 1.1.0 | 2026-04-14 | 合并sales-response精华：谈判策略库(negotiation-tactics.md)、18国文化画像(cultural-profiles.md)、竞品情报(competitor-intel.md)；废除PARTNER-REGISTRY.md |

---

_Version: 1.1.0_
