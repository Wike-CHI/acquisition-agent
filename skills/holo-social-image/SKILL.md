---
name: holo-social-image
version: "1.0.0"
description: >
  HOLO社媒图片预处理技能 - 使用 GIMP CLI + PIL 自动处理产品图片
  （裁剪、抠图去背景、调色、品牌水印、格式转换、尺寸调整）。
  所有产品图片必须来自 NAS 共享盘真实资料或业务员上传。
triggers:
  - 处理产品图片
  - 图片预处理
  - 抠图去背景
  - 社媒图片处理
  - holo-social-image
  是 holo-social-gen 的上游预处理层：脏图→干净标准化素材。
  触发词: 抠图/裁剪/去背景/处理图片/加水印/缩放/调整图片/修图/GIMP
---

# HOLO 社媒图片预处理 (holo-social-image)

> **更新记录 v2.0 (2026-04-13):** 移除所有嵌入式 GIMP Script-Fu（因 GIMP 2.10 Windows console
> 版 PDB 参数签名不一致导致无法工作）。改用 `gimp_backend` 模块（PIL 实现）+ PIL
> 原生操作。背景去除已验证可用。

## 定位

**我是厨房 — 洗菜、切菜、改刀，不管摆盘出品。**

```
NAS 原始图 / 业务员上传的图（脏的）
    │
    ▼  我来处理
┌─────────────────────────┐
│  holo-social-image      │
│  预处理管道             │
│                         │
│  检测 → 处理 → 标准化   │
│                         │
│  主力工具: GIMP CLI     │
│  轻量操作: PIL/Pillow   │
│                         │
│  输出: 干净的产品素材    │
└──────────┬──────────────┘
           │
           ▼
  holo-social-gen（拿好素材做设计）
  holo-social-infographic（拿好素材做信息图）
```

## 两种使用模式

### 模式 A：交互式单张处理（业务员对话）

**这是最常用的场景。** 业务员在微信/WorkBuddy 里说一句话，AI 直接处理。

#### 触发词

| 用户说的话 | AI 做什么 |
|-----------|----------|
| "帮我裁剪一下这张图" / "把多余的部分裁掉" | GIMP 裁剪到主体区域 |
| "把背景去掉" / "抠个图" / "做成白底的" | GIMP 去背景 → 白底/透明底 |
| "这张图太暗了" / "亮度调一下" | GIMP 曲线/色阶调整 |
| "加个水印" / "打上HOLO" | PIL 右上角 HOLO 角标 |
| "压缩一下" / "太大了" | PIL resize + quality 调整 |
| "转成 PNG" / "转成 JPG" | PIL 格式转换 |
| "旋转一下" / "翻转" | GIMP 旋转/镜像 |
| "帮我处理这批图" | 批量处理流程（见模式B） |

#### 交互式处理流程

```
业务员: [发送图片] + "帮我把这个裁剪一下，去掉旁边的杂物"
     │
     ▼
AI 接收图片 → 保存到临时目录
     │
     ▼ Step 1: 多模态分析
AI 用"眼睛"看图:
  - 图片内容是什么？（机器/零件/场景？）
  - 背景是什么颜色？（白底/灰底/杂乱？）
  - 有哪些问题需要处理？（尺寸太大/偏暗/倾斜？）
  - 主体在哪里？（裁剪区域判断）
     │
     ▼ Step 2: 确认方案
AI: "看到了，这是一张水冷机的照片，左边有多余的杂物，
     背面是灰色的地面。我建议：
     1. 裁剪到机器主体（去除左侧杂物）
     2. 去掉灰色背景 → 替换为纯白底
     3. 输出 1200×900 白底 JPG

     要这样处理吗？还是你有其他要求？"
     │
     ▼ Step 3: 业务员确认/修改
     │
     ▼ Step 4: 执行处理（GIMP 或 PIL）
     │
     ▼ Step 5: 展示结果
AI: [展示处理后的图片] "处理完了，你看下效果。
     原图 2400×1600 → 输出 1200×900 (185KB)
     如果还需要微调随时说。"
```

#### 关键原则

1. **先看图再动手** — 收到图片后必须先用多模态分析，不要瞎猜
2. **先问再做** — 处理前必须让业务员确认方案（除非是简单明确的指令如"加水印"）
3. **GIMP 优先** — 涉及裁剪、抠图、调色、旋转等**像素级操作**，用 GIMP CLI
4. **PIL 做轻活** — 加水印、resize、格式转换这些简单操作用 PIL 就够了

### 模式 B：批量管道（被 gen 自动调用）

gen 在生成社媒图前的自动检查流程：

