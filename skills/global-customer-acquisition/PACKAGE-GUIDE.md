# 打包指南

> 给其他业务员分发技能前，执行以下步骤。

---

## 打包步骤

### 第一步：确认你的信息已排除

打包前，**确认 `context/user.md` 里是你的"请填写"状态**，而不是真实信息。

```
context/user.md 中的状态：
✅ 正确：| 姓名 | 请填写你的姓名 |
❌ 错误：| 姓名 | 张三 |
```

### 第二步：执行打包脚本

```bash
python scripts/package.py
```

脚本自动排除个人文件 + 开发历史文档后生成 `honglong-acquisition-v2.1.0.zip`。

### 第三步：分发 zip 包

---

## 打包内容

### 技能集群（27个，已全部内置）

> **无需额外安装**，所有依赖技能已打包在 `skills/` 目录中。

| 集群 | 包含技能 |
|------|---------|
| 平台工具 | **agent-reach**（pip install 即可，13+ 平台读取）|
| 插件层 | chroma-memory、supermemory、delivery-queue、quotation-generator |
| 协调层 | acquisition-coordinator、acquisition-workflow、acquisition-init |
| 获客层 | teyi-customs、facebook-acquisition、instagram-acquisition |
| 邮件层 | email-sender、cold-email-generator、sdr-humanizer、humanize-ai-text、email-outreach-ops |
| 社媒层 | linkedin、linkedin-writer、ai-social-media-content |
| 背调层 | company-research、deep-research、market-research |
| 数据层 | crm、fumamx-crm、exa-search |
| 辅助层 | brave-web-search、browser-automation、sales-pipeline-tracker |
| 知识层 | honglong-products（180MB产品资料）、honglong-assistant |

### 排除内容

| 类型 | 说明 |
|------|------|
| `context/user.md` | 业务员个人信息，打包时排除，接收者填写 |
| `data/` | 个人数据 |
| `test-output/` | 测试输出 |
| `temp-*.*` | 临时文件 |
| `*.log` | 日志文件 |
| 开发历史文档 | COMPLETE-AUDIT/BOOTSTRAP/ENHANCEMENT 等 40+ 个开发记录 |

---

## 接收者安装流程

```
1. 解压 honglong-acquisition-v2.1.0.zip 到 ~/.workbuddy/skills/
2. 打开 context/user.md 填写自己的信息
3. 配置凭据：
   - 配置邮箱（SMTP）
   - 配置 Exa API Key
   - 配置 DeepSeek API Key
```

---

## 验证命令

```bash
python scripts/verify-clean.py
```

- ✅ All clean — 可以打包
- ❌ Found personal data — 先确认 user.md 为安全状态


## agent-reach 安装（平台级工具）

> agent-reach 集成 13+ 平台，pip install 后即可使用，读取客户社媒/竞品内容，无需付费 API。

### 安装

`ash
pip install agent-reach
agent-reach install --env=auto
agent-reach doctor
`

### 渠道状态

| 渠道 | 安装 | 说明 |
|------|------|------|
| LinkedIn | 无需配置 | fetch-webpage 或 mcporter |
| Twitter/X | cookie | 可选 |
| Reddit | 无需配置 | Exa 替代 |
| YouTube/B站 | proxy | 可选 |
| 微信文章 | miku_ai | 无 API 依赖 |

### 触发词

- 读取客户 LinkedIn/网站/文档 URL：直接丢链接
- 竞品社媒动态：mcporter call xiaohongshu.search_feeds(keyword)
- 播客字幕：yt-dlp --write-auto-sub
- RSS 订阅：feedparser

