---
name: holo-social-infographic
description: "HOLO社媒信息图生成技能 - 使用 Draw.io CLI 生成技术参数图、流程图、对比图。所有数据必须来自 NAS 共享盘真实产品资料，禁止捏造。"
version: 2.3.0
triggers:
  - 生成信息图
  - 信息图
  - 技术参数图
  - 产品参数图
  - 流程图
  - 对比图
  - 规格对比
  - 产品对比
  - 竞品对比
  - 技术参数
  - 参数图
  - 设备参数
  - 产品规格
  - 尺寸图
  - 结构图
  - 原理图
  - 示意图
  - 画流程图
  - 画对比图
  - 画参数图
  - 制作信息图
  - 制作参数图
  - 生成参数图
  - 展示参数
  - 可视化参数
  - 技术说明图
---

# HOLO 社媒信息图生成技能

> 使用 Draw.io CLI 生成技术参数信息图，用于社媒运营配图

---

## ⚠️ 核心原则

**所有技术参数必须来自 NAS 共享盘真实资料，禁止捏造！**

### 数据来源
- **优先读取**：`honglong-products` 技能的结构化产品知识库
- **权威兜底**：NAS `Y:\1.HOLO机器目录（最终资料存放）\` 原始文件
- **验证规则**：所有参数必须可溯源到具体 NAS 文件

---

## 🎯 核心功能

| 功能 | 用途 | 示例 |
|------|------|------|
| 技术参数图 | 展示设备规格 | 加热板尺寸、温控精度 |
| 流程图 | 展示操作流程 | 接头操作步骤 |
| 对比图 | 与竞品对比 | HOLO vs Flexco |
| 应用场景图 | 展示适用行业 | 矿山/水泥/港口 |
| 客户案例图 | 展示成功案例 | 客户名称+效果数据 |

---

## 📊 HOLO 产品真实参数（来源：NAS）

### 风冷机（A2FRJ / A3FRJ / A4FRJ）
| 参数 | 规格 | 数据来源 |
|------|------|----------|
| 加热板尺寸 | 300-3600mm | NAS 产品目录 |
| 温控精度 | ±2°C | NAS 技术文档 |
| 加热时间 | 15-30 分钟 | NAS 技术文档 |
| 电源 | 380V / 50Hz | NAS 规格书 |
| 压力系统 | 液压 | NAS 技术文档 |

### 水冷机（ASJ系列）
| 参数 | 规格 | 数据来源 |
|------|------|----------|
| 加热板尺寸 | 600-4200mm | NAS 产品目录 |
| 机身类型 | 不锈钢/井字型 | NAS 产品目录 |
| 冷却方式 | 水循环冷却 | NAS 技术文档 |
| 适用带宽 | 650-2400mm | NAS 规格书 |

### 分层机
| 参数 | A1FQJ | B1OQFJ | 数据来源 |
|------|-------|--------|----------|
| 分层宽度 | 750mm | 1000mm | NAS 产品目录 |
| 分层厚度 | 3-15mm | 3-20mm | NAS 技术文档 |

### 多功能导条机
| 参数 | XDT1300 | XDT2000 | 数据来源 |
|------|---------|---------|----------|
| 导条宽度 | 1300mm | 2000mm | NAS 产品目录 |
| 适用规格 | 多种规格 | 多种规格 | NAS 技术文档 |

---

## 🚀 使用方式

### ⭐ 统一生成器（推荐）

```bash
# 使用统一脚本生成信息图
python holo_infographic.py [command] [参数]

