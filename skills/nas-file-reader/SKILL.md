---
name: nas-file-reader
version: 2.1.0
description: "快速读取NAS共享盘文件，支持PDF OCR识别、图片分析。当用户需要：(1) 挂载/连接NAS (2) 读取NAS文件 (3) OCR识别PDF (4) 搜索NAS文件 时使用此技能。"
author: OpenClaw
metadata:
  clawhub:
    emoji: 📁
triggers:
  - NAS文件
  - NAS读取
  - 挂载NAS
---

# NAS 文件快速读取技能

快速访问 HOLO 公司 NAS 共享盘文件，支持 PDF OCR 识别、图片分析、文本读取

---

## 🔐 安全登录流程

### 首次使用（必须执行）

```powershell
# 运行设置向导，输入用户名和密码
.\scripts\mount-nas.ps1 -Setup
```

系统会提示：
```
请输入NAS用户名: ______
请输入NAS密码: ********
是否保存凭据供下次使用？(Y/n): Y
```

**🔒 安全特性：**
- 密码使用Windows加密存储
- 凭据文件仅当前用户可访问
- 密码不会明文保存或上传云端
- **首次使用需要用户自行输入用户名和密码**

---

## 🚀 日常使用

### 挂载NAS
```powershell
# 普通挂载（使用保存的凭据）
.\scripts\mount-nas.ps1

# 强制重新挂载
.\scripts\mount-nas.ps1 -Force

# 详细输出
.\scripts\mount-nas.ps1 -Verbose
```

### 管理凭据
```powershell
# 重新设置用户名密码
.\scripts\mount-nas.ps1 -Setup

# 删除保存的凭据
.\scripts\mount-nas.ps1 -Forget
```

---

## ⚠️ 常见问题

### 问题1: 提示"未找到保存的凭据"
**解决**: 首次使用需要运行设置向导
```powershell
.\scripts\mount-nas.ps1 -Setup
```

### 问题2: 用户名或密码错误
**解决**: 重新设置凭据
```powershell
.\scripts\mount-nas.ps1 -Setup
```

### 问题3: System error 67（网络名找不到）
**解决**:
```powershell
# 1. 检查网络连通性
ping 192.168.0.194

# 2. 等待10秒后重试
Start-Sleep -Seconds 10
.\scripts\mount-nas.ps1 -Force
```

### 问题4: 已记住的连接冲突
**解决**:
```powershell
.\scripts\mount-nas.ps1 -Force
```

---

## 📁 凭据存储位置

```
%USERPROFILE%\.openclaw\.nas_credentials
```

**文件权限**: 仅当前用户可读写

**加密方式**: Windows DPAPI（Data Protection API）

---

### 方式1: 直接说明需求
```
用户: 帮我读取NAS上的企业画册PDF
用户: 查看共享盘上的产品图片
用户: OCR识别这个扫描件
```

### 方式2: 指定路径
```
用户: 读取 Y:\7.企业介绍宣传视频\企业宣传画册 中文\公司介绍.pdf
用户: 查看图片 Y:\1.HOLO机器目录\5.打齿机\全自动打齿机\海报\
```

## NAS 连接信息

### 主NAS（内网）
- **地址**: 192.168.0.194
- **用户**: HOLO
- **密码**: 通过「初始化获客系统」配置，存储在凭据管理器
- **共享**: 市场营销
- **映射**: Y:

### 备用NAS
- **地址**: 192.168.1.8
- **用户**: guest
- **密码**: (空)
- **共享**: HONGLONG
- **映射**: Y:

## 产品资料路径

```
Y:\1.HOLO机器目录（最终资料存放）\
├── 1.风冷皮带接头机\
├── 2.水冷式接头机\
├── 4.输送带分层机\
├── 5.打齿机\
├── 7.裁切分切机\
├── 8.焊接导条机\
├── 15.橡胶带硫化机\
```

## 企业宣传资料

```
Y:\7.企业介绍宣传视频  企业宣传手册\
├── 企业宣传画册 中文\
├── 企业宣传画册 英文（含进口配件供应商）\
```

## 依赖工具

- **Tesseract OCR**: 扫描版PDF识别
- **PyMuPDF (fitz)**: PDF处理
- **PIL**: 图片处理

## 快速代码

### 读取PDF (OCR)
```python
import fitz
import pytesseract
from PIL import Image
import io

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def read_pdf(pdf_path, pages=3):
    doc = fitz.open(pdf_path)
    results = []
    for i in range(min(pages, len(doc))):
        pix = doc[i].get_pixmap(dpi=120)
        img = Image.open(io.BytesIO(pix.tobytes('png')))
        text = pytesseract.image_to_string(img, lang='chi_sim')
        results.append({'page': i+1, 'text': text[:1500]})
    return results
```

### 搜索文件
```powershell
Get-ChildItem Y:\ -Recurse -Include "*.pdf" -Depth 2
Get-ChildItem Y:\1.HOLO机器目录 -Recurse -Include "*.jpg" -Depth 3
```
