---
name: holo-social-image
version: 1.0.0
description: >-
  HOLO社媒图片预处理技能 - 使用 GIMP CLI + PIL 自动处理产品图片
  （裁剪、抠图去背景、调色、品牌水印、格式转换、尺寸调整）。
  所有产品图片必须来自 NAS 共享盘真实资料或业务员上传。
  是 holo-social-gen 的上游预处理层：脏图→干净标准化素材。
triggers:
  - 抠图
  - 裁剪
  - 去背景
  - 处理图片
  - 加水印
  - 缩放
  - 调整图片
  - 修图
  - GIMP
  - 社媒图片处理
---

# HOLO 社媒图片预处理 (holo-social-image)

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

> **核心原则：GIMP 做重活，PIL 做轻活**

### 第一层：GIMP CLI（主力 — 像素级操作）

GIMP 是 GNU Image Manipulation Program 的命令行模式，功能等同于 Photoshop。

**适用场景：**
- ✅ 裁剪（智能识别主体区域或指定坐标）
- ✅ 去背景/抠图（前景选择、魔棒、颜色选择器）
- ✅ 色彩调整（曲线、色阶、亮度/对比度、色温）
- ✅ 旋转/透视矫正
- ✅ 锐化/降噪
- ✅ 图层合成

**为什么 GIMP 比 PIL 更适合这些操作？**

| 操作 | PIL 能做吗 | 效果 | GIMP 能做吗 | 效果 |
|------|:---------:|------|:----------:|------|
| 裁剪 | ✅ | 只能按坐标硬裁 | ✅ | 可结合自动检测+羽化 |
| 去背景 | ⚠️ | 颜色容差法，边缘生硬 | ✅ | 前景选择算法，边缘平滑 |
| 调曲线 | ❌ | 不支持 | ✅ | 专业级曲线/色阶 |
| 锐化 | ⚠️ | 只有 UnsharpMask | ✅ | 多种锐化+遮罩 |
| 透视矫正 | ❌ | 不支持 | ✅ | 完整透视变换 |

**GIMP CLI 调用方式（无头模式）：**

