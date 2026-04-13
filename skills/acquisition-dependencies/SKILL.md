---
name: acquisition-dependencies
version: 1.1.0
description: 红龙获客系统依赖安装技能。自动安装所有Python/npm系统依赖（openpyxl/docx/yaml/playwright/Pillow/nodemailer等）。支持Windows和Linux。触发：安装依赖、安装依赖、更新依赖、补全依赖。
triggers:
  - 安装依赖
  - 安装依赖
  - 更新依赖
  - 补全依赖
  - 安装依赖包
  - 修复依赖
---

# 红龙获客系统 · 依赖安装技能 v1.1.0

## 功能

自动检测并安装红龙获客系统所有技能所需的 Python 和 npm 依赖。

## 支持的系统

| 系统 | 包管理器 | 状态 |
|------|----------|------|
| **Windows** | pip / npm | ✅ 完整支持 |
| **Linux (WSL2/Debian/Ubuntu)** | apt-get / pip / npm | ✅ 完整支持 |

---

## Windows 安装指南

### 前置要求

- Python 3.8+ (推荐 3.11)
- Node.js 18+ (推荐 LTS 版本)
- PowerShell 5.1+ 或 PowerShell Core

### 一键安装脚本

```powershell
# 以管理员身份运行 PowerShell
# 安装 Python 依赖
pip install openpyxl python-docx pyyaml playwright pillow requests regex lxml

# 安装 Playwright 浏览器
python -m playwright install chromium

# 安装 npm 全局包
npm install -g nodemailer
```

### 分步安装

#### Step 1: 安装 Python 依赖

```powershell
pip install --upgrade pip setuptools wheel

pip install openpyxl
pip install python-docx
pip install pyyaml
pip install playwright
pip install pillow
pip install requests
pip install regex
pip install lxml
```

#### Step 2: 安装 Playwright 浏览器

```powershell
python -m playwright install chromium

# 如果需要安装所有浏览器
python -m playwright install
```

#### Step 3: 安装 Node.js 依赖

```powershell
npm install -g nodemailer

# 可选：puppeteer（备用浏览器自动化）
npm install -g puppeteer
```

#### Step 4: 验证安装

```powershell
# Python 依赖验证
python -c "import openpyxl, docx, yaml, PIL, playwright, requests, regex, lxml; print('✅ Python 依赖全部就绪')"

# Node.js 依赖验证
node -e "try{require('nodemailer');console.log('✅ nodemailer OK')}catch(e){console.log('❌ nodemailer missing')}"

# Playwright 验证
python -c "from playwright.sync_api import sync_playwright; print('✅ Playwright 就绪')"
```

---

## Linux (WSL2/Ubuntu/Debian) 安装指南

### 前置要求

- Python 3.8+
- Node.js 18+
- sudo 权限

### 一键安装脚本

```bash
#!/bin/bash
set -e

echo "==> 更新 apt..."
sudo apt-get update -qq

echo "==> 安装 Python 系统包..."
sudo apt-get install -y \
  python3-pip \
  python3-openpyxl \
  python3-docx \
  python3-yaml \
  python3-playwright \
  python3-pil \
  python3-requests \
  python3-regex \
  python3-lxml

echo "==> 安装 pip（如果版本过旧）..."
pip3 install --upgrade pip setuptools wheel

echo "==> 安装 playwright 浏览器..."
python3 -m playwright install chromium --with-deps

echo "==> 安装 npm 全局包..."
npm install -g nodemailer

echo "==> 验证安装..."
python3 -c "import openpyxl, docx, yaml, PIL, playwright, requests, regex, lxml; print('✅ Python 依赖全部就绪')"
node -e "try{require('nodemailer');console.log('✅ nodemailer OK')}catch(e){console.log('❌ nodemailer missing')}"

echo "==> 全部完成！"
```

### 分步安装

#### Step 1: 安装 Python 系统包（apt）

```bash
sudo apt-get update && sudo apt-get install -y python3-pip python3-openpyxl python3-docx python3-yaml python3-playwright python3-pil python3-requests python3-regex python3-lxml
```

#### Step 2: 安装 Playwright 浏览器

```bash
python3 -m playwright install chromium
```

#### Step 3: 安装 npm 包

```bash
npm install -g nodemailer
```

#### Step 4: 验证

```bash
python3 -c "import openpyxl, docx, yaml, PIL, playwright, requests, regex, lxml; print('✅ Python 依赖全部就绪')"
node -e "try{require('nodemailer');console.log('✅ nodemailer OK')}catch(e){console.log('❌ nodemailer missing')}"
```

