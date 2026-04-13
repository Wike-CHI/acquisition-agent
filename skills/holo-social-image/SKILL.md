---
name: holo-social-image
description: "HOLO社媒图片处理技能 - 使用 GIMP CLI + PIL 自动处理产品图片（尺寸调整、品牌水印、格式转换）。所有产品图片必须来自 NAS 共享盘真实资料。"
version: 1.1.0
triggers:
  - 发Facebook
  - 发Instagram
  - 发LinkedIn
  - 发Twitter
  - 发社媒
  - 社媒图片
  - 配图
  - 处理图片
  - 调整尺寸
  - 添加水印
  - 产品图片
  - 缩放图片
  - 导出图片
  - 批量处理
  - 多平台图片
  - Facebook配图
  - Instagram配图
  - LinkedIn配图
  - 朋友圈图片
  - 微信配图
  - 宣传图片
  - 产品海报
  - 社媒内容配图
  - 生成图片
  - 帮我发
  - 发一条
---

# HOLO 社媒图片处理技能

> 使用 GIMP CLI + PIL 自动处理产品图片，用于社媒运营配图

---

## ⚠️ 核心原则（必须遵守）

**所有产品图片必须来自 NAS 共享盘真实资料，禁止使用网络图片或捏造图片！**

### 🔴 关键教训（血泪经验）

> ⚠️ **NAS 图片可能是透明背景，不是白底！**

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 背景变黑色 | 原图是 PNG+透明通道 (RGBA)，alpha=0 | 必须用真正的白底图，或用 PIL 填充白底 |
| 白色变透明 | RGBA 透明背景在白色画布上显示异常 | 检查原图四角颜色确认背景色 |
| 边缘发黑 | 图片比例与目标不符，边缘露出黑色区域 | 缩放时用填充模式(cover)而非适应(contain) |

### 📋 图片背景检查流程（必做）

```
获取原图后 → 检查图片模式 → 四角颜色验证
    ↓
PNG/RGBA + alpha=0 → 找真正的白底图！
    ↓
RGB + 白底 → 直接使用
```

**检查命令**：
```python
from PIL import Image
import numpy as np

img = Image.open('原图路径')
arr = np.array(img)

# 检查四角颜色
print(f'左上角: {arr[0, 0]}')
print(f'右上角: {arr[0, -1]}')
print(f'左下角: {arr[-1, 0]}')
print(f'右下角: {arr[-1, -1]}')

# RGBA 检查
if img.mode == 'RGBA':
    alpha = arr[:, :, 3]
    if (alpha == 0).any():
        print('⚠️ 发现透明像素！需要使用真正的白底图')
```

### 📁 NAS 白底图正确路径

```
# 二代风冷机白底图（正确）
Y:\1.HOLO机器目录（最终资料存放）\1.风冷皮带接头机\二代风冷皮带接头机（二代风冷易洁带接头机） PA-Ⅱ吴植材设计\纯二代风冷机照片\老图\白底图\IMG_1058.jpg  ✅ RGB白底

# 不是这个（透明背景）
Y:\...\二代风冷+易洁带 照片修图\白底图\DSC08501.png  ❌ RGBA透明
```

**寻找白底图关键词**：
- 目录名含 `白底图` ✅
- 文件名含 `白底` / `white` / `background` ✅
- 文件格式 JPG/RGB ✅

### 图片来源优先级
1. **NAS 产品目录**：`Y:\1.HOLO机器目录（最终资料存放）\`
2. **NAS 市场营销资料**：`Y:\市场营销\` / `Y:\市场营销2\`
3. **NAS 产品图片库**：指定的产品图片文件夹

---

## 🎯 核心功能

| 功能 | 命令 | 用途 |
|------|------|------|
| 尺寸调整 | `--resize` | LinkedIn 1200×627 / Instagram 1080×1080 |
| 添加水印 | `--watermark` | HOLO 品牌标识 |
| 格式转换 | `--format` | PNG → JPG / PNG |
| 批量处理 | `--batch` | 多张图片同时处理 |
| 裁剪 | `--crop` | 按平台要求裁剪 |

---

## 📐 各平台最佳尺寸

| 平台 | 尺寸 (px) | 用途 |
|------|-----------|------|
| LinkedIn | 1200 × 627 | 帖子图片 |
| Facebook | 1200 × 630 | 帖子图片 |
| Instagram Feed | 1080 × 1080 | 正方形帖子 |
| Instagram Story | 1080 × 1920 | 快拍 |
| Twitter/X | 1600 × 900 | 帖子图片 |
| YouTube Thumbnail | 1280 × 720 | 视频封面 |
| Pinterest | 1000 × 1500 | Pin 图 |

---

## 🚀 使用方式

### 基础命令

```bash
# 调整图片尺寸（LinkedIn 标准）
cli-anything-gimp canvas resize --width 1200 --height 627 input.png --output output.png