# 可用命令:
python holo_infographic.py comparison              # 竞品对比长图
python holo_infographic.py spec                    # 技术参数图（默认A3FLJ）
python holo_infographic.py spec A3FLJ              # 指定型号
python holo_infographic.py spec A2FLJ              # 指定型号
python holo_infographic.py spec A3FLJ "Y:\图片.jpg"  # 指定型号+图片
python holo_infographic.py flow                    # 操作流程图
python holo_infographic.py faq [型号]              # FAQ 图文
python holo_infographic.py selector                # 产品选型图
python holo_infographic.py applications            # 应用场景图
```

**技术参数图支持传入 NAS 产品图片路径**，自动加载到 Hero 区域。

---

## 📊 新增功能：数据驱动的信息图

### 核心原则：真实数据，禁止 Mock

所有信息图的数据必须来自以下来源：

| 来源 | 内容 | 获取方式 |
|------|------|----------|
| **NAS 共享盘** | 真实产品参数、客户案例、应用照片 | `nas-file-reader` 技能 |
| **产品知识库** | 产品规格、技术描述、行业分类 | `honglong-products` 技能 |
| **网络搜索** | 行业数据、竞品信息、应用场景 | `exa-search` / `web-search` |

### 1. FAQ 图文 (`faq` 命令)

```bash
python holo_infographic.py faq A3FLJ
```

**数据来源流程**：
1. 📂 NAS - 读取产品说明书的 FAQ 章节
2. 📚 知识库 - 读取常见问题列表
3. 🔍 网络搜索 - 补充行业常见问题
   - 搜索：`conveyor belt splicing FAQ`, `belt splicer troubleshooting`

**输出**：针对特定产品的 FAQ 信息图

### 2. 产品选型图 (`selector` 命令)

```bash
python holo_infographic.py selector
```

**数据来源流程**：
1. 📂 NAS - 读取全系列产品的真实参数对比
2. 📚 知识库 - 获取产品定位和分类
3. 🔍 网络搜索 - 补充行业选型标准
   - 搜索：`belt splicer selection guide`, `conveyor belt width selection`

**输出**：HOLO 全系列产品选型指南

### 3. 应用场景图 (`applications` 命令)

```bash
python holo_infographic.py applications
```

**数据来源流程**：
1. 📂 NAS - 读取客户案例、产品应用照片
2. 📚 知识库 - 获取各行业应用描述
3. 🔍 网络搜索 - 搜索行业应用数据
   - 搜索：`mining conveyor belt splicing`, `cement plant belt maintenance`
   - 行业：Mining, Cement, Port, Steel, Power, Food

**输出**：HOLO 应用场景展示图

---

### 🔍 网络搜索集成

当需要生成这三类信息图时，应先进行网络搜索：

```python
# FAQ 搜索
"conveyor belt splicing machine common problems"
"belt splicer FAQ troubleshooting"
"industrial belt joining questions"

# 选型搜索
"how to select belt splicing machine"
"conveyor belt width selection criteria"
"air cooled vs water cooled belt splicer"

# 应用场景搜索
"mining conveyor belt splicing applications"
"cement plant belt maintenance solutions"
"port cargo handling belt systems"
```

**注意**：搜索结果用于参考和补充，最终数据必须与 NAS 和知识库交叉验证。

### 脚本位置

```
~/.workbuddy/skills/holo-social-infographic/
├── holo_infographic.py           # 统一生成器（入口）
└── templates/
    ├── HOLO_竞品对比长图_国际版_v2.html    # ✅ 竞品对比
    └── HOLO_技术参数图_国际版.html          # ✅ 技术参数（新增）
```

### Playwright 截图核心函数

```python
def html_to_png(html_path, output_path, viewport_height=3000):
    """HTML 转 PNG - 完整页面截图"""
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': 1920, 'height': 100})
        page.goto(f'file:///{html_path}')
        page.set_viewport_size({'width': 1920, 'height': viewport_height})
        page.screenshot(path=output_path, full_page=True)
        browser.close()
```

### HTML 模板制作规范

1. **宽度固定 1920px**
2. **背景白色**，不用深色
3. **字体用 Inter**（Google Fonts CDN）
4. **无 emoji**，用纯色块或线条代替
5. **产品图片用 `file:///` 协议加载 NAS 文件**

### 模板文件格式

```html
<!-- 必须包含 -->
<meta name="viewport" content="width=1920">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
    body { font-family: 'Inter', sans-serif; width: 1920px; }
</style>
```

---

## 📋 信息图模板

### 模板1：技术参数图
```
┌─────────────────────────────────┐
│  HOLO [产品名称] 技术参数       │
├─────────────────────────────────┤
│  规格1: [真实参数]              │
│  规格2: [真实参数]              │
│  规格3: [真实参数]              │
│  规格4: [真实参数]              │
├─────────────────────────────────┤
│  数据来源: NAS 产品目录         │
└─────────────────────────────────┘
```

### 模板2：竞品对比图
```
┌────────────┬───────────┬───────────┐
│  参数      │  HOLO     │  Flexco   │
├────────────┼───────────┼───────────┤
│  价格      │  更低     │  高       │
│  交期      │  7-15天   │  60+天    │
│  定制      │  灵活     │  不灵活   │
│  售后      │  快速响应 │  响应慢   │
└────────────┴───────────┴───────────┘
```

### 模板3：应用场景图
```
┌─────────────────────────────────────┐
│  HOLO 设备适用行业                  │
├──────────┬──────────┬──────────────┤
│ 🏭 矿山  │ 🏗️ 水泥  │ 🚢 港口     │
│          │          │              │
│ ✅ 皮带  │ ✅ 皮带  │ ✅ 皮带     │
│  维修    │  生产    │  输送       │
├──────────┼──────────┼──────────────┤
│ 🏭 电力  │ 🏭 钢铁  │ 🚜 农业     │
│          │          │              │
│ ✅ 皮带  │ ✅ 皮带  │ ✅ 输送带   │
│  维修    │  维修    │  加工       │
└──────────┴──────────┴──────────────┘
```

