---
name: meta-domain
description: 系统元技能领域 MOC。技能创建、审计、发现、发布管理——技能系统的自我维护能力。触发词：创建技能、审计、发布、更新技能。
version: 1.0.0
capability: meta
priority: 40
---

# 系统元技能

> **"技能本身如何维护？"** — 本领域是技能的"元层"：创建技能、审计健康度、发现可用技能、管理发布。

## 技能节点

### 技能生命周期
- **[[skill-creator]]** — 技能创建指南。帮助创建或更新 SKILL.md 技能文件。遵循 `docs/SKILL-FORMAT-STANDARD.md` 格式规范。**创建新技能的唯一入口。**
- **[[skill-auditor]]** — 技能审计。审查并优化 Hermes Agent 技能，检查格式、冗余、触发冲突。
- **[[skill-system-audit]]** — 技能系统全面审计。冗余检测、触发冲突、描述质量、使用频率统计——全库健康检查。
- **[[skill-onboarding-checklist]]** — 新技能入职检查清单。格式合规、描述完整、触发词准确、依赖声明——标准化检查流程。
- **[[skill-discovery]]** — 技能发现（取代 skill-finder-cn）。搜索本地和云端技能库，发现可复用技能。

### 发布管理
- **[[release-manager]]** — 发布管理器。管理版本发布流程，生成 CHANGELOG，标记版本号。
- **[[holo-updater]]** — HOLO Agent 更新技能。从 GitHub 拉取最新版本到本地。

### 配置与凭据
- **[[credential-manager]]** — 统一凭据管理。对话式配置各平台账号密码，Windows DPAPI 安全加密存储。
- **[[config]]** — 内部配置目录（非技能，打包时自动跳过）。系统级配置文件。
- **[[bash-patch-safe]]** — Bash 脚本安全 patch 指南。防止误伤函数定义、调用丢失、参数解析缺失。

### 开发工具
- **[[MCP管理器]]** — MCP 服务器管理。通过 mcporter CLI 列出、配置、认证、调用 MCP 服务器。

## 遍历指引

- 创建新技能 → [[skill-creator]]
- 审计技能库 → [[skill-system-audit]]
- 查找可用技能 → [[skill-discovery]]
- 新技能入职 → [[skill-onboarding-checklist]]
- 发布新版本 → [[release-manager]]
- 升级系统 → [[holo-updater]]
- 配置凭据 → [[credential-manager]]

---

## 关联领域

元技能服务于所有其他领域。发现/创建新技能后，可能影响：
- [[_index-acquisition]]（新获客流程）
- [[_index-discovery]]（新调研方法）
- [[_index-outreach]]（新触达渠道）