# 添加品牌水印
cli-anything-gimp draw add-watermark --image logo.png --position bottom-right input.png --output output.png

# 格式转换（PNG → JPG）
cli-anything-gimp export format --format jpg input.png --output output.jpg

# 批量调整尺寸
cli-anything-gimp canvas resize --width 1200 --height 627 *.png --output resized/
```

### ⭐ 推荐工作流（正确流程）

```bash
# 1. 在 NAS 上找到真正的白底图
#    检查目录：Y:\...\白底图\IMG_*.jpg ✅
#    避开：Y:\...\照片修图\白底图\DSC*.png ❌（透明背景）

# 2. 用 Python PIL 处理（推荐）
#    - 缩放并填充白底
#    - 添加 HOLO 水印
#    - 导出最终图片

# 3. 用 GIMP CLI 管理项目层
#    - 创建项目
#    - 导入处理好的图片
#    - 最终导出

# 4. 验证输出
#    - 检查四角颜色是否为白色
#    - 确认水印位置正确
```

### Python PIL 处理脚本（推荐方式）

```python
from PIL import Image, ImageDraw, ImageFont

def process_social_image(src_path, out_path, target_w, target_h, brand_color=(229, 57, 53)):
    """处理社媒配图 - 白底 + 水印"""
    
    # 1. 打开图片并检查背景
    img = Image.open(src_path)
    print(f'原图尺寸: {img.size}, 模式: {img.mode}')
    
    # 2. 缩放到目标尺寸（保持比例，填充白底）
    img_ratio = img.width / img.height
    target_ratio = target_w / target_h
    
    if img_ratio > target_ratio:
        new_h = target_h
        new_w = int(new_h * img_ratio)
    else:
        new_w = target_w
        new_h = int(new_w / img_ratio)
    
    img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # 3. 创建白底画布并居中粘贴
    canvas = Image.new('RGB', (target_w, target_h), (255, 255, 255))
    x = (target_w - new_w) // 2
    y = (target_h - new_h) // 2
    canvas.paste(img, (x, y))
    
    # 4. 添加 HOLO 水印
    draw = ImageDraw.Draw(canvas)
    font_size = int(target_w * 0.03)
    # ⚠️ 必须使用黑体！Arial不支持中文会显示方框
    font = ImageFont.truetype('C:/Windows/Fonts/simhei.ttf', font_size)
    
    text = 'HOLO'
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    margin = 15
    
    # 红色背景 + 白色文字
    draw.rectangle([target_w - tw - margin*2 - 5, target_h - th - margin*2 - 5, 
                    target_w, target_h], fill=brand_color)
    draw.text((target_w - tw - margin, target_h - th - margin), 
              text, font=font, fill=(255, 255, 255))
    
    # 5. 保存
    canvas.save(out_path, 'PNG', quality=95)
    print(f'✓ 保存: {out_path} ({target_w}x{target_h})')
    
    # 6. 验证
    arr = np.array(canvas)
    print(f'左上角验证: {arr[0, 0]} (应为白色 [255,255,255])')