---

## 🔧 常见操作示例

### 场景1：生成产品技术参数信息图
```bash
# 从 NAS 读取真实参数后生成
cli-anything-drawio project new a2frj-spec
cli-anything-drawio shape add --type text --text "HOLO 风冷机 A2FRJ" --style "fontSize=28;fontColor=#E53935;bold=true"
cli-anything-drawio shape add --type text --text "加热板尺寸: 1200×600mm" --style "fontSize=18"
cli-anything-drawio shape add --type text --text "温控精度: ±2°C" --style "fontSize=18"
cli-anything-drawio shape add --type text --text "加热时间: 15-30 分钟" --style "fontSize=18"
cli-anything-drawio shape add --type text --text "额定功率: 15-30kW" --style "fontSize=18"
cli-anything-drawio shape add --type text --text "适用带宽: 650-2400mm" --style "fontSize=18"
cli-anything-drawio export png --scale 2 --output a2frj-spec.png
```

### 场景2：生成竞品对比图
```bash
cli-anything-drawio project new holo-vs-competitor
cli-anything-drawio shape add --type table --rows 5 --cols 3 --x 50 --y 100
cli-anything-drawio export png --output comparison.png
```

---

## ⚙️ 技术要求

### 前置条件
- 已安装：`pip install cli-anything-drawio`
- Draw.io Desktop 或 draw.io CLI 可用

### 输出格式
- PNG：社交媒体分享
- PDF：详细文档
- SVG：可编辑版本

---

## 📁 输出目录结构

```
holo-infographic-output/
├── specs/           # 技术参数图
│   └── a2frj-spec.png
├── comparison/      # 竞品对比图
│   └── holo-vs-flexco.png
├── applications/    # 应用场景图
│   └── industry-applications.png
└── archive/         # 原始文件
    └── *.drawio
```

---

## 📐 标准生成脚本模板

### 字体加载（必须使用黑体）
```python
# -*- coding: utf-8 -*-
from PIL import Image, ImageDraw, ImageFont
import os

def load_fonts():
    FONT_PATH = 'C:/Windows/Fonts/'
    fonts = {}
    try:
        fonts['title'] = ImageFont.truetype(FONT_PATH + 'simhei.ttf', 52)
        fonts['header'] = ImageFont.truetype(FONT_PATH + 'simhei.ttf', 36)
        fonts['subheader'] = ImageFont.truetype(FONT_PATH + 'simhei.ttf', 30)
        fonts['body'] = ImageFont.truetype(FONT_PATH + 'simhei.ttf', 26)
        fonts['small'] = ImageFont.truetype(FONT_PATH + 'simhei.ttf', 22)
        fonts['tiny'] = ImageFont.truetype(FONT_PATH + 'simhei.ttf', 20)
        fonts['brand'] = ImageFont.truetype(FONT_PATH + 'arialbd.ttf', 26)
    except:
        fonts = {k: ImageFont.load_default() for k in ['title','header','body','small']}
    return fonts
```

### 配色方案
```python
COLORS = {
    'bg': (250, 250, 252),      # 浅灰背景
    'header': (229, 57, 53),    # HOLO红
    'card': (255, 255, 255),    # 白色卡片
    'dark': (30, 35, 45),       # 深色文字
    'gray': (110, 115, 125),    # 灰色副文字
    'accent': (229, 57, 53),     # 强调色
    'success': (46, 125, 50),   # 绿色成功
    'border': (225, 228, 235),  # 边框色
}
```

### 圆角矩形绘制函数
```python
def rounded_rect(draw, xy, r, fill):
    x1, y1, x2, y2 = xy
    draw.rectangle([x1+r, y1, x2-r, y2], fill=fill)
    draw.rectangle([x1, y1+r, x2, y2-r], fill=fill)
    draw.ellipse([x1, y1, x1+2*r, y1+2*r], fill=fill)
    draw.ellipse([x2-2*r, y1, x2, y1+2*r], fill=fill)
    draw.ellipse([x1, y2-2*r, x1+2*r, y2], fill=fill)
    draw.ellipse([x2-2*r, y2-2*r, x2, y2], fill=fill)
```

