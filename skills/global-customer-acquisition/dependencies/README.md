# 依赖技能清单

> 全网获客系统依赖的所有技能和工具

---

## 🎯 核心依赖技能（12个）

### 1. multi-search-engine
- **版本**: 2.0.1
- **用途**: 多引擎聚合搜索
- **集成点**: 客户发现
- **提升**: +50% 覆盖率
- **安装**: OpenClaw技能市场

### 2. playwright
- **版本**: 1.0.3
- **用途**: 浏览器自动化
- **集成点**: 海关数据RPA
- **提升**: +30% 稳定性
- **安装**: `npm install playwright`

### 3. company-background-check
- **版本**: 1.0.0
- **用途**: 企业背调
- **集成点**: 企业背调
- **提升**: +专业评估
- **安装**: OpenClaw技能市场

### 4. company-research
- **版本**: 1.1.3
- **用途**: 中文企业背调
- **集成点**: 企业背调
- **提升**: +中文市场
- **安装**: OpenClaw技能市场

### 5. market-research
- **版本**: 1.0.1
- **用途**: 市场调研
- **集成点**: 竞争分析
- **提升**: +行业洞察
- **安装**: OpenClaw技能市场

### 6. email-outreach-ops
- **版本**: 1.0.0
- **用途**: 邮件触达运营
- **集成点**: 开发信跟进
- **提升**: +跟进节奏
- **安装**: OpenClaw技能市场

### 7. marketing-strategy-pmm
- **版本**: 2.1.1
- **用途**: 产品营销策略
- **集成点**: ICP/GTM规划
- **提升**: +专业化
- **安装**: OpenClaw技能市场

### 8. linkedin-writer
- **版本**: 1.0.0
- **用途**: LinkedIn内容撰写
- **集成点**: 客户触达
- **提升**: +LinkedIn私信
- **安装**: OpenClaw技能市场

### 9. browser-automation
- **版本**: 1.0.1
- **用途**: 浏览器自动化
- **集成点**: LinkedIn自动化
- **提升**: +自动化
- **安装**: OpenClaw技能市场

### 10. sales-pipeline-tracker
- **版本**: 1.0.0
- **用途**: 销售管道追踪
- **集成点**: 客户管理
- **提升**: +可视化
- **安装**: OpenClaw技能市场

### 11. crm
- **版本**: 1.0.0
- **用途**: CRM管理
- **集成点**: 客户档案
- **提升**: +结构化
- **安装**: OpenClaw技能市场

### 12. cold-email-generator
- **版本**: 1.0.0
- **用途**: 开发信生成
- **集成点**: 开发信生成
- **提升**: +个性化
- **安装**: OpenClaw技能市场

---

## 🛠️ 核心工具（4个）

### 1. Agent Reach
- **版本**: latest
- **用途**: 多渠道统一接口
- **安装**: `pip install git+https://github.com/Panniantong/agent-reach.git`
- **配置**: `agent-reach install --env=auto`

### 2. mcporter
- **版本**: 0.7.3
- **用途**: MCP服务管理
- **安装**: `npm install -g mcporter`
- **配置**: 复制 `config/mcporter.json` 到 `~/.mcporter/`

### 3. LinkedIn MCP
- **包名**: linkedin-scraper-mcp
- **版本**: 4.5.1
- **端口**: 8001
- **安装**: `pip install linkedin-scraper-mcp`
- **启动**: `python -m linkedin_mcp_server --transport streamable-http --port 8001`

### 4. 抖音 MCP
- **包名**: douyin-mcp-server
- **版本**: 1.2.1
- **端口**: 18070
- **安装**: `pip install douyin-mcp-server`
- **启动**: `python -m douyin_mcp_server`

---

## 📦 Python 依赖

```txt
mcp>=1.0.0
fastmcp
requests
beautifulsoup4
lxml
patchright
inquirer
python-dotenv
```

安装命令:
```bash
pip install mcp fastmcp requests beautifulsoup4 lxml patchright inquirer python-dotenv
```

---

## 📦 Node.js 依赖

```json
{
  "mcporter": "^0.7.3"
}
```

安装命令:
```bash
npm install -g mcporter
```

---

## 🚀 一键安装

### Windows (PowerShell)

```powershell
# 运行初始化脚本
cd C:\Users\Administrator\.openclaw\workspace\customer-acquisition-skills
.\scripts\init.ps1
```

### Linux/Mac (Bash)

```bash
# 运行初始化脚本
cd ~/.openclaw/workspace/customer-acquisition-skills
./scripts/init.sh
```

---

## ✅ 验证安装

```bash
# 测试所有依赖
.\scripts\test.ps1

# 应该看到：
# ✅ Python: Python 3.14.x
# ✅ Node.js: v18.x.x
# ✅ Git: git version 2.x.x
# ✅ mcporter 可用
# ✅ weibo
# ✅ exa
# ✅ linkedin
# ✅ douyin
# ✅ 微博搜索成功
# ✅ Exa 搜索成功
# ✅ Jina Reader 可用
```

---

## ⚠️ 常见问题

### Q1: mcporter 找不到？

**解决**:
```bash
npm install -g mcporter
# 或使用 npx
npx mcporter list
```

### Q2: LinkedIn MCP 无法启动？

**解决**:
```bash
# 检查 Python 版本
python --version  # 需要 3.14+

# 重新安装
pip uninstall linkedin-scraper-mcp
pip install linkedin-scraper-mcp

# 手动启动测试
python -m linkedin_mcp_server --help
```

### Q3: 抖音 MCP 启动失败？

**解决**:
```bash
# 检查依赖
pip install dashscope ffmpeg-python mcp

# 手动启动测试
python -m douyin_mcp_server
```

---

_依赖版本: v1.2.0_
_更新时间: 2026-03-27_