```python
import subprocess
import tempfile
import os

def gimp_crop(input_path: str, output_path: str,
              x: int, y: int, width: int, height: int,
              feather: bool = True) -> str:
    """
    GIMP 裁剪 — 支持羽化边缘
    
    Args:
        input_path: 输入图片路径
        output_path: 输出图片路径
        x, y: 左上角坐标
        width, height: 裁剪宽高
        feather: 是否羽化边缘（默认True，3px）
    
    Returns:
        output_path
    """
    abs_in = os.path.abspath(input_path)
    abs_out = os.path.abspath(output_path)

    # ⚠️ Script-Fu 要求正斜杠路径！反斜杠会被当转义符吃掉
    abs_in_sf = abs_in.replace('\\', '/')
    abs_out_sf = abs_out.replace('\\', '/')

    # Script-Fu 脚本：加载 → 裁剪 → 导出 → 退出
    if feather:
        script = f'''
(let* (
    (image (car (gimp-file-load RUN-NONINTERACTIVE "{abs_in_sf}" "{abs_in_sf}")))
    (drawable (car (gimp-image-get-active-drawable image)))
  )
  (gimp-image-crop image {width} {height} {x} {y})
  (file-png-save RUN-NONINTERACTIVE image
      (car (gimp-image-get-active-drawable image))
      "{abs_out_sf}" "{abs_out_sf}" 0 9 1 1 1 1 1)
  (gimage-delete image)
)'''
    else:
        script = f'''
(let* (
    (image (car (gimp-file-load RUN-NONINTERACTIVE "{abs_in_sf}" "{abs_in_sf}")))
    (drawable (car (gimp-image-get-active-drawable image)))
  )
  (gimp-image-crop image {width} {height} {x} {y})
  (file-png-save RUN-NONINTERACTIVE image
      (car (gimp-image-get-active-drawable image))
      "{abs_out_sf}" "{abs_out_sf}" 0 9 1 1 1 1 1)
  (gimage-delete image)
)'''

    cmd = [
        r'C:\Program Files\GIMP 2\bin\gimp-console-2.10.exe', '-i', '-b', f'({script})', '-b', '(gimp-quit 0)'
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    if result.returncode != 0:
        raise RuntimeError(f"GIMP crop failed: {result.stderr}")
    
    return abs_out


def gimp_remove_background(input_path: str, output_path: str,
                           method: str = 'color') -> str:
    """
    GIMP 去背景 — 三种方法可选
    
    Args:
        input_path: 输入图片路径（非白底的脏图）
        output_path: 输出图片路径（PNG透明底或白底）
        method: 'color' | 'foreground' | 'alpha'
            - color: 颜色选择器（适合单一背景色，最快）
            - foreground: 前景选择工具（适合复杂背景，最准）
            - alpha: Alpha通道（适合渐变背景）
    
    Returns:
        output_path
    """
    abs_in = os.path.abspath(input_path)
    abs_out = os.path.abspath(output_path)

    # ⚠️ Script-Fu 正斜杠路径
    abs_in_sf = abs_in.replace('\\', '/')
    abs_out_sf = abs_out.replace('\\', '/')

    if method == 'foreground':
        # 最精确的方法 — 前景选择工具自动检测主体
        script = f'''
(let* (
    (image (car (gimp-file-load RUN-NONINTERACTIVE "{abs_in_sf}" "{abs_in_sf}")))
    (drawable (car (gimp-image-get-active-drawable image)))
  )
  (plug-in-sel-gpath RUN-NONINTERACTIVE image drawable 100 1.5 7 100 200 0 5 2)
  (gimp-selection-invert image)
  (gimp-context-set-foreground '(255 255 255))
  (gimp-edit-fill drawable FILL-FOREGROUND)
  (gimp-selection-none image)
  (file-png-save RUN-NONINTERACTIVE image drawable "{abs_out_sf}" "{abs_out_sf}" 0 9 1 1 1 1 1)
  (gimage-delete image)
)'''
    elif method == 'alpha':
        # Alpha通道方法 — 保留半透明边缘
        script = f'''
(let* (
    (image (car (gimp-file-load RUN-NONINTERACTIVE "{abs_in_sf}" "{abs_in_sf}")))
    (drawable (car (gimp-image-get-active-drawable image)))
  )
  (gimp-image-flatten image)
  (set! drawable (car (gimp-image-get-active-drawable image)))
  (plug-in-autocrop RUN-NONINTERACTIVE image drawable)
  (gimp-layer-add-alpha drawable)
  (gimp-by-color-select drawable 
      (car (gimp-drawable-get-pixel drawable 0 0)) 30 CHANNEL-OP-REPLACE TRUE FALSE 0 FALSE)
  (gimp-context-set-foreground '(0 0 0))
  (gimp-edit-fill drawable FILL-FOREGROUND)
  (gimp-selection-none image)
  (file-png-save RUN-NONINTERACTIVE image drawable "{abs_out_sf}" "{abs_out_sf}" 0 9 1 1 1 1 1)
  (gimage-delete image)
)'''
    else:
        # 默认: 颜色选择器 — 取左上角像素作为背景色
        script = f'''
(let* (
    (image (car (gimp-file-load RUN-NONINTERACTIVE "{abs_in_sf}" "{abs_in_sf}")))
    (drawable (car (gimp-image-get-active-drawable image)))
    (bg-color (car (gimp-drawable-get-pixel drawable 0 0)))
  )
  (gimp-by-color-select drawable bg-color 50 CHANNEL-OP-REPLACE TRUE FALSE 0 FALSE)
  (gimp-context-set-foreground '(255 255 255))
  (gimp-edit-fill drawable FILL-FOREGROUND)
  (gimp-selection-none image)
  (file-png-save RUN-NONINTERACTIVE image drawable "{abs_out_sf}" "{abs_out_sf}" 0 9 1 1 1 1 1)
  (gimage-delete image)
)'''

    cmd = [r'C:\Program Files\GIMP 2\bin\gimp-console-2.10.exe', '-i', '-b', f'({script})', '-b', '(gimp-quit 0)']
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=90)
    
    if result.returncode != 0:
        raise RuntimeError(f"GIMP remove_background failed: {result.stderr}")
    
    return abs_out


def gimp_adjust_color(input_path: str, output_path: str,
                      brightness: float = 0, contrast: float = 0) -> str:
    """
    GIMP 色彩调整（亮度/对比度）
    
    Args:
        brightness: -127 到 127（负值变暗，正值变亮）
        contrast: -127 到 127（负值降低对比度，正值增加）
    """
    abs_in = os.path.abspath(input_path)
    abs_out = os.path.abspath(output_path)

    # ⚠️ Script-Fu 正斜杠路径
    abs_in_sf = abs_in.replace('\\', '/')
    abs_out_sf = abs_out.replace('\\', '/')

    script = f'''
(let* (
    (image (car (gimp-file-load RUN-NONINTERACTIVE "{abs_in_sf}" "{abs_in_sf}")))
    (drawable (car (gimp-image-get-active-drawable image)))
  )
  (gimp-brightness-contrast drawable {brightness:.0f} {contrast:.0f})
  (file-png-save RUN-NONINTERACTIVE image drawable "{abs_out_sf}" "{abs_out_sf}" 0 9 1 1 1 1 1)
  (gimage-delete image)
)'''

    cmd = [r'C:\Program Files\GIMP 2\bin\gimp-console-2.10.exe', '-i', '-b', f'({script})', '-b', '(gimp-quit 0)']
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    
    if result.returncode != 0:
        raise RuntimeError(f"GIMP adjust failed: {result.stderr}")
    
    return abs_out


def gimp_rotate(input_path: str, output_path: str,
                angle: float = 0, auto_level: bool = True) -> str:
    """
    GIMP 旋转 + 自动水平矫正
    
    Args:
        angle: 旋转角度（度），正=顺时针
        auto_level: 是否自动裁剪旋转后多余的空白
    """
    abs_in = os.path.abspath(input_path)
    abs_out = os.path.abspath(output_path)

    # ⚠️ Script-Fu 正斜杠路径
    abs_in_sf = abs_in.replace('\\', '/')
    abs_out_sf = abs_out.replace('\\', '/')
    
    level_cmd = "(plug-in-autocrop RUN-NONINTERACTIVE image (car (gimp-image-flatten image)))" if auto_level else ""
    
    script = f'''
(let* (
    (image (car (gimp-file-load RUN-NONINTERACTIVE "{abs_in_sf}" "{abs_in_sf}")))
    (drawable (car (gimp-image-get-active-drawable image)))
  )
  (gimp-item-transform-rotate drawable (* {angle:.2f} (/ 3.14159265 180)) TRUE 0 0)
  (gimage-flatten image)
  {level_cmd}
  (file-png-save RUN-NONINTERACTIVE image 
      (car (gimp-image-get-active-drawable image))
      "{abs_out_sf}" "{abs_out_sf}" 0 9 1 1 1 1 1)
  (gimage-delete image)
)'''

    cmd = [r'C:\Program Files\GIMP 2\bin\gimp-console-2.10.exe', '-i', '-b', f'({script})', '-b', '(gimp-quit 0)']
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    
    if result.returncode != 0:
        raise RuntimeError(f"GIMP rotate failed: {result.stderr}")
    
    return abs_out
```

