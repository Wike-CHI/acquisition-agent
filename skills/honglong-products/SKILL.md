---
name: honglong-products
version: 3.1.0
description: 红龙(HOLO)工业皮带设备产品知识库。优先读取技能本地结构化文档，NAS原始文件作为兜底权威来源，支持产品型号查询、技术参数、BOM、选型建议等。
always: false
triggers:
  - 产品
  - 型号
  - 规格
  - 报价
  - 选型
  - 风冷机
  - 水冷机
  - 分层机
  - 导条机
  - 打齿机
  - 裁切机
  - BOM
  - 参数
  - 技术参数
  - 产品知识
  - holo
  - 用途
  - 应用场景
  - 怎么用
  - 用在哪
  - 适用场景
  - 输送带
  - 皮带
  - 硫化
  - 拼接
  - 接头
  - 打齿
  - 分层
  - 风冷还是水冷
  - 选哪个
  - 推荐哪款
  - 有什么区别
  - 厚度
  - 规格怎么选
---

# 红龙产品知识库 v3.1

> ⭐ **双层架构：结构化文档优先，NAS原始文件兜底**

---

## 📐 双层读取架构

```
① 技能 references/（结构化文档，秒级读取）
   references/tech-specs.md          → 技术规格总表
   references/customers.md            → 客户痛点/案例
   references/inspection-standards.md → 检验标准摘要
   references/products.md             → 产品分类/选型对照
   references/applications.md        → 应用场景/话术
   references/INDEX.md               → 完整文件索引
        ↓ 查不到时
② NAS 共享盘（原始文件，权威兜底）
   Y:\1.HOLO机器目录（最终资料存放）\  → Excel/PDF/图片
   W:\公司报价资料\                   → 报价参考表.xlsx
```

> ⚠️ **不要重复造轮子**：references/ 里已有结构化内容，直接读；只有在 references/ 查不到时才去 NAS 翻原始文件。

---

## 🗂️ references/ 本地文档速查

| 文件 | 内容 | 何时读 |
|------|------|--------|
| `INDEX.md` | references/ 完整文件清单 | 不确定要找什么时先读这个 |
| `tech-specs.md` | 全产品线技术规格/BOM | 问参数、规格、型号、BOM时 |
| `customers.md` | 客户痛点、案例、产品匹配 | 问选型、适合什么客户时 |
| `products.md` | 产品分类/选型对照表 | 不知道选哪款时 |
| `inspection-standards.md` | 检验标准摘要 | 问质量标准时 |
| `applications.md` | 应用场景/话术/快速问答 | 问用途、对话场景时 |

**读取方式**：
```powershell
# 直接读本地结构化文档（快）
Get-Content "C:\Users\Administrator\.workbuddy\skills\honglong-products\references\tech-specs.md"

# 不确定找什么 → 先读 INDEX
Get-Content "C:\Users\Administrator\.workbuddy\skills\honglong-products\references\INDEX.md"
```

---

## 🔴 NAS 资料路径（权威兜底来源）

### 主产品目录

```
Y:\1.HOLO机器目录（最终资料存放）\
├── 1.风冷皮带接头机\
├── 2.水冷式接头机 Water Cooling Conveyor Belt Splicing Machine\
├── 3.易洁带碰接机 Food Grade Easy-Clean Belt Splicing Machine\
├── 4.输送带分层机 Conveyor Belt Ply Separator\
├── 5.打齿机\
├── 6.C类打孔机 conveyor belt perforating machine\
├── 7.裁切 切割、环切、分切机\
├── 8.焊接 导条机\
├── 9.封边机\
├── 10.钢扣机\
├── 11.高频焊接机\
├── 12.同步带机器\
├── 13.收放卷料机架\
├── 15.橡胶带硫化机\
├── 16.圆带相关的设备（外购）\
├── 17.特氟龙皮带加工设备（外购）\
├── 18.耗材类\
├── 19.片基带类设备（外购）\
└── 20.非常规的机器日常试机视频\
```

### 企业宣传资料

```
Y:\7.企业介绍宣传视频  企业宣传手册\
├── 企业宣传画册 中文\
├── 企业宣传画册 英文（含进口配件供应商）\
└── 产品册\
```

### 营销宣传资料

```
Y:\3..产品图册.产品单页.折页 产品海报\        # 产品图册/折页/海报
Y:\7.企业介绍宣传视频  企业宣传手册\           # 宣传视频/画册
Y:\14.展会照片视频海报 素材.邀请函 促销海报节日海报\  # 展会物料
```

---

