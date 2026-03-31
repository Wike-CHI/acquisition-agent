# BOOTSTRAP.md - 获客技能集群启动指南

> 版本: 2.3.0
> 更新时间: 2026-03-28

---

## 🚀 快速启动

### 1️⃣ 环境要求

| 组件 | 版本 | 说明 |
|------|------|------|
| **Node.js** | v24.14.0+ | JavaScript 运行时 |
| **Python** | 3.8+ | 文件生成脚本 |
| **OpenClaw** | 最新版 | AI 框架 |

### 2️⃣ 依赖安装

#### Python 依赖

```bash
pip install python-docx openpyxl pypdf python-pptx
```

#### Node.js 依赖

```bash
npm install openpyxl docx pypdf pptxgenjs
```

---

## 📋 启动检查清单

### ✅ 启动前检查

| 检查项 | 命令 | 预期结果 |
|--------|------|----------|
| Node.js 版本 | `node --version` | v24.14.0+ |
| Python 版本 | `python --version` | Python 3.8+ |
| 技能目录存在 | `ls customer-acquisition-skills/` | 显示文件列表 |
| 配置文件存在 | `ls config/` | products.json, customer-status.json |

### ✅ 依赖检查

| 检查项 | 命令 | 说明 |
|--------|------|------|
| Python 包 | `pip list \| grep -E "docx\|openpyxl\|pypdf"` | 应显示已安装 |
| 技能可用 | `cd customer-acquisition-skills && node scripts/audit-skill-cluster.py` | 健康度 ≥ 80% |

---

## 🔧 初始化步骤

### Step 1: 验证环境

```bash
# 检查 Node.js
node --version

# 检查 Python
python --version

# 检查技能目录
ls -la customer-acquisition-skills/
```

### Step 2: 安装依赖

```bash
# Python 依赖
pip install -r requirements.txt

# 或手动安装
pip install python-docx openpyxl pypdf python-pptx
```

### Step 3: 验证配置

```bash
# 检查产品配置
cat customer-acquisition-skills/config/products.json | grep "version"

# 检查客户状态配置
cat customer-acquisition-skills/config/customer-status.json | grep "version"
```

### Step 4: 运行测试

```bash
# 进入技能目录
cd customer-acquisition-skills

# 运行单元测试
node tests/test-integration.js

# 运行文件生成测试
python tests/generate-real-files.py

# 运行完整审查
python scripts/audit-skill-cluster.py
```

### Step 5: 检查外部技能

```bash
# 运行部署验证
node scripts/deploy-check.js
```

---

## 🎯 启动后验证

### ✅ 功能验证

| 功能 | 验证方法 | 预期结果 |
|------|----------|----------|
| **报价单生成** | 生成测试报价单 | 创建 .docx 文件 |
| **客户管理** | 生成测试客户列表 | 创建 .xlsx 文件 |
| **开发信润色** | 润色测试邮件 | 返回润色结果 |
| **技能选择** | 运行技能测试 | 选择正确技能 |

### ✅ 数据验证

| 数据 | 验证方法 | 预期结果 |
|------|----------|----------|
| **产品型号** | `cat config/products.json \| grep "code"` | 显示 50+ 型号 |
| **客户状态** | `cat config/customer-status.json \| grep "key"` | 显示 9 个状态 |
| **ICP维度** | `cat config/customer-status.json \| grep "weight"` | 显示 6 个维度 |

---

## 🔗 主控技能

### global-customer-acquisition

**位置**: `~/.agents/skills/global-customer-acquisition`

**功能**: 主控技能，协调所有获客流程

**依赖技能**:
- 22个外部技能（100%可用）

**启动命令**:
```bash
# 在 OpenClaw 中
客户发现：[关键词]
背调：[公司名]
开发信：[客户信息]
```

---

### customer-acquisition-skills

**位置**: `~/.openclaw/workspace/customer-acquisition-skills`

**功能**: 主要工作目录，包含工具、配置、测试

**核心工具**:
- quotation-generator.js
- customer-manager.js
- email-polisher.js
- context-manager.js
- skill-controller.js
- memory-executor.js
- hard-case-miner.js
- skill-evolution-coordinator.js

---

### agent-reach

**位置**: `~/.openclaw/skills/agent-reach`

**功能**: 多渠道客户发现

**支持渠道**:
- 微博、LinkedIn、抖音、微信公众号
- V2EX、RSS、Jina Reader

---

## 📚 工作流文件

### 核心文件（7个）

| 文件 | 位置 | 功能 |
|------|------|------|
| **AGENTS.md** | workspace/ | 销售工作流手册 |
| **HEARTBEAT.md** | workspace/ | 自动化巡检规则 |
| **IDENTITY.md** | workspace/ | 公司身份定义 |
| **USER.md** | workspace/ | 负责人画像 |
| **TOOLS.md** | workspace/ | 工具使用指南 |
| **MEMORY.md** | workspace/ | 记忆存储 |
| **SOUL.md** | workspace/ | AI人格定义 |

---

## 🚨 故障排查

### 问题 1: 技能不可用

**症状**: 技能加载失败

**解决方案**:
```bash
# 检查技能目录
ls ~/.agents/skills/
ls ~/.openclaw/skills/

# 检查 SKILL.md
cat ~/.agents/skills/global-customer-acquisition/SKILL.md
```

---

### 问题 2: 配置文件缺失

**症状**: 配置加载失败

**解决方案**:
```bash
# 检查配置文件
ls customer-acquisition-skills/config/

# 验证 JSON 格式
python -m json.tool customer-acquisition-skills/config/products.json
```

---

### 问题 3: 测试失败

**症状**: 测试未通过

**解决方案**:
```bash
# 重新安装依赖
pip install --upgrade python-docx openpyxl pypdf

# 清理缓存
rm -rf node_modules/
npm install

# 重新运行测试
node tests/test-integration.js
```

---

## 📊 健康度检查

### 运行完整检查

```bash
cd customer-acquisition-skills
python scripts/audit-skill-cluster.py
```

### 预期结果

```
健康度: 95% (优秀)
状态: 🟢 可部署到生产环境

主控技能: 100%
外部技能: 100%
工作流文件: 87.5%
核心目录: 100%
```

---

## 🎯 下一步

### 启动后任务

| 任务 | 优先级 | 说明 |
|------|--------|------|
| **运行测试** | P0 | 确保所有功能正常 |
| **检查配置** | P0 | 验证产品和客户配置 |
| **验证技能** | P1 | 检查22个外部技能 |
| **开始获客** | P1 | 运行第一次获客流程 |

---

## 📝 版本信息

| 组件 | 版本 | 更新时间 |
|------|------|----------|
| **主控技能** | 2.3.0 | 2026-03-28 |
| **产品配置** | 2.3.0 | 2026-03-28 |
| **客户状态** | 2.0.0 | 2026-03-28 |
| **审查报告** | 1.0.0 | 2026-03-28 |

---

## 🎉 启动完成

**如果所有检查通过，获客技能集群已就绪！**

**开始使用**:
```bash
# 客户发现
客户发现：conveyor belt manufacturer USA

# 企业背调
背调：Ace Belting Company

# 生成开发信
开发信：Ace Belting，经销商，风冷机

# 生成报价单
生成报价单：Ace Belting Company
产品：风冷机 A2FRJ-1200 x 1
```

---

_版本: 2.3.0_
_更新时间: 2026-03-28_
_状态: ✅ 就绪_
