---
name: acquisition-dependencies
version: 1.0.0
description: 红龙获客系统依赖安装技能。自动安装所有Python/npm系统依赖（openpyxl/docx/yaml/playwright/Pillow/nodemailer等）。触发：安装依赖、安装依赖、更新依赖、补全依赖。
triggers:
  - 安装依赖
  - 安装依赖
  - 更新依赖
  - 补全依赖
  - 安装依赖包
  - 修复依赖
---

# 红龙获客系统 · 依赖安装技能

## 功能

自动检测并安装红龙获客系统所有技能所需的 Python 和 npm 依赖。

## 支持的系统

- **Linux (WSL2/Debian/Ubuntu)** — apt-get
- 检测到其他系统时提示手动安装

## 依赖清单

### Python 系统包（apt）

| 包名 | 用途 | 技能引用 |
|------|------|----------|
| python3-pip | 包管理器 | 基础 |
| python3-openpyxl | Excel读写 | whatsapp-outreach, delivery-queue, teyi-customs |
| python3-docx | Word读写 | 内容分发, inquiry-response |
| python3-yaml | YAML解析 | 多个技能配置 |
| python3-playwright | 浏览器自动化 | holo-social-infographic, holo-social-gen |
| python3-pil | 图片处理(Pillow) | holo-social-infographic(gen_compare_long) |
| python3-requests | HTTP请求 | 多个技能网络请求 |
| python3-regex | 正则增强 | nas-image-scanner |
| python3-lxml | XML/HTML解析 | 网页抓取技能 |

### Node.js 全局包（npm）

| 包名 | 用途 | 技能引用 |
|------|------|----------|
| nodemailer | 邮件发送 | 163-email-sender, QQ邮箱 |
| @nodemailer/nodemailer | nodemailer新版 | 同上（二选一） |

## 安装步骤

### 1. 更新 apt 并安装 Python 系统包

```bash
sudo apt-get update
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
```

### 2. 安装 Playwright 浏览器

```bash
# 安装 Chromium（主力浏览器）
python3 -m playwright install chromium

# 或安装全部浏览器
python3 -m playwright install
```

> 如果 `python3 -m playwright` 不可用，先用 pip 安装：`pip3 install playwright && python3 -m playwright install chromium`

### 3. 安装 Node.js 全局包

```bash
# nodemailer（邮件发送）
npm install -g nodemailer

# 可选：puppeteer（备用浏览器自动化）
npm install -g puppeteer
```

## 快速安装脚本

创建 `/tmp/install_acquisition_deps.sh`：

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
python3 -c "import openpyxl, docx, yaml, PIL, playwright, requests; print('All OK')"
node -e "require('nodemailer'); console.log('nodemailer OK')"

echo "==> 全部完成！"
```

## 安装执行

### Step 1: 安装 Python 系统包（apt）

```bash
sudo apt-get update && sudo apt-get install -y python3-pip python3-openpyxl python3-docx python3-yaml python3-playwright python3-pil python3-requests python3-regex python3-lxml
```

### Step 2: 安装 Playwright 浏览器

```bash
python3 -m playwright install chromium
```

### Step 3: 安装 npm 包

```bash
npm install -g nodemailer
```

### Step 4: 验证

```bash
python3 -c "import openpyxl, docx, yaml, PIL, playwright, requests; print('Python deps OK')"
node -e "require('nodemailer'); console.log('nodemailer OK')"
```

## 故障排除

| 问题 | 解决方案 |
|------|----------|
| `python3: No module named pip` | `sudo apt-get install -y python3-pip` |
| `playwright: command not found` | `pip3 install playwright && python3 -m playwright install chromium` |
| `nodemailer: command not found` | `npm install -g nodemailer` |
| playwright 浏览器下载慢 | `python3 -m playwright install chromium --only-shell` |
| apt 源很慢 | 跳过 Step 1 直接用 pip3 安装（python3-pip先装好）|

## WSL2 特殊说明

WSL2 环境下 node 通过 nvm 安装在非标准路径，apt版playwright会找不到node。需创建symlink：

```bash
# 创建node symlink（nvm路径 → 系统路径）
sudo ln -sf /root/.nvm/versions/node/v24.14.1/bin/node /usr/bin/node

# playwright全局安装后，创建symlink到系统node_modules
npm install -g playwright
sudo ln -sf /root/.nvm/versions/node/v24.14.1/lib/node_modules/playwright /usr/share/nodejs/playwright

# 验证
python3 -c "from playwright.sync_api import sync_playwright; print('OK')"
```

> 如果 nvm node 版本不同，先用 `nvm ls` 确认当前版本路径。

## 验证命令

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
```