```
Step 0: 图片预处理检查清单
━━━━━━━━━━━━━━━━━━━━━━━
□ 图片来源是哪里？     → 必须是 NAS 或用户上传的真实图
□ 是白底吗？           → 不是 → GIMP 去背景
□ 尺寸合适吗？         → 太大 → PIL resize
□ 有 HOLO 水印吗？     → 没有 → PIL 加水印
□ 格式/base64友好吗？  → 不是 PNG/JPG → 转换
```

## 工具分层

> **核心原则：PIL 做一切，GIMP 只做备选（裁剪/旋转目前走 PIL）**
>
> ⚠️ **GIMP Script-Fu 在 Windows console 模式下有 PDB 参数签名不一致问题，背景去除
> 以外的操作用 PIL 替代。** 背景去除已通过 `gimp_backend` 模块使用 PIL 实现并验证可用。

### 调用示例

```python
import sys, os
# 添加 cli-anything-gimp 路径
sys.path.insert(0, r"C:\Users\Administrator\gimp\agent-harness")

from cli_anything.gimp.utils import gimp_backend   # 背景去除
from cli_anything.gimp.core import media            # 白底检测
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import numpy as np

# ── 背景去除 ────────────────────────────────────────────
# 1. 先检测是否需要去背景
det = media.detect_white_background(input_path)
print(det["verdict"], det["corner_score"])
# → "clean_white" / "not_white" / "mixed"

if det["verdict"] != "clean_white":
    # 2. 去背景 → 白底 PNG
    result = gimp_backend.remove_background_and_export(
        input_path=input_path,
        output_path=output_path,
        method="color",        # 默认颜色选择法
        output_bg="white",     # "white" | "transparent"
        threshold=50,          # 1-100，越高越激进
        timeout=120,
    )
    print(result["file_size"], result["method"])

# ── 裁剪 ────────────────────────────────────────────────
img = Image.open(input_path)
# x, y 是左上角坐标，w, h 是宽高
cropped = img.crop((x, y, x + w, y + h))
cropped.save(output_path)

# ── 调色（亮度/对比度/饱和度）── PIL ──────────────────────
img = Image.open(input_path)
 enhancer = ImageEnhance.Brightness(img)
 img_bright = enhancer.enhance(1.3)   # 1.0=原图，>1=变亮

 enhancer = ImageEnhance.Contrast(img)
 img_contrast = enhancer.enhance(1.2)  # 1.0=原图，>1=高对比

 enhancer = ImageEnhance.Color(img)
 img_saturated = enhancer.enhance(1.3) # 1.0=原图，0=灰度

# ── 旋转 ────────────────────────────────────────────────
img = Image.open(input_path)
rotated = img.rotate(angle, expand=True, fillcolor=(255, 255, 255))

# ── 加 HOLO 水印 ─────────────────────────────────────────
def add_holo_watermark(img: Image.Image) -> Image.Image:
    draw = ImageDraw.Draw(img)
    brand_color = (211, 47, 47)  # #D32F2F
    text = "HOLO"
    try:
        font = ImageFont.truetype("arial.ttf", 24)
    except Exception:
        font = ImageFont.load_default()
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    padding = 8
    x = img.width - tw - padding * 2 - 15
    y = 15
    overlay = Image.new('RGBA', img.size, (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    overlay_draw.rounded_rectangle(
        [x - padding, y - padding, x + tw + padding, y + th + padding],
        radius=4, fill=(211, 47, 47, 200)
    )
    overlay_draw.text((x, y), text, fill=(255, 255, 255, 255), font=font)
    img = img.convert('RGBA')
    return Image.alpha_composite(img, overlay).convert('RGB')

# ── 等比缩放 ────────────────────────────────────────────
img = Image.open(input_path)
w, h = img.size
if max(w, h) > 1200:
    ratio = 1200 / max(w, h)
    img = img.resize((int(w * ratio), int(h * ratio)), Image.LANCZOS)
img.save(output_path, quality=85)

# ── 格式转换 ────────────────────────────────────────────
img = Image.open(input_path)
img.save(output_path)  # PIL 根据扩展名自动选格式
```

### 工具依赖

| 工具 | 来源 | 用途 |
|------|------|------|
| `gimp_backend.remove_background_and_export()` | `cli-anything-gimp` | 去背景（内部 PIL 实现） |
| `media.detect_white_background()` | `cli_anything-gimp` | 白底检测 |
| PIL / Pillow | 独立库 ≥ 9.0 | 裁剪/调色/旋转/水印/resize |
| numpy | 独立库 ≥ 1.21 | 颜色计算（背景检测） |

**GIMP 安装检查（仅供参考，当前不需要 GIMP 运行）：**

```powershell
& "C:\Program Files\GIMP 2\bin\gimp-console-2.10.exe" --version
# 应输出: GNU 图像处理程序 版本 2.10.x
```

> ⚠️ `gimp-console-2.10.exe` 在 Windows 上存在 PDB 参数签名与文档不符的问题。
> `remove_background_and_export()` 已改用 PIL 实现规避此问题，无需 GIMP 实际运行。

