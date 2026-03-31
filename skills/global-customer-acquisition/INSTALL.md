# 完整安装指南

> 全网获客系统 - 从零开始的完整安装
> 版本: v1.2.0 | 更新: 2026-03-27

---

## 📋 系统要求

| 组件 | 最低版本 | 推荐版本 | 检查命令 |
|------|----------|----------|----------|
| **Windows** | 10 | 11 | `winver` |
| **Python** | 3.10 | 3.14 | `python --version` |
| **Node.js** | 16 | 20+ | `node --version` |
| **Git** | 2.0 | 最新 | `git --version` |
| **OpenClaw** | 1.0.0 | 最新 | `openclaw --version` |

---

## 🚀 快速安装（5分钟）

### Step 1: 克隆仓库

```powershell
# 进入 OpenClaw 技能目录
cd C:\Users\Administrator\.agents\skills\

# 克隆仓库
git clone https://github.com/Wike-CHI/customer-acquisition-skills.git

# 进入目录
cd customer-acquisition-skills
```

### Step 2: 运行初始化脚本

```powershell
# 运行自动安装
.\scripts\init.ps1

# 等待安装完成（约3-5分钟）
```

### Step 3: 启动服务

```powershell
# 启动 MCP 服务
.\scripts\start-services.ps1

# 等待服务启动（约30秒）
```

### Step 4: 验证安装

```powershell
# 运行测试
.\scripts\test.ps1

# 应该看到所有测试通过 ✅
```

---

## 📦 手动安装（详细）

### 1. 安装 Python 依赖

```powershell
# 升级 pip
python -m pip install --upgrade pip

# 安装核心依赖
pip install mcp fastmcp requests beautifulsoup4 lxml patchright inquirer python-dotenv

# 安装 Agent Reach
pip install git+https://github.com/Panniantong/agent-reach.git

# 安装 LinkedIn MCP
pip install linkedin-scraper-mcp

# 安装抖音 MCP
pip install douyin-mcp-server
```

### 2. 安装 Node.js 依赖

```powershell
# 安装 mcporter
npm install -g mcporter
```

### 3. 配置 mcporter

```powershell
# 创建配置目录
New-Item -ItemType Directory -Path "$env:USERPROFILE\.mcporter" -Force

# 复制配置文件
Copy-Item ".\config\mcporter.json" "$env:USERPROFILE\.mcporter\mcporter.json" -Force
```

### 4. 配置 Agent Reach

```powershell
# 运行 Agent Reach 初始化
agent-reach install --env=auto

# 或手动配置
agent-reach configure
```

### 5. 验证安装

```powershell
# 检查 Python 包
pip list | Select-String "mcp|fastmcp|agent-reach|linkedin|douyin"

# 检查 Node.js 包
npm list -g mcporter

# 检查 mcporter 配置
mcporter list

# 测试渠道
mcporter call "weibo.search_users(keyword: 'test', limit: 1)"
mcporter call "exa.web_search_exa(query: 'test', numResults: 1)"
```

---

## 🔧 配置

### 1. mcporter 配置

**位置**: `~/.mcporter/mcporter.json`

```json
{
  "mcpServers": {
    "weibo": {
      "command": "mcp-server-weibo"
    },
    "exa": {
      "baseUrl": "https://mcp.exa.ai/mcp"
    },
    "linkedin": {
      "baseUrl": "http://localhost:8001/mcp"
    },
    "douyin": {
      "baseUrl": "http://localhost:18070/mcp"
    }
  }
}
```

### 2. Agent Reach 配置

**位置**: `~/.agent-reach/`

```powershell
# 查看配置
agent-reach doctor

# 配置渠道
agent-reach configure twitter-cookies "auth_token=xxx; ct0=yyy"
agent-reach configure groq-key gsk_xxxxx
```

### 3. 环境变量

创建 `.env` 文件（可选）:

```bash
# LinkedIn
LINKEDIN_EMAIL=your-email@example.com
LINKEDIN_PASSWORD=your-password

# Exa
EXA_API_KEY=your-exa-api-key

# Groq（小宇宙）
GROQ_API_KEY=gsk_xxxxx
```

---

## 🎯 启动服务

### 自动启动（推荐）

```powershell
# 启动所有服务
.\scripts\start-services.ps1

# 或手动启动
python -m linkedin_mcp_server --transport streamable-http --port 8001
python -m douyin_mcp_server
```

### 检查服务状态

```powershell
# 检查端口
netstat -ano | Select-String "8001|18070"

# 检查进程
Get-Process python | Where-Object { $_.CommandLine -like "*mcp*" }

# 测试 mcporter
mcporter list
```

---

## ✅ 验证

### 完整测试

```powershell
# 运行完整测试套件
.\scripts\test.ps1
```

### 预期输出

```
========================================
全网获客系统 - 测试 v1.2.0
========================================

测试 1/4: 检查渠道状态

✅ mcporter 可用
  ✅ weibo
  ✅ exa
  ✅ linkedin
  ✅ douyin

测试 2/4: 微博搜索

✅ 微博搜索成功
[{"id": 123, "screen_name": "测试用户", ...}]

测试 3/4: Exa 搜索

✅ Exa 搜索成功

测试 4/4: Jina Reader

✅ Jina Reader 可用

========================================
✅ 测试完成！
========================================

如果所有测试通过，系统已准备就绪！
```

---

## 🚨 故障排查

### 问题1: mcporter 找不到

**症状**:
```
mcporter : 无法将"mcporter"项识别为 cmdlet、函数、脚本文件或可运行程序的名称
```

**解决**:
```powershell
# 方法1: 重新安装
npm install -g mcporter

# 方法2: 使用 npx
npx mcporter list

# 方法3: 检查 PATH
npm config get prefix
# 确保包含在系统 PATH 中
```

---

### 问题2: LinkedIn MCP 无法启动

**症状**:
```
ModuleNotFoundError: No module named 'linkedin_mcp_server'
```

**解决**:
```powershell
# 检查包名
pip show linkedin-scraper-mcp

# 正确的启动命令
python -m linkedin_mcp_server --transport streamable-http --port 8001

# 或使用完整包名
python -c "from linkedin_mcp_server.server import mcp; mcp.run(transport='streamable-http')"
```

---

### 问题3: 端口被占用

**症状**:
```
OSError: [Errno 10048] error while attempting to bind on address ('127.0.0.1', 8001)
```

**解决**:
```powershell
# 查找占用进程
netstat -ano | Select-String "8001"

# 结束进程（替换 PID）
taskkill /F /PID <PID>

# 或更换端口
python -m linkedin_mcp_server --port 8002
```

---

### 问题4: Python 版本不兼容

**症状**:
```
SyntaxError: invalid syntax
```

**解决**:
```powershell
# 检查 Python 版本
python --version

# 需要升级到 3.10+
# Windows: 从 python.org 下载安装
# 或使用 pyenv-win 管理多版本
```

---

## 📚 下一步

### 1. 学习使用

```bash
# 查看快速开始指南
cat QUICK-START.md

# 测试示例
批量获客：美国传送带制造商，10家
```

### 2. 自定义配置

```bash
# 编辑配置文件
notepad config\mcporter.json

# 添加新渠道
mcporter config add <channel-name> <command-or-url>
```

### 3. 反馈优化

使用后提供反馈，帮助系统持续改进：

```
流程完成后 → 评分 + 建议 → 系统自动优化 → 推送GitHub
```

---

## 📞 获取帮助

- **文档**: `README.md`, `QUICK-START.md`
- **依赖**: `dependencies/README.md`
- **配置**: `config/mcporter.json`
- **问题**: 查看 `FALLBACK-PLAN.md`

---

_安装指南版本: v1.2.0_
_更新时间: 2026-03-27_
