---
name: global-customer-acquisition
version: 2.3.0
description: 红龙全网获客系统 v2.3.0 - 业务员全能技能。详细文档：docs/INDEX.md
---

# 红龙获客系统 v2.3.0

> 业务员说什么都能做的全能获客+运营技能
>
> 📚 **完整文档**：[docs/INDEX.md](docs/INDEX.md) | [在线文档](https://github.com/Wike-CHI/customer-acquisition-skills)
>
> ⭐ **v2.3.0 更新**：整合三层记忆系统（HOT/WARM/COLD）+ 5种学习信号 + 自动晋升/降级机制

---

## 🚀 5分钟快速开始

### 第1步：安装（首次使用）

```bash
# 1. 克隆项目
git clone https://github.com/Wike-CHI/customer-acquisition-skills.git
cd customer-acquisition-skills

# 2. 安装依赖
npm install

# 3. 配置凭据
cp .env.example .env
# 编辑 .env 填写真实凭据

# 4. 验证配置
npm run setup:security
```

### 第2步：开始使用

业务员只需要说：

| 业务员说 | AI做什么 |
|---------|---------|
| "帮我找美国传送带客户" | 深度调研：美国 conveyor belt |
| "我想开发巴西市场" | 市场分析 + 批量获客 |
| "帮我背调这家公司" | 6维度ICP评分 + 报告 |
| "给这家公司发开发信" | 开发信生成v2.0（≥9.0分）+ 发送 |
| "生成报价单" | .docx报价单 |
| "帮我发一篇Facebook" | 生成帖子 + 发布 |
| "查看Pipeline" | 客户状态报表 |

### 第3步：验证

```bash
# 运行测试
npm test

# 查看覆盖率
npm run test:coverage
```

---

## 📋 核心功能速查

### 客户发现

```
深度调研：[国家] [产品]
批量获客：[国家] [关键词]
LinkedIn 决策人：[公司名]
```

### 客户开发

```
背调：[公司名]
开发信：[公司] [类型] [产品]
生成报价单：[公司]
发送：[公司] [邮箱]
```

### 社媒运营

```
生成Facebook帖子：[产品/话题]
生成Instagram内容：[产品]
生成LinkedIn文章：[主题]
生成本周内容日历
```

### 管理功能

```
查看Pipeline
待跟进客户
生成日报
初始化获客系统
检查获客状态
```

---

## 🎯 系统架构

```
Skills Router → 意图识别 → 渠道选择 → 故障切换
     ↓
7层上下文 → IDENTITY → SOUL → AGENTS → USER → HEARTBEAT → MEMORY → TOOLS
     ↓
获客流程 → 发现 → 情报 → 触达 → 支持 → 管理
     ↓
执行控制 → 轨迹追踪 + 循环检测 + 置信度监控
     ↓
自进化系统 → 反馈 → 优化 → GitHub提交
```

**详细架构**：查看 [SYSTEM-ARCHITECTURE.md](SYSTEM-ARCHITECTURE.md)

---

## 🧩 7层上下文系统

| 层级 | 文件 | 用途 | 修改 |
|------|------|------|------|
| L1 | `context/identity.md` | 公司身份 | ❌ |
| L2 | `context/soul.md` | AI人格 | ❌ |
| L3 | `context/agents.md` | 销售手册 | ❌ |
| L4 | `context/user.md` | 业务员信息 | ✅ |
| L5 | `context/memory.md`#heartbeat | 13个定时任务 | ❌ |
| L6 | `context/memory.md` | 4层抗遗忘 | ❌ |
| L7 | `TOOLS.md` | 工具配置 | ⚠️ |

**详细说明**：查看 [ANTI-AMNESIA.md](ANTI-AMNESIA.md)

---

## 🔄 11步获客流程

```
Step 0: 智能路由 → 自动选渠道
Step 1: 客户发现 → 搜索潜在客户
Step 1.5: 联系方式获取 → ⚠️ 无邮箱不继续
Step 2: 客户查重 → 防止重复开发
Step 3: 企业背调 → ICP 6维度评分
Step 4: LinkedIn决策人 → Exa搜索
Step 5: 竞品分析 → 差异化话术
Step 6: 开发信生成 → v2.0打磨，≥9.0分
Step 6.5: 报价单 → .docx
Step 7: 邮件发送 → 分段队列
Step 8: Pipeline更新 → .xlsx
Step 8.5: 跟进管理 → 日历提醒
Step 9: 日报生成
```

**详细流程**：查看 [references/PIPELINE.md](references/PIPELINE.md)

---

## 📊 ICP评分体系（6维度×100分）

| 维度 | 权重 | 评分依据 |
|------|------|----------|
| 行业匹配度 | 20% | 传送带相关采购占比 |
| 采购能力 | 20% | 海关金额（S/A/B/C/D/E级）|
| 采购频率 | 20% | 交易次数+最新日期 |
| 客户类型 | 15% | 制造商=10/经销商=8/终端=5 |
| 决策周期 | 15% | 企业规模推断 |
| 决策人联系 | 10% | LinkedIn/官网联系方式 |

**客户等级**：A级≥70分 | B级50-69分 | C级30-49分 | D级<30分

---

## ✉️ 开发信生成（v2.0 真正打磨流程）

**强制调用**：`cold-email-generator` + `humanize-ai-text`

**标准打磨流程**：
```python
生成初稿
  ↓
第1轮润色（humanize-ai-text）
  ↓
第1轮评分（满分10分）
  ↓
< 9.0分？
  ├─ 是 → 第2轮润色 → 第2轮评分
  └─ 否 → 最终版本（≥9.0分）
```

**评分标准**：个性化(2.0) + 相关性(2.0) + 简洁性(2.0) + 语法(2.0) + 去AI味(2.0) + CTA(2.0)

**详细说明**：查看 [EMAIL-QUALITY-CHECK.md](EMAIL-QUALITY-CHECK.md)

---

## 🎭 社媒运营

### Facebook
```
生成Facebook帖子：[产品/话题]
Facebook运营建议
分析Facebook数据
```

### Instagram
```
生成Instagram内容：[产品]
生成Reels脚本
规划内容日历
```

### LinkedIn
```
生成LinkedIn文章：[主题]
LinkedIn内容日历
LinkedIn运营策略
```

**详细指南**：查看 [references/SOCIAL-MEDIA.md](references/SOCIAL-MEDIA.md)

---

## 🔧 配置和管理

### 首次配置

```bash
# 1. 填写业务员信息
编辑 context/user.md

# 2. 配置凭据
编辑 .env

# 3. 验证配置
npm run setup:security
```

### 管理命令

```
初始化获客系统    # 首次配置向导
检查获客状态      # 查看系统健康
配置所有账号      # 配置凭据
获客系统帮助      # 查看帮助
```

---

## 🛡️ 安全和测试

### 安全检查

```bash
npm run setup:security  # 安全配置检查
npm run security:audit  # 依赖安全审计
```

**安全指南**：查看 [SECURITY-GUIDE.md](SECURITY-GUIDE.md)

### 测试

```bash
npm test              # 运行所有测试
npm run test:coverage # 查看覆盖率
npm run test:watch    # 监视模式
```

**测试文档**：查看 [tests/README.md](tests/README.md)

---

## 📚 完整文档

### 快速导航

- **[docs/INDEX.md](docs/INDEX.md)** - 完整文档索引
- **[QUICK-START.md](QUICK-START.md)** - 快速开始
- **[INSTALL.md](INSTALL.md)** - 安装指南
- **[CHANGELOG.md](CHANGELOG.md)** - 版本历史

### 核心文档

- **[SKILL.md](SKILL.md)** - 主技能文件（本文件）
- **[AGENTS.md](AGENTS.md)** - 产品知识库
- **[SYSTEM-ARCHITECTURE.md](SYSTEM-ARCHITECTURE.md)** - 系统架构
- **[CHANNEL-ROUTER.md](CHANNEL-ROUTER.md)** - 技能路由器

### 业务流程

- **[references/PIPELINE.md](references/PIPELINE.md)** - 获客流程
- **[EMAIL-QUALITY-CHECK.md](EMAIL-QUALITY-CHECK.md)** - 邮件质量
- **[COMPETITOR-ANALYSIS-GUIDE.md](COMPETITOR-ANALYSIS-GUIDE.md)** - 竞品分析

### 集成部署

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - 部署指南
- **[AGENT-REACH-INTEGRATION.md](AGENT-REACH-INTEGRATION.md)** - Agent Reach
- **[TOOLS.md](TOOLS.md)** - 工具配置

### 故障排除

- **[references/TROUBLESHOOT.md](references/TROUBLESHOOT.md)** - 常见问题
- **[FALLBACK-PLAN.md](FALLBACK-PLAN.md)** - 回退方案
- **[EXECUTION-CONTROL.md](EXECUTION-CONTROL.md)** - ECL控制层

---

## 🔗 相关链接

- **GitHub**: https://github.com/Wike-CHI/customer-acquisition-skills
- **官网**: https://www.holobelt.com
- **联系**: wikeye2025@163.com

---

*版本：v2.3.0*
*最后更新：2026-04-02*
*Built with ❤️ by HOLO Team*