### 安全文字绘制（自动换行）
```python
def safe_text(draw, text, x, y, font, color, max_width=None):
    """安全绘制文字 - 自动换行且确保不超出边界"""
    if max_width:
        chars = list(text)
        lines = []
        current = ''
        for ch in chars:
            test = current + ch
            bbox = draw.textbbox((0,0), test, font=font)
            if bbox[2] - bbox[0] > max_width:
                lines.append(current)
                current = ch
            else:
                current = test
        if current:
            lines.append(current)

        line_h = 30
        for i, line in enumerate(lines):
            draw.text((x, y + i * line_h), line, font=font, fill=color)
        return len(lines) * line_h
    else:
        draw.text((x, y), text, font=font, fill=color)
        return 30
```

### 标准布局尺寸
```python
# 图片尺寸
W, H = 1920, 2400-3000  # 竖版长图（推荐）

# 边距
margin = 50
# 卡片圆角
radius = 15-20
# 标题高度
title_h = 100-120
```

### 输出文件命名规范
```
HOLO_[产品型号]_[信息图类型]_[版本].png

示例：
- HOLO_竞品对比长图_国际版_v2.png
- HOLO_A2FLJ_技术参数图.png
- HOLO_操作流程图.png
```

### Playwright 截图标准代码
```python
from playwright.sync_api import sync_playwright

def html_to_png(html_path, output_path, viewport_width=1920):
    """
    HTML 转 PNG - 完整页面截图
    参数:
        html_path: HTML 文件路径
        output_path: 输出 PNG 路径
        viewport_width: 视口宽度（默认 1920）
    """
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': viewport_width, 'height': 100})
        page.goto(f'file:///{html_path}')
        page.set_viewport_size({'width': viewport_width, 'height': 3000})
        page.screenshot(path=output_path, full_page=True)
        browser.close()
    print(f'Done: {output_path}')
```

## 🔴 关键规范

### 字体使用（必须遵守）
```python
# 中文内容必须使用 simhei.ttf（黑体）
FONT_TITLE = 'C:/Windows/Fonts/simhei.ttf'
FONT_BOLD = 'C:/Windows/Fonts/simhei.ttf'

# ❌ 错误：使用 Arial（不支持中文，会显示方框）
font = ImageFont.truetype('arial.ttf', 24)  # 中文变方框！

# ✅ 正确：使用黑体
font = ImageFont.truetype('C:/Windows/Fonts/simhei.ttf', 24)
```

### 字体加载标准流程
```python
try:
    title_font = ImageFont.truetype(FONT_BOLD, 48)
    header_font = ImageFont.truetype(FONT_BOLD, 32)
    label_font = ImageFont.truetype(FONT_BOLD, 26)
    text_font = ImageFont.truetype(FONT_TITLE, 22)
    small_font = ImageFont.truetype(FONT_TITLE, 18)
except Exception as e:
    print(f'字体加载失败: {e}')
    return
```

### 美观设计规范（外贸社媒版）

**核心原则**：简约、国际、专业

| 要素 | 规范 |
|------|------|
| **背景** | 白色或浅灰，干净清爽 |
| **配色** | 品牌红(#E53935) + 黑色文字 + 灰线，少而精 |
| **字体** | 无衬线英文字体（Inter/Roboto/Arial） |
| **图标** | 不用 emoji，用线条图标或纯色块 |
| **布局** | 大留白、信息层级清晰 |
| **风格参考** | Apple/西门子/德国工业品牌 |

**错误示范**：
- ❌ 深色/黑灰风格
- ❌ 大量 emoji
- ❌ 花哨卡片和渐变

---

## 📝 更新记录

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| 1.0.0 | 2026-04-11 | 初始版本 |
| 1.1.0 | 2026-04-11 | 添加更多触发词 |
| 1.2.0 | 2026-04-11 | 修复中文字体问题（改用 simhei.ttf） |
| 1.3.0 | 2026-04-11 | 标准化生成脚本模板、卡片布局规范 |
| 1.4.0 | 2026-04-11 | HTML+CSS方案生成专业信息图、竞品对比长图 |
| 2.0.0 | 2026-04-11 | 重构为HTML+CSS+Edge截图方案，放弃PIL原生Canvas |
| 2.1.0 | 2026-04-11 | 改用Playwright完整页面截图，修复截断问题 |
| 2.2.0 | 2026-04-11 | 技术参数图支持传入NAS产品图片，自动加载Hero区域 |
| 2.3.0 | 2026-04-11 | 所有信息图统一多源数据流程：NAS + 知识库 + 网络搜索 |
| 2.4.0 | 2026-04-11 | 新增 nas_image_scanner.py，自动从NAS扫描产品白底图 |
| 2.3.0 | 2026-04-11 | 新增FAQ图文、产品选型图、应用场景图生成器 |