## 📂 读取脚本（双层优先级）

```powershell
# ★ 第一步：先查本地结构化文档（快）
Get-Content "C:\Users\Administrator\.workbuddy\skills\honglong-products\references\tech-specs.md"
Get-Content "C:\Users\Administrator\.workbuddy\skills\honglong-products\references\customers.md"
Get-Content "C:\Users\Administrator\.workbuddy\skills\honglong-products\references\products.md"
Get-Content "C:\Users\Administrator\.workbuddy\skills\honglong-products\references\INDEX.md"

# ★ 查不到时 → 第二步：挂载NAS读原始文件
net use Y: \\192.168.0.194\home /user:HOLO-AGENT Hl88889999

# 查看产品目录
Get-ChildItem "Y:\1.HOLO机器目录（最终资料存放）" -Depth 2

# 读取风冷机资料
Get-ChildItem "Y:\1.HOLO机器目录（最终资料存放）\1.风冷皮带接头机" -Recurse

# 读取特定文件
Get-Content "Y:\1.HOLO机器目录（最终资料存放）\1.风冷皮带接头机\三代风冷皮带接头机.pdf"
```

---

## 📊 产品分类速查

| 产品类别 | NAS目录 | 负责人 |
|---------|---------|--------|
| **风冷接头机** | `1.风冷皮带接头机\` | 吴植材 |
| **水冷接头机** | `2.水冷式接头机\` | 吴植财 |
| **易洁带碰接机** | `3.易洁带碰接机\` | 吴植材 |
| **分层机** | `4.输送带分层机\` | 黄燕平 |
| **打齿机** | `5.打齿机\` | 郑锋 |
| **打孔机** | `6.C类打孔机\` | 赵金仓 |
| **裁切机** | `7.裁切 切割、环切、分切机\` | 郑锋 |
| **导条机** | `8.焊接 导条机\` | 赵金仓/黄燕平 |
| **封边机** | `9.封边机\` | 赵金仓 |
| **硫化机** | `15.橡胶带硫化机\` | 外购 |

---

## 🔍 快速查询

### 查询产品目录结构

```powershell
# 查看所有产品目录
Get-ChildItem "Y:\1.HOLO机器目录（最终资料存放）" | Select-Object Name

# 查看风冷机子目录
Get-ChildItem "Y:\1.HOLO机器目录（最终资料存放）\1.风冷皮带接头机" -Depth 2
```

### 查询产品参数

```powershell
# 查找风冷机参数文件
Get-ChildItem "Y:\1.HOLO机器目录（最终资料存放）\1.风冷皮带接头机" -Recurse -Include "*.xlsx","*.pdf" | Select-Object Name

# 查找水冷机参数文件
Get-ChildItem "Y:\1.HOLO机器目录（最终资料存放）\2.水冷式接头机" -Recurse -Include "*.xlsx","*.pdf" | Select-Object Name
```

### 查询产品图片

```powershell
# 查看产品图片目录
Get-ChildItem "Y:\1.HOLO机器目录（最终资料存放）\1.风冷皮带接头机\图片" -Depth 2 | Select-Object Name

# 查看产品海报
Get-ChildItem "Y:\1.HOLO机器目录（最终资料存放）\1.风冷皮带接头机\海报" | Select-Object Name
```

---

## 🏢 企业信息

| 项目 | 内容 |
|------|------|
| **公司** | 温州红龙工业设备制造有限公司 |
| **品牌** | HOLO（红龙） |
| **地址** | 瑞安市东山街道望新路188号3幢101室 |
| **电话** | 0577-66856856 |
| **销售电话** | 18057753889 |
| **销售邮箱** | sale@18816.cn |
| **WhatsApp** | +86 18057753889 |

---

## 🌐 官网矩阵

| 网站 | 定位 | URL |
|------|------|-----|
| 国内官网 | 全产品线 | www.18816.cn |
| 国际官网 | 输送带接驳设备 | www.beltsplicepress.com |
| 品牌官网 | 工业皮带设备 | www.holobelt.com |
| PU皮带 | PU同步带、传动带 | www.aibelt.com |

---

## 📋 产品导航索引

NAS上有 `产品导航.xlsx` 文件，包含完整的产品分类索引。

---

## 🔗 相关技能

| 技能 | 用途 |
|------|------|
| `nas-file-reader` | 读取NAS文件 |
| `company-research` | 客户背景调查 |
| `cold-email-generator` | 开发信生成 |

---

*本知识库 v3.1 采用双层架构：references/ 结构化文档优先响应，NAS 原始文件兜底保障权威性*
