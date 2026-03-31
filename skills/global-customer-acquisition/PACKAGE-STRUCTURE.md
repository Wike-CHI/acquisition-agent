# 红龙获客系统 - v1.3.0 完整打包结构

> 打包时间: 2026-03-27 14:30
> 作者: Wike-CHI
> 版本: v1.3.0

---

## 📦 打包内容

### 根目录（11个配置文件）

| 文件 | 大小 | 说明 |
|------|------|------|
| acquisition-cluster.json | 10.6 KB | **技能集群配置** |
| AGENTS.md | 7.9 KB | Agent配置 |
| heartbeat.md | 5.4 KB | 心跳检查配置 |
| identity.md | 3.0 KB | 身份信息 |
| memory.md | 10.0 KB | 记忆文件 |
| readme.md | 5.4 KB | 说明文档 |
| setup.md | 4.6 KB | 安装指南 |
| soul.md | 1.7 KB | 角色设定 |
| tools.md | 4.8 KB | 工具配置 |
| usage.md | 4.7 KB | 使用指南 |
| user.md | 210 B | 用户信息 |

---

## 📁 skills 目录（86个技能）

### 获客核心技能（6个）

| 技能 | 说明 |
|------|------|
| **global-customer-acquisition** | 主技能 - 全网获客系统 |
| **acquisition-coordinator** | 获客协调器 |
| **acquisition-init** | 获客初始化 |
| **acquisition-workflow** | 获客工作流 |
| **customer-deduplication** | 客户去重 |
| **customer-intelligence** | 客户智能 |

### LinkedIn & 邮件（6个）

| 技能 | 说明 |
|------|------|
| **linkedin** | LinkedIn集成 |
| **linkedin-writer** | LinkedIn内容撰写 |
| **email-outreach-ops** | 邮件触达运营 |
| **email-sender** | 邮件发送 |
| **email-marketing** | 邮件营销 |

### 社交媒体（2个）

| 技能 | 说明 |
|------|------|
| **facebook-acquisition** | Facebook获客 |
| **instagram-acquisition** | Instagram获客 |

### 企业研究（3个）

| 技能 | 说明 |
|------|------|
| **company-research** | 企业研究 |
| **market-research** | 市场调研 |
| **marketing-strategy-pmm** | 营销策略 |

### 工具支持（8个）

| 技能 | 说明 |
|------|------|
| **browser-automation** | 浏览器自动化 |
| **playwright** | Playwright自动化 |
| **crm** | CRM管理 |
| **multi-search-engine** | 多引擎搜索 |
| **sales-pipeline-tracker** | 销售管道追踪 |
| **mcporter** | MCP服务管理 |
| **teyi-customs** | 特易海关数据 |
| **nas-file-reader** | NAS文件读取 |

### 内容处理（5个）

| 技能 | 说明 |
|------|------|
| **document-pro** | 文档处理 |
| **excel-xlsx** | Excel处理 |
| **pdf-extract** | PDF提取 |
| **pdf-smart-tool-cn** | PDF智能工具 |
| **pptx** | PowerPoint处理 |

### 记忆 & 报告（6个）

| 技能 | 说明 |
|------|------|
| **memory** | 记忆管理 |
| **elite-longterm-memory** | 高级长期记忆 |
| **humanoid-memory** | 人形记忆 |
| **smart-memory** | 智能记忆 |
| **daily-report-writer** | 日报撰写 |
| **openclaw-memory** | OpenClaw记忆 |

### 红龙专用（2个）

| 技能 | 说明 |
|------|------|
| **honglong-products** | 红龙产品知识库 |
| **honglong-assistant** | 红龙助手 |

### 开发工具（6个）

| 技能 | 说明 |
|------|------|
| **acp** | ACP编码平台 |
| **claude-code** | Claude Code |
| **agentic-coding** | Agent编码 |
| **skill-developer** | 技能开发器 |
| **skill-creator** | 技能创建器 |
| **gitai-skill** | GitAI技能 |

### 其他支持（48个）

- autoresearch - 自动研究
- business-development - 业务开发
- cicd-pipeline - CI/CD流水线
- credential-manager - 凭证管理
- delivery-queue - 投递队列
- elevenlabs - 语音合成
- release-manager - 发布管理
- sdr-humanizer - SDR人性化
- self-improving-agent - 自我改进Agent
- self-improving-proactive-agent - 自我改进主动代理
- web-pilot - 网页导航
- 等等...

---

## 📊 统计

| 项目 | 数量 |
|------|------|
| **总文件数** | 1225个 |
| **总大小** | ~180 MB |
| **技能数量** | 86个 |
| **核心功能** | 6大模块 |
| **依赖技能** | 12个 |
| **可用渠道** | 9个 |

---

## 🚀 安装方式

### 方法1: 解压到OpenClaw目录

```powershell
# 解压到技能目录
Expand-Archive customer-acquisition-skills-v1.3.0.zip -DestinationPath C:\Users\Administrator\.agents

# 或
Expand-Archive customer-acquisition-skills-v1.3.0.zip -DestinationPath C:\Users\Administrator\.openclaw\workspace
```

### 方法2: 运行初始化脚本

```powershell
cd skills\global-customer-acquisition
.\scripts\init.ps1
```

---

## 🎯 快速使用

```
帮我找10个美国的工业皮带分销商
从海关数据查秘鲁的输送带采购商
在LinkedIn上搜索德国的皮带经销商
```

---

_版本: v1.3.0_
_打包时间: 2026-03-27 14:30_