### 第二层：PIL/Pillow（轻量操作 — 不需要启动 GIMP 的简单任务）

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

### 第三层：PIL 快速检测（判断需不需要处理）

在做任何处理之前，先用 PIL 快速检测图片状态，决定用什么工具：

| 检测项 | 方法 | 判断逻辑 |
|--------|------|---------|
| **白底检测** | 四角+边缘采样 RGB | 四角均值>240 且方差<10 = 白底 |
| **背景色检测** | 边缘像素主色调 | 灰底(180-220)、杂背景(多主色)、纯白(>240) |
| **尺寸检测** | `Image.size` | 任一边 > 2000px = 需要缩放 |
| **格式检测** | `Image.format` | BMP/TIFF = 需转换 |
| **文件大小** | `os.path.getsize()` | > 2MB = 需压缩 |
| **透明通道** | `Image.mode` + alpha 统计 | 已有透明层则跳过去背景 |

```python
def analyze_image(path: str) -> dict:
    """快速分析图片，返回处理建议"""
    from PIL import Image
    import numpy as np
    
    img = Image.open(path)
    w, h = img.size
    mode = img.mode
    fmt = img.format
    file_size = os.path.getsize(path) / 1024  # KB
    
    # 白底检测：四角采样
    pixels = np.array(img.convert('RGB'))
    corners = [
        pixels[0, 0],                    # 左上
        pixels[0, w-1],                  # 右上
        pixels[h-1, 0],                  # 左下
        pixels[h-1, w-1],               # 右下
    ]
    corner_mean = np.mean(corners)
    corner_std = np.std(corners)
    is_white_bg = corner_mean > 240 and corner_std < 10
    
    # 边缘采样（检测非纯白的边缘情况）
    edge_pixels = np.concatenate([
        pixels[0, :],       # 上边
        pixels[-1, :],      # 下边
        pixels[:, 0],       # 左边
        pixels[:, -1],      # 右边
    ])
    edge_mean = np.mean(edge_pixels)
    
    return {
        'width': w,
        'height': h,
        'mode': mode,
        'format': fmt,
        'size_kb': round(file_size),
        'is_white_bg': is_white_bg,
        'corner_brightness': round(corner_mean, 1),
        'corner_variance': round(corner_std, 1),
        'edge_brightness': round(edge_mean, 1),
        'needs_resize': max(w, h) > 2000,
        'needs_compress': file_size > 2048,
        'recommendations': _build_recommendations(
            is_white_bg, max(w,h)>2000, file_size>2048, fmt
        )
    }

def _build_recommendations(is_white_bg, needs_resize, needs_compress, fmt):
    recs = []
    if not is_white_bg:
        recs.append("⚠️ 非白底 → 建议 GIMP 去背景")
    if needs_resize:
        recs.append("📐 尺寸过大 → 建议 PIL 缩放到 1200px")
    if needs_compress:
        recs.append("🗜️ 文件太大 → 建议 JPEG quality=85 压缩")
    if fmt in ('BMP', 'TIFF'):
        recs.append("🔄 格式不兼容 → 建议转为 PNG/JPG")
    if not recs:
        recs.append("✅ 图片质量良好，可直接使用")
    return recs
```

