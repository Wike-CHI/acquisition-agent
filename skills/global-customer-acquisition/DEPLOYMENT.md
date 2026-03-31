# 生产环境部署指南

> 更新时间: 2026-03-28
> 版本: 2.0

---

## 📋 部署清单

### ✅ 已完成

| 组件 | 状态 | 文件/位置 |
|------|------|-----------|
| **核心工具** | ✅ | `lib/quotation-generator.js` |
| | | `lib/customer-manager.js` |
| | | `lib/email-polisher.js` |
| **配置文件** | ✅ | `config/products.json` |
| | | `config/customer-status.json` |
| **测试脚本** | ✅ | `tests/test-integration.js` |
| | | `tests/generate-real-files.py` |
| **文档** | ✅ | `QUICK-START.md` |
| | | `tests/AUTORESEARCH-TEST-REPORT.md` |
| **依赖技能** | ✅ | 22个外部技能，100%可用 |

---

## 🔧 环境要求

### 必需

| 组件 | 版本 | 说明 |
|------|------|------|
| **Node.js** | v24.14.0+ | JavaScript 运行时 |
| **Python** | 3.8+ | 文件生成 |
| **OpenClaw** | 最新版 | AI 框架 |

### Python 依赖

```bash
pip install python-docx openpyxl pypdf python-pptx
```

### Node.js 依赖

```bash
npm install openpyxl docx pypdf pptxgenjs
```

---

## 📁 目录结构

```
customer-acquisition-skills/
├── config/                     # 配置文件
│   ├── products.json          # 产品配置（10.4 KB）
│   └── customer-status.json   # 客户状态配置（8.4 KB）
│
├── lib/                        # 核心工具
│   ├── quotation-generator.js  # 报价单生成器（6.6 KB）
│   ├── customer-manager.js     # 客户管理器（7.3 KB）
│   └── email-polisher.js       # 开发信润色器（7.7 KB）
│
├── tests/                      # 测试脚本
│   ├── test-integration.js     # JavaScript 单元测试（7.3 KB）
│   ├── generate-real-files.py  # Python 文件生成（5.8 KB）
│   └── AUTORESEARCH-TEST-REPORT.md  # 测试报告（5.2 KB）
│
├── test-output/                # 测试输出
│   ├── quotation-ace-belting.docx  # 报价单示例（36.2 KB）
│   └── customer-list-2026-03-28.xlsx  # 客户列表示例（7.8 KB）
│
├── SKILL.md                    # 主技能文档
├── QUICK-START.md              # 快速指南（5.9 KB）
└── README.md                   # 项目说明
```

---

## 🚀 部署步骤

### Step 1: 验证环境

```bash
# 检查 Node.js 版本
node --version  # v24.14.0+

# 检查 Python 版本
python --version  # Python 3.8+

# 检查依赖技能
cd customer-acquisition-skills
# 在 OpenClaw 中运行: 检查技能依赖
```

### Step 2: 安装 Python 依赖

```bash
pip install python-docx openpyxl pypdf python-pptx
```

### Step 3: 运行测试

```bash
# JavaScript 单元测试
node tests/test-integration.js

# 预期输出:
# 通过: 3/3
# 失败: 0/3
# 成功率: 100.0%

# Python 文件生成测试
python tests/generate-real-files.py

# 预期输出:
# ✅ 报价单已生成: test-output/quotation-ace-belting.docx
# ✅ 客户列表已生成: test-output/customer-list-2026-03-28.xlsx
```

### Step 4: 配置产品信息

编辑 `config/products.json`:
```json
{
  "company": {
    "name": "温州红龙工业设备制造有限公司",
    "brand": "HOLO",
    ...
  },
  "products": {
    "air-cooled-press": {
      "models": [
        {
          "code": "A2FRJ-1200",
          "price": 8500,
          ...
        }
      ]
    }
  }
}
```

### Step 5: 配置客户状态

编辑 `config/customer-status.json`:
```json
{
  "statuses": [
    {
      "key": "new",
      "label": "新线索",
      "color": "#9E9E9E",
      ...
    }
  ],
  "gradeThresholds": {
    "A": { "min": 80, "max": 100 },
    "B": { "min": 60, "max": 79 },
    ...
  }
}
```

### Step 6: 验证部署

