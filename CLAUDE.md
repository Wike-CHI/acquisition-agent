# acquisition-agent — 开发者指南

> 维护人：Wike
> 创建：2026-04-22

---

## 项目定位

acquisition-agent 是 **HOLO Agent 的内置获客技能库**，包含 82 个活跃技能 + 50 个归档技能，通过 SKILL.md 格式定义 AI 技能的行为和提示词。

---

## 目录结构

```
acquisition-agent/
├── skills/              82个活跃技能（SKILL.md 格式）
│   ├── acquisition-coordinator/   任务编排器
│   ├── company-research/           企业背调
│   ├── cold-email-generator/       开发信生成
│   ├── smart-quote/                智能报价
│   └── ...（共82个）
├── archive/              50个已归档技能
├── workspace/            工作空间模板
│   ├── AGENTS.template.md       AI SDR Pipeline
│   ├── HEARTBEAT.template.md     心跳巡检
│   ├── IDENTITY.template.md      公司身份
│   ├── MEMORY.template.md        长期记忆
│   ├── SOUL.template.md          AI 灵魂/人格
│   ├── USER.template.md          用户画像
│   ├── TOOLS.template.md         工具配置
│   ├── ROUTING-TABLE.yaml        技能路由表
│   ├── SKILLS-MANIFEST.yaml      技能分类目录
│   └── operator-config.template.md
├── product-kb/           产品知识库
├── docs/                 内部文档
│   ├── internal/
│   ├── DECOUPLING-ROADMAP.md    解耦路线图
│   └── SKILL-FORMAT-STANDARD.md 技能格式标准
├── examples/             行业场景模板
├── local/                Windows 特定工具
└── deploy/               部署脚本
```

---

## 技能格式

每个技能是一个目录，包含 `SKILL.md` 文件。格式示例：

```markdown
---
name: company-research
description: 海外B2B企业背景调查
triggers:
  - "查一下 {公司名}"
  - "调研 {公司名}"
  - "/research {公司名}"
inputs:
  companyName:
    type: string
    required: true
    description: 公司名称
outputs:
  report:
    type: object
    description: 调研报告
---

# 企业背景调查技能

你是一个专业的企业调研助手...

## 调查维度

1. 公司基本信息
2. 财务状况
3. 市场规模
4. 联系方式
...
```

---

## 与 HOLO Agent 的集成

### 打包流程

1. `holo-agent/scripts/bundle-acquisition-skills.mjs`
   - 从 GitHub 拉取 `skills/`、`workspace/`、`product-kb/`
   - 排除 `_archived/` 和 `config/` 目录
   - 打包到 `holo-agent/build/acquisition-skills/`

2. electron-builder 打包时放入 `resources/`

3. 运行时 `holo-agent/electron/utils/acquisition-skills.ts`
   - 同步技能到 `~/.openclaw/skills/market/`
   - 同步 workspace 模板到 `~/.openclaw/workspace/`

### 增量同步

- 基于 SHA-256 内容 hash
- 只复制变更的技能
- 自动删除过时技能

---

## 技能分类

| 分类 | 数量 | 说明 |
|------|:----:|------|
| 获客核心流程 | 7 | acquisition-coordinator 等 |
| 客户调研与情报 | 7 | company-research, deep-research 等 |
| 触达与沟通渠道 | 9 | email-sender, whatsapp-outreach 等 |
| 社交媒体 | 8 | holo-social-gen, linkedin-writer 等 |
| 报价与提案 | 3 | smart-quote, quotation-generator 等 |
| 销售管线与CRM | 5 | sales-pipeline-tracker 等 |
| 产品与身份 | 2 | honglong-products |
| 记忆与知识管理 | 5 | humanoid-memory, smart-memory 等 |
| 搜索与网络工具 | 6 | exa-web-search-free 等 |
| 文档处理 | 7 | pdf-extract, document-pro 等 |
| 培训 | 2 | understand-honglong-acquisition 等 |
| 心跳与自动化 | 5 | proactive-agent, calendar-skill 等 |
| 报表与商务 | 2 | daily-report-writer 等 |
| 系统元技能 | 14 | skill-auditor, release-manager 等 |

---

## 开发命令

```bash
# 查看技能列表
ls skills/

# 创建新技能
cp -r skills/_template skills/my-new-skill

# 测试技能（需要 HOLO Agent 运行）
# 在 HOLO Agent 中输入技能的触发词

# 同步到 GitHub
cd acquisition-agent && git add . && git commit -m "feat: 添加新技能" && git push
```

---

## 铁律（7 条）

| 铁律 | 规则 |
|------|------|
| ICP铁律 | ICP≥75 才发邮件 |
| 邮箱铁律 | 必须决策人邮箱，禁用 info@/sales@ |
| 报价锁定铁律 | 客户问价必须锁对话等审批 |
| 矿业禁止铁律 | 禁止接触矿业终端客户（贸易商除外） |
| WhatsApp 72h铁律 | 72h 窗口外禁止主动推送 |
| 伙伴保护铁律 | Beltwin（温州贝尔顿）是十年合作伙伴，绝不攻击 |
| 区域定价底线铁律 | 各区域利润率不低于战略地图规定的最低值 |

## 战略参考
- `docs/全球大客户战略地图.md` — 11家竞品、9大区域、差异化定位
- 核心定位："European quality at 1/3 the price"
- 渠道策略：先做经销商的供应商

---

## 注意事项

1. **`skills/config/` 是内部配置目录，不是技能**，打包时会自动跳过
2. 所有技能必须有 `SKILL.md` 文件，否则打包失败
3. 技能触发词应该简洁，匹配业务员常用口语
