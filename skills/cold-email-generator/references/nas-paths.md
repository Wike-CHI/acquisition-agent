# NAS 路径与签名规范

> 开发信生成前的资料检查路径，和邮件签名配置。
> 每次生成开发信前，按此文档检查 NAS 资料并读取签名。

---

## 一、NAS 连接信息

| 项目 | 值 |
|------|-----|
| NAS IP | `192.168.0.98` |
| 共享路径 | `\\192.168.0.98\home` |
| 知识库根目录 | `\\192.168.0.98\home\knowledge` |
| 脚本目录 | `{{SKILL_DATA_DIR}}/knowledge-base/scripts/` |

### 挂载命令

```powershell
net use K: \\192.168.0.98\home /user:${env.NAS_USER} ${env.NAS_PASSWORD}
```

---

## 二、开发信前检查路径

生成开发信前，检查以下 NAS 资料是否存在：

| 检查项 | NAS 路径 | 检查内容 | 如果存在 |
|--------|---------|---------|---------|
| 客户档案 | `knowledge/companies/{公司名}.md` | 背调报告、ICP 评分 | 使用其中的个性化信息 |
| 已发邮件 | `knowledge/emails/{公司名}.md` | 是否已发过开发信 | 避免重复发送，或写跟进邮件 |
| 产品知识 | `knowledge/products/{产品线}/index.md` | 产品规格参数 | 用于匹配推荐 |

### 检查脚本

```powershell
# 检查客户档案
.\read-knowledge.ps1 -Type company -Name "{公司名}"

# 检查已发邮件记录
.\read-knowledge.ps1 -Type email -Name "{公司名}"

# 检查产品知识
.\read-knowledge.ps1 -Type products -Name "{产品线}"
```

### 检查决策树

```
开始写开发信
    ↓
检查 NAS → 客户档案存在？
├── 是 → 读取档案 → 使用个性化信息（公司动态、决策人、痛点）
│         ↓
│         检查 NAS → 已发邮件存在？
│         ├── 是 → 告知用户"已发送过" → 询问是否写跟进邮件
│         └── 否 → 继续生成首次开发信
│
└── 否 → 用用户提供的信息生成
          ↓
          建议用户先执行 company-research 背调
```

---

## 三、开发信后保存路径

发送开发信后，自动保存到 NAS：

| 保存项 | 路径 | 内容 |
|--------|------|------|
| 邮件记录 | `knowledge/emails/{公司名}.md` | 发送时间、邮件内容、评分 |
| 客户档案更新 | `knowledge/companies/{公司名}.md` | 新增开发历史记录 |

### 保存脚本

```powershell
# 保存邮件记录
.\write-knowledge.ps1 -Type email -Name "{公司名}" -ContentFile "临时文件路径"
```

### 邮件记录格式

```markdown
---
title: {公司名} - 开发信记录
created_time: {时间戳}
---

# {公司名} - 邮件记录

## 邮件 1（首次开发信）
- **发送时间**：{YYYY-MM-DD HH:mm}
- **收件人**：{邮箱}
- **主题行**：{Subject}
- **匹配产品**：{产品名}
- **评分**：{分数}/10
- **CTA 策略**：{S1/S2/S3/S4}
- **状态**：已发送 / 已回复 / 未回复
```

---

## 四、签名规范

### 签名来源（优先级）

| 优先级 | 来源 | 路径 | 说明 |
|--------|------|------|------|
| 1 | operator-config.md | `../../workspace/operator-config.md` | **首选**：一个文件包含全部身份信息 |
| 2 | .email_signatures.json | `{{SKILL_DATA_DIR}}/.email_signatures.json` | 降级：旧格式，可选 |

**生成签名时**，先读 `operator-config.md`，直接使用其中的「邮件签名」代码块。如果该文件不存在，降级到 `.email_signatures.json`。

### 签名结构

每封开发信末尾必须包含标准签名。签名包含以下要素：

```
[发送人姓名]
[职位] | [公司英文名]
[电话]
[邮箱]
[公司官网]
[一句话品牌标语]
```

### 签名规则

| 规则 | 说明 |
|------|------|
| 从 operator-config.md 读取 | 一个文件搞定，不自行编造 |
| 中英文分离 | 英文开发信用英文签名 |
| 不超过 6 行 | 签名太长显得不专业 |
| 不含营销语 | 签名是身份标识，不是广告位 |
| 禁止emoji | B2B 邮件签名不用 emoji |

> **注意**：如果 operator-config.md 不存在或字段仍为"未设置"，使用通用占位签名并提醒业务员运行 `workspace/setup-user.ps1` 完成配置。

---

## 五、路径速查

| 你要做的 | 路径/命令 |
|---------|----------|
| 检查客户档案 | `read-knowledge -Type company -Name "{公司名}"` |
| 检查邮件记录 | `read-knowledge -Type email -Name "{公司名}"` |
| 检查产品知识 | `read-knowledge -Type products -Name "{产品线}"` |
| 保存邮件记录 | `write-knowledge -Type email -Name "{公司名}" -ContentFile ...` |
| 读取签名 | `../../workspace/operator-config.md` |
| 搜索知识库 | `search-knowledge -Query "关键词"` |

---

_Version: 1.0.0 | 2026-04-22_
