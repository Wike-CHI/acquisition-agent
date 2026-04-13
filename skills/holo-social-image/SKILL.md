---
name: holo-social-image
description: >
  HOLO社媒图片预处理技能 - 使用 GIMP CLI + PIL 自动处理产品图片
  （尺寸调整、品牌水印、格式转换、去背景/抠图）。
  所有产品图片必须来自 NAS 共享盘真实资料。
  是 holo-social-gen 的上游预处理层：脏图→干净标准化素材。
---

# HOLO 社媒图片预处理 (holo-social-image)

## 定位

**我是厨房 — 负责洗菜切菜，不管摆盘出品。**

```
NAS 原始产品图（脏的）
    │
    ▼  我来处理
┌─────────────────────────┐
│  holo-social-image      │
│  预处理管道             │
│                         │
│  检测 → 处理 → 标准化   │
│                         │
│  输出: 干净的产品素材    │
└──────────┬──────────────┘
           │
           ▼
  holo-social-gen（拿好素材做设计）
  holo-social-infographic（拿好素材做信息图）
```

## 核心能力

### 1. 图片质量检测（自动判断需不需要处理）

| 检测项 | 方法 | 阈值/标准 |
|--------|------|----------|
| **白底检测** | PIL 分析四角+边缘像素 | 四角 RGB 均值 > 240 且方差 < 10 = 白底 |
| **背景色检测** | 边缘采样 + 主色调分析 | 检测是否为灰底/杂背景/渐变 |
| **尺寸检测** | `Image.size` | 超过 2000px 宽或高 = 需要缩放 |
| **格式检测** | `Image.format` | BMP/TIFF/WebP = 需转换 |
| **文件大小检测** | `os.path.getsize()` | > 2MB = 需压缩 |
| **透明通道检测** | `Image.mode == 'RGBA'` + alpha < 255 像素占比 | 已有透明层则跳过去背景 |

### 2. 预处理操作

#### 2a. 去背景 / 抠图（非白底图的核心需求）

**这是本技能最重要的能力。** NAS 上很多产品图不是白底的：

```python
# 使用 PIL + numpy 实现智能去背景
from PIL import Image, ImageFilter
import numpy as np

def remove_background(img_path: str, output_path: str) -> str:
    """
    去背景算法:
    1. 检测主背景色（边缘采样）
    2. 颜色容差扩展（tolerance=30）
    3. 羽化边缘（feather=2px）
    4. 输出 PNG（保留透明通道）
    
    对于复杂背景，调用 GIMP CLI 作为备选:
    gimp -i -b '(let* ((image (car (gimp-file-load RUN-NONINTERACTIVE "<input>" "<input>")))
                        (drawable (car (gimp-image-get-active-drawable image))))
                    (plug-in-foreground-select RUN-NONINTERACTIVE image drawable ...)
                    (file-png-save RUN-NONINTERACTIVE image drawable "<output>" "<output>" 0 9 1 1 1 1 1))
                    (gimp-quit 0))'
    """
```

**去背景触发条件：**
- ❌ 非白底（检测结果）
- ✅ 用户明确要求"抠图"
- ⚠️ 产品图有阴影/反光需要清理时

#### 2b. 尺寸标准化

| 场景 | 目标尺寸 | 质量 |
|------|---------|------|
| gen 用（base64 内嵌） | 最大 1200×1200 | quality=85 |
| infographic 配图 | 最大 800×800 | quality=90 |
| 缩略图/小图标 | 300×300 | quality=80 |

```python
def resize_for_platform(img: Image.Image, target_max: int = 1200) -> Image.Image:
    """等比缩放，保持宽高比"""
    w, h = img.size
    if max(w, h) <= target_max:
        return img  # 已经够小
    ratio = target_max / max(w, h)
    return img.resize((int(w * ratio), int(h * ratio)), Image.LANCZOS)
```

#### 2c. 品牌水印

> ⚠️ **品牌红线**: 所有输出图片必须包含 HOLO 品牌标识。

| 元素 | 规范 |
|------|------|
| **品牌色** | `#D32F2F`（HOLO Red）— **唯一正确的红色值** |
| **角标位置** | 右上角，距边 15px |
| **角标内容** | **"HOLO"**（绝对禁止用 NOVO/NEW/NUEVO 等"新品"标签代替品牌名）|
| **角标样式** | 半透明红底白字，圆角 4px，font-size=24px |
| **Footer** | 可选：底部居中 "HOLO INDUSTRIAL" 小字 |