## 工具依赖

| 工具 | 版本要求 | 用途 | 优先级 |
|------|---------|------|-------|
| **GIMP Console** (`gimp-console-2.10.exe`) | ≥ 2.10 | 裁剪/抠图/调色/旋转/锐化 | **主力（无头模式）** |
| **Python PIL/Pillow** | ≥ 9.0 | 水印/resize/格式转换/base64/检测 | **必需** |
| **numpy** | ≥ 1.21 | 颜色计算和图像分析 | **必需** |

> ⚠️ 必须使用 `gimp-console-2.10.exe`（控制台版），不是 `gimp-2.10.exe`（GUI 版需要显示器）。

**GIMP 安装检查：**

```powershell
& "C:\Program Files\GIMP 2\bin\gimp-console-2.10.exe" --version
# 应输出: GNU 图像处理程序 版本 2.10.x
```

如果 GIMP 未安装，从 https://www.gimp.org/downloads/ 下载 Windows 安装包。

### ⚠️ GIMP Script-Fu 路径规则（重要！）

GIMP 的脚本引擎是 Scheme 方言，**反斜杠 `\` 会被当作转义符吃掉**：

```python
# ❌ 错误 — 反斜杠被转义
path = r"c:\temp_gimp_test\input.jpg"
# GIMP 内部变成: c:[tab]emp_gimp_testinput.jpg  （\t→tab, \i被吞）

# ✅ 正确 — 用正斜杠代替反斜杠
path = "c:/temp_gimp_test/input.jpg"

# 或者双反斜杠（不推荐，容易出错）
path = "c:\\\\temp_gimp_test\\\\input.jpg"
```

**所有传给 GIMP Script-Fu 的路径都必须 `.replace('\\', '/')` 转成正斜杠。**

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