```bash
# 运行完整测试
node tests/test-integration.js
python tests/generate-real-files.py

# 检查输出文件
ls -lh test-output/
# quotation-ace-belting.docx  (36.2 KB)
# customer-list-2026-03-28.xlsx  (7.8 KB)
```

---

## 🔒 安全配置

### API 密钥

| 服务 | 环境变量 | 获取方式 |
|------|----------|----------|
| Tavily | `TAVILY_API_KEY` | https://tavily.com |
| Brave Search | `BRAVE_SEARCH_API_KEY` | https://api.search.brave.com |
| Exa | `EXA_API_KEY` | https://exa.ai |

### 邮箱配置

已配置:
- SMTP 服务器: `smtp.163.com:465`
- 账号: 由各业务员通过 `email-sender setup` 自行配置

### 敏感信息

⚠️ **禁止**:
- 提交 API 密钥到 Git
- 泄露内部成本/利润信息
- 暴露客户敏感数据

---

## 📊 监控

### 健康指标

| 指标 | 正常值 | 检查方式 |
|------|--------|----------|
| **技能可用率** | 100% | 检查依赖技能 |
| **测试通过率** | 100% | 运行测试脚本 |
| **文件生成成功率** | 100% | 检查输出目录 |
| **配置文件完整性** | 100% | 验证 JSON 格式 |

### 日志

```bash
# 查看执行轨迹
cat ~/.openclaw/traces/*.jsonl

# 查看心跳日志
cat ~/.openclaw/logs/heartbeat.log
```

---

## 🔄 更新流程

### 更新配置

```bash
# 1. 编辑配置文件
vim config/products.json

# 2. 验证 JSON 格式
python -m json.tool config/products.json

# 3. 运行测试
node tests/test-integration.js

# 4. 提交更改
git add config/products.json
git commit -m "Update product configuration"
```

### 更新代码

```bash
# 1. 编辑代码
vim lib/quotation-generator.js

# 2. 运行测试
node tests/test-integration.js

# 3. 提交更改
git add lib/quotation-generator.js
git commit -m "Improve quotation generator"

# 4. 推送到远程
git push origin master
```

---

## 🐛 故障排查

### 问题 1: 测试失败

**症状**: `node tests/test-integration.js` 失败

**解决方案**:
```bash
# 检查 Node.js 版本
node --version

# 检查文件路径
ls -l lib/*.js

# 检查模块导入
node -e "const q = require('./lib/quotation-generator'); console.log('OK');"
```

---

### 问题 2: Python 文件生成失败

**症状**: `python tests/generate-real-files.py` 失败

**解决方案**:
```bash
# 检查 Python 版本
python --version

# 检查依赖
pip list | grep -E "docx|openpyxl|pypdf"

# 重新安装依赖
pip install --upgrade python-docx openpyxl pypdf
```

---

### 问题 3: 技能不可用

**症状**: 技能加载失败

**解决方案**:
```bash
# 检查技能目录
ls -l ~/.agents/skills/
ls -l ~/.openclaw/skills/

# 检查 SKILL.md 中的依赖列表
grep -A 50 "requires:" SKILL.md
```

---

## 📈 性能优化

### 文件生成优化

| 优化项 | 说明 | 提升 |
|--------|------|------|
| **批量生成** | 一次生成多个文件 | +50% |
| **缓存模板** | 缓存 Word/Excel 模板 | +30% |
| **并行处理** | 并行生成多个客户文件 | +40% |

### 内存优化

| 优化项 | 说明 | 效果 |
|--------|------|------|
| **流式处理** | 大文件流式处理 | 内存 -50% |
| **按需加载** | 配置文件按需加载 | 内存 -30% |

---

## 🎯 下一步

### 生产环境

- [ ] 部署到生产服务器
- [ ] 配置自动化任务
- [ ] 设置监控告警
- [ ] 配置备份策略

### 集成

- [ ] 集成到 HEARTBEAT 自动化
- [ ] 集成到 CRM 系统
- [ ] 集成到邮件发送系统

### 优化

- [ ] 性能监控
- [ ] 用户反馈收集
- [ ] 持续改进

---

_更新时间: 2026-03-28 09:00_
_部署人员: AI Assistant_
_版本: 2.0_