```python
def add_holo_watermark(img: Image.Image) -> Image.Image:
    """在右上角添加 HOLO 品牌水印"""
    from PIL import ImageDraw, ImageFont
    
    draw = ImageDraw.Draw(img)
    # HOLO Red (#D32F2F)
    brand_color = (211, 47, 47)
    text = "HOLO"
    
    # 尝试加载字体
    try:
        font = ImageFont.truetype("arial.ttf", 24)
    except:
        font = ImageFont.load_default()
    
    # 文字尺寸
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    
    # 角标位置（右上角）
    padding = 8
    x = img.width - tw - padding * 2 - 15
    y = 15
    
    # 半透明红底
    overlay = Image.new('RGBA', img.size, (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    overlay_draw.rounded_rectangle(
        [x - padding, y - padding, x + tw + padding, y + th + padding],
        radius=4,
        fill=(211, 47, 47, 200)  # #D32F2F 半透明
    )
    overlay_draw.text((x, y), text, fill=(255, 255, 255, 255), font=font)
    
    # 合成
    img = img.convert('RGBA')
    return Image.alpha_composite(img, overlay).convert('RGB')
```

#### 2d. 格式转换与优化

| 输入格式 | 输出格式 | 说明 |
|---------|---------|------|
| BMP/TIFF/WEBP | PNG（无损）/ JPG（有损） | 社媒统一用 PNG 或 JPG |
| 超大 PNG (>2MB) | JPG quality=85 | base64 内嵌需要控制大小 |
| 任意格式 | PNG（透明背景保留）| 抠图后必须用 PNG |

### 3. 批量多平台导出

```python
def batch_process(nas_source_dir: str, output_dir: str, 
                 remove_bg: bool = False, add_watermark: bool = True,
                 max_size: int = 1200) -> dict:
    """
    批量处理整个目录的产品图:
    1. 扫描目录下所有图片
    2. 逐个执行: 检测 → 去背景(可选) → resize → 水印(可选) → 格式转换
    3. 输出到目标目录，返回处理报告
    
    Returns:
        {
            'total': 10,
            'processed': 8,
            'skipped': 2,  # 已经是白底+合适尺寸
            'removed_bg': 3,
            'errors': []
        }
    """
```

## 工作流集成

### 被 holo-social-gen 调用时

gen 在生成图片前应该先问自己：

```
Step 0: 图片预处理检查清单
━━━━━━━━━━━━━━━━━━━━━━━
□ 图片来源是哪里？     → 必须是 NAS 或用户上传的真实图
□ 是白底吗？           → 不是 → 调用 image 去背景
□ 尺寸合适吗？         → 太大 → 调用 image resize
□ 有 HOLO 水印吗？     → 没有 → 调用 image 加水印
□ 格式/base64友好吗？  → 不是 PNG/JPG → 转换
```

### 独立使用场景

业务员说："帮我处理一下这批产品图"
→ 直接运行 image 的批量处理流程

## 工具依赖

| 工具 | 用途 | 是否必需 |
|------|------|:-------:|
| **Python PIL/Pillow** | 图片检测/resize/水印/格式转换 | ✅ 必须 |
| **numpy** | 去背景算法的颜色计算 | ✅ 必须 |
| **GIMP CLI** (`gimp`) | 备选：复杂背景的高级去背景 | 可选 |
| **removebg API** | 备选：云端 AI 去背景（需 API key） | 可选 |

## 数据源约束

> ⚠️ 所有产品图片必须来自 NAS 共享盘真实资料。

```
Y:\1.HOLO机器目录（最终资料存放）\
├── 1.风冷皮带接头机\       ← 产品图来源
├── 2.水冷式接头机\
├── ...
├── 7.裁切 切割、环切、分条机\
└── 8.焊接 导条机\
```

**禁止行为**：
- 🚫 使用网络搜索的图片代替真实产品图
- 🚫 使用 AI 生成的假产品图
- 🚫 捏造不存在的产品型号图片

## 与其他技能的关系

| 技能 | 关系 | 说明 |
|------|------|------|
| **holo-social-gen** | **下游** | image 处理好的干净素材 → gen 做 AI 设计 |
| **holo-social-infographic** | **下游** | image 处理好的配图 → infographic 做参数表/对比图 |
| **cli-anything-hub** | **底层依赖** | 提供 GIMP CLI / Draw.io CLI 等工具发现 |
| **honglong-products** | **数据源** | 提供产品型号列表和 BOM 信息 |

## 品牌规范（不可违反）

- **品牌名**: HOLO INDUSTRIAL（中文：红龙工业）
- **主色**: `#D32F2F`（HOLO Red）— **唯一正确值**
- **联系**: sale@18816.cn \| WhatsApp: +86 18057753889
- **公司全称**: Wenzhou Honglong Industrial Equipment Manufacturing Co., Ltd.
- **角标永远写 "HOLO"，绝对禁止用 NOVO/NEW/NUEVO 等代替**