**适用场景：**
- ✅ 加 HOLO 水印（固定位置文字叠加）
- ✅ Resize 缩放（简单的等比缩放）
- ✅ 格式转换（PNG↔JPG↔WEBP）
- ✅ 文件大小压缩
- ✅ Base64 编码输出

```python
from PIL import Image, ImageDraw, ImageFont
import base64

def add_holo_watermark(img: Image.Image) -> Image.Image:
    """在右上角添加 HOLO 品牌水印"""
    draw = ImageDraw.Draw(img)
    brand_color = (211, 47, 47)  # #D32F2F
    text = "HOLO"

    try:
        font = ImageFont.truetype("arial.ttf", 24)
    except:
        font = ImageFont.load_default()

    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]

    padding = 8
    x = img.width - tw - padding * 2 - 15
    y = 15

    overlay = Image.new('RGBA', img.size, (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    overlay_draw.rounded_rectangle(
        [x - padding, y - padding, x + tw + padding, y + th + padding],
        radius=4,
        fill=(211, 47, 47, 200)
    )
    overlay_draw.text((x, y), text, fill=(255, 255, 255, 255), font=font)

    img = img.convert('RGBA')
    return Image.alpha_composite(img, overlay).convert('RGB')


def resize_for_platform(img: Image.Image, target_max: int = 1200) -> Image.Image:
    """等比缩放，保持宽高比"""
    w, h = img.size
    if max(w, h) <= target_max:
        return img
    ratio = target_max / max(w, h)
    return img.resize((int(w * ratio), int(h * ratio)), Image.LANCZOS)


def to_base64(img: Image.Image, format: str = 'JPEG', quality: int = 85) -> str:
    """将图片转为 base64 字符串（用于 HTML 内嵌）"""
    import io
    buffer = io.BytesIO()
    img.save(buffer, format=format, quality=quality)
    return base64.b64encode(buffer.getvalue()).decode('ascii')
```

## 快速检测

`media.detect_white_background(path)` 返回结构化判断：

```
verdict: "clean_white" | "not_white" | "mixed" | "edge_noise"
corner_score: 0.0-1.0  (四角白度置信分)
recommendation: "skip_remove" | "force_remove" | "inspect"
```

**检测逻辑：** 四角 5% 区域均值 > 230 且方差 < 10 = 白底。

## 工具依赖

| 工具 | 版本要求 | 用途 | 优先级 |
|------|---------|------|-------|
| **Python PIL/Pillow** | ≥ 9.0 | 裁剪/调色/旋转/水印/resize/去背景 | **主力** |
| **numpy** | ≥ 1.21 | 颜色计算和图像分析 | **必需** |
| **cli-anything-gimp** | installed | `gimp_backend.remove_background_and_export()` + `media.detect_white_background()` | **必需** |

## 数据源约束

> ⚠️ 产品图片优先使用 NAS 共享盘真实资料。也支持业务员通过对话直接上传。

```
NAS 共享盘 (192.168.0.194):
Y:\基础资料\                    ← 业务员上传的原始图
Y:\1.HOLO机器目录（最终资料存放）\
├── 1.风冷皮带接头机\           ← 产品图来源
├── 2.水冷式接头机\
├── 3.易洁带碰接机\
├── 4.输送带分层机\
├── 5.打齿机\
├── 7.裁切 切割、环切、分条机\
└── 8.焊接 导条机\
```

**禁止行为：**
- 🚫 使用网络搜索的图片代替真实产品图
- 🚫 使用 AI 生成的假产品图
- 🚫 捏造不存在的产品型号图片
- 🚫 跳过预处理直接把脏图塞给 gen

## 与其他技能的关系

| 技能 | 关系 | 说明 |
|------|------|------|
| **holo-social-gen** | **下游** | image 处理好的干净素材 → gen 做 AI 设计 |
| **holo-social-infographic** | **下游** | image 处理好的配图 → infographic 做参数表/对比图 |
| **cli-anything-hub** | **底层依赖** | 提供 GIMP CLI 工具发现和环境检查 |
| **honglong-products** | **数据源** | 提供产品型号列表和 BOM 信息 |
| **nas-file-reader** | **数据源** | 读取 NAS 共享盘上的产品原图 |

## 品牌规范（不可违反）

- **品牌名**: HOLO INDUSTRIAL（中文：红龙工业）
- **主色**: `#D32F2F`（HOLO Red）— **唯一正确值**
- **联系**: sale@18816.cn \| WhatsApp: +86 18057753889
- **公司全称**: Wenzhou Honglong Industrial Equipment Manufacturing Co., Ltd.
- **角标永远写 "HOLO"，绝对禁止用 NOVO/NEW/NUEVO 等代替**