# 使用示例
process_social_image(
    src_path='Y:/白底图/IMG_1058.jpg',  # 必须是真正的白底图！
    out_path='Facebook_Final.png',
    target_w=1200,
    target_h=630
)
```

---

## 📋 HOLO 品牌规范

### 水印要求
- **位置**：右下角
- **透明度**：30-50%
- **大小**：图片宽度的 10-15%
- **Logo 文件**：保存在 `Y:\市场营销\品牌素材\HOLO_Logo.png`

### 色彩规范
- **主色**：红色 (#E53935)
- **辅助色**：深灰 (#333333)
- **背景**：白色或浅灰

---

## 🔧 常见操作示例

### 场景1：LinkedIn 产品帖配图
```bash
# 输入：NAS 白底产品大图
# 输出：LinkedIn 标准尺寸 + 水印

# 方法A：PIL 处理（推荐）
python process_social.py --src "Y:/白底图/IMG_1058.jpg" --out linkedin.png --w 1200 --h 627

# 方法B：GIMP CLI 处理
cli-anything-gimp project new linkedin-export
cli-anything-gimp layer add-from-file "白底图.jpg" -n "产品"
cli-anything-gimp canvas resize --width 1200 --height 627 --output linkedin-ready.png
cli-anything-gimp export render "final-linkedin.png" --overwrite
```

### 场景2：Instagram 正方形图
```bash
# 使用 PIL（填充白底 + 缩放）
python process_social.py --src "Y:/白底图/IMG_1058.jpg" --out instagram.png --w 1080 --h 1080

# GIMP 导入
cli-anything-gimp layer add-from-file "instagram.png" -n "处理后"
cli-anything-gimp export render "final-instagram.png" --overwrite
```

### 场景3：批量导出多平台
```bash
# 1. 用 PIL 批量处理各尺寸
python process_social.py --src "Y:/白底图/IMG_1058.jpg" --out facebook.png --w 1200 --h 630
python process_social.py --src "Y:/白底图/IMG_1058.jpg" --out linkedin.png --w 1200 --h 627
python process_social.py --src "Y:/白底图/IMG_1058.jpg" --out instagram.png --w 1080 --h 1080

# 2. 用 GIMP 管理图层项目（可选）
cli-anything-gimp project new product-export
cli-anything-gimp layer add-from-file "facebook.png" -n "Facebook"
cli-anything-gimp layer add-from-file "instagram.png" -n "Instagram"
```

### 场景4：处理透明背景图片（必须先填充白底）
```bash
# ❌ 错误做法：直接用透明背景图
cli-anything-gimp layer add-from-file "DSC08501.png"  # 背景会是黑色！

# ✅ 正确做法：用 PIL 先处理
python -c "
from PIL import Image
img = Image.open('DSC08501.png')
img = img.convert('RGB')  # 转RGB
# 创建白底并paste
canvas = Image.new('RGB', img.size, (255,255,255))
canvas.paste(img, mask=img.split()[3])  # 用alpha做mask
canvas.save('白底处理后.png')
"
# 然后再用 GIMP 处理
cli-anything-gimp layer add-from-file "白底处理后.png"
```

---

## ⚙️ 技术要求

### 前置条件
- 已安装：`pip install cli-anything-gimp`
- GIMP 已安装在系统
- 品牌 Logo 文件可用（来自 NAS）

### 输出格式
- 默认格式：PNG（保留透明度）
- 照片类：JPG（减小文件大小）
- 透明背景：PNG

---

## 📁 输出目录结构

```
holo-social-output/
├── linkedin/
│   └── YYYYMMDD-product-*.png
├── instagram/
│   └── YYYYMMDD-product-*.png
├── facebook/
│   └── YYYYMMDD-product-*.png
└── archive/
    └── raw-*.png  # 原始文件备份
```

---

_版本: 1.1.0_
_更新: 2026-04-11_
_数据来源: NAS 共享盘（真实产品图片）_

## 📝 更新记录

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| 1.0.0 | 2026-04-11 | 初始版本 |
| 1.1.0 | 2026-04-11 | 添加透明背景处理规范、白底图检查流程、PIL处理脚本 |

## 🔴 错误案例（记录学习）

| 日期 | 问题 | 原因 | 修复 |
|------|------|------|------|
| 2026-04-11 | 背景变黑 | 原图DSC08501.png是透明背景(RGBA)，alpha=0 | 改用白底图IMG_1058.jpg |

**教训**：NAS 上标注"白底图"的 PNG 文件可能是透明背景的伪白底！必须验证四角颜色。