---

## 依赖清单

### Python 包

| 包名 | 用途 | 安装命令 |
|------|------|----------|
| openpyxl | Excel读写 | `pip install openpyxl` |
| python-docx | Word读写 | `pip install python-docx` |
| pyyaml | YAML解析 | `pip install pyyaml` |
| playwright | 浏览器自动化 | `pip install playwright` |
| pillow | 图片处理 | `pip install pillow` |
| requests | HTTP请求 | `pip install requests` |
| regex | 正则增强 | `pip install regex` |
| lxml | XML/HTML解析 | `pip install lxml` |

### Node.js 全局包

| 包名 | 用途 | 安装命令 |
|------|------|----------|
| nodemailer | 邮件发送 | `npm install -g nodemailer` |
| puppeteer | 备用浏览器自动化 | `npm install -g puppeteer` (可选) |

---

## 故障排除

### Windows 常见问题

| 问题 | 解决方案 |
|------|----------|
| `pip 不是内部或外部命令` | 安装 Python 时勾选 "Add Python to PATH"，或手动添加 Python/Scripts 到环境变量 |
| `python 不是内部或外部命令` | 使用 `py` 命令代替，或添加 Python 到 PATH |
| `npm 不是内部或外部命令` | 重新安装 Node.js，确保勾选 "Add to PATH" |
| playwright 浏览器下载慢 | `python -m playwright install chromium --only-shell` |
| 权限不足 | 以管理员身份运行 PowerShell |

### Linux 常见问题

| 问题 | 解决方案 |
|------|----------|
| `python3: No module named pip` | `sudo apt-get install -y python3-pip` |
| `playwright: command not found` | `pip3 install playwright && python3 -m playwright install chromium` |
| `nodemailer: command not found` | `npm install -g nodemailer` |
| playwright 浏览器下载慢 | `python3 -m playwright install chromium --only-shell` |
| apt 源很慢 | 跳过 apt 直接用 pip3 安装（python3-pip 先装好）|

### WSL2 特殊说明

WSL2 环境下 node 通过 nvm 安装在非标准路径，apt 版 playwright 会找不到 node。需创建 symlink：

```bash
# 创建 node symlink（nvm路径 → 系统路径）
sudo ln -sf /root/.nvm/versions/node/v24.14.1/bin/node /usr/bin/node

# playwright 全局安装后，创建 symlink 到系统 node_modules
npm install -g playwright
sudo ln -sf /root/.nvm/versions/node/v24.14.1/lib/node_modules/playwright /usr/share/nodejs/playwright

# 验证
python3 -c "from playwright.sync_api import sync_playwright; print('OK')"
```

> 如果 nvm node 版本不同，先用 `nvm ls` 确认当前版本路径。

---

## 验证命令汇总

### Windows

```powershell
# Python 依赖验证
python -c "
import openpyxl
import docx
import yaml
from PIL import Image
import playwright
import requests
import regex
import lxml
print('✅ Python 依赖全部就绪')
"

# Node.js 依赖验证
node -e "try{require('nodemailer');console.log('✅ nodemailer OK')}catch(e){console.log('❌ nodemailer missing')}"

# Playwright 验证
python -c "from playwright.sync_api import sync_playwright; print('✅ Playwright 就绪')"
```

### Linux

```bash
# Python 依赖验证
python3 -c "
import openpyxl
import docx
import yaml
from PIL import Image
import playwright
import requests
import regex
import lxml
print('✅ Python 依赖全部就绪')
"

# Node.js 依赖验证
node -e "try{require('nodemailer');console.log('✅ nodemailer OK')}catch(e){console.log('❌ nodemailer missing')}"

# Playwright 验证
python3 -c "from playwright.sync_api import sync_playwright; print('✅ Playwright 就绪')"
```

---

## 技能引用

| 技能 | 依赖需求 |
|------|----------|
| whatsapp-outreach | openpyxl |
| delivery-queue | openpyxl |
| teyi-customs | openpyxl |
| 内容分发 | python-docx |
| inquiry-response | python-docx |
| holo-social-infographic | playwright, pillow |
| holo-social-gen | playwright |
| nas-image-scanner | regex |
| 163-email-sender | nodemailer |
| QQ邮箱 | nodemailer |

---

_Version: 1.1.0_
_更新日期：2026-04-13_
_更新内容：新增 Windows 完整支持_
