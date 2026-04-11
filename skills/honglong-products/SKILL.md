---
name: honglong-products
version: 2.2.0
description: 红龙(HOLO)工业皮带设备产品知识库，涵盖风冷机、水冷机、分层机、导条机、打齿机、裁切机等全系列产品。当用户询问：(1) 产品型号、规格、编码规则 (2) 技术参数、BOM、材料规格 (3) 供应链、供应商信息 (4) 产品报价、定制选项 (5) 设备选型建议 (6) 出厂检验标准、质检规范 (7) 官网产品信息 (8) 产品图片 (9) 产品用途、应用场景、输送带知识 时使用此技能。
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
  # 应用场景
  - 用途
  - 应用场景
  - 怎么用
  - 用在哪
  - 适用场景
  # 输送带知识
  - 输送带
  - 皮带
  - 硫化
  - 拼接
  - 接头
  - 打齿
  - 分层
  # 选型相关
  - 风冷还是水冷
  - 选哪个
  - 推荐哪款
  - 有什么区别
  - 厚度
  - 规格怎么选
---

# 红龙产品知识库

温州红龙工业设备制造有限公司产品知识体系，用于AI辅助产品咨询、技术支持、报价等场景。

---

## 🔴 知识库门卫（强制前置检查）

> ⚠️ **产品相关查询必须先查知识库！**

### 前置检查流程

```
用户询问："风冷机三代有什么规格？"
         ↓
执行查询：read-knowledge -Type products -Name "风冷机三代"
         ↓
┌─ 存在 → 返回产品规格上下文
│         告知："已在产品知识库找到相关信息"
│
└─ 不存在 → 使用honglong-products技能获取产品信息
            → 完成后保存到products/目录
```

### 知识库产品分类

| 产品类型 | 知识库名称 |
|---------|-----------|
| 风冷接头机 | `风冷接头机`、`风冷机`、`风冷` |
| 水冷接头机 | `水冷接头机`、`水冷机`、`水冷` |
| 分层机 | `分层机`、`750分层机` |
| 导条机 | `导条机`、`XDT1300`、`XDT2000` |
| 配套设备 | `打齿机`、`裁切机`、`碰接机` |

### 调用脚本

```powershell
# 查询产品知识
. "C:\Users\Administrator\.workbuddy\skills\knowledge-base\scripts\read-knowledge.ps1" -Type products -Name "{产品名}"

# 保存产品知识（调研完成后）
. "C:\Users\Administrator\.workbuddy\skills\knowledge-base\scripts\write-knowledge.ps1" -Type products -Name "{产品名}" -Content $content
```

---

## 核心能力

1. **产品识别** - 根据编码识别产品型号、规格、配置
2. **参数查询** - 查找技术参数、材料规格、电器件
3. **供应链查询** - 供应商信息、采购渠道
4. **报价支持** - BOM成本参考、定制费用
5. **质检支持** - 出厂检验标准、合格判定
6. **应用咨询** - 产品用途、应用场景、选型建议、客户痛点

## 知识库结构

| 文件 | 内容 |
|------|------|
| [references/products.md](references/products.md) | 全产品线型号、规格、编码规则 |
| [references/tech-specs.md](references/tech-specs.md) | 技术参数、材料规格、BOM |
| [references/applications.md](references/applications.md) | 产品应用场景、输送带知识、选型指南 |
| [references/INDEX.md](references/INDEX.md) | **NEW** 快速参考索引（30秒找到答案） |
| [references/customers.md](references/customers.md) | 供应链、供应商、客户案例 |
| [references/inspection-standards.md](references/inspection-standards.md) | 17个产品检验标准（出厂质检规范） |
| [references/websites.md](references/websites.md) | 官网产品信息、品牌定位 |
| [references/images.md](references/images.md) | 产品图片索引、3D模型库 |
| [images/](images/) | 本地产品图片（50张代表性图片） |
| [images/index.json](images/index.json) | 图片索引文件 |

## 产品图片与视频

### 图片资源
| 产品 | 本地图片 | NAS原图 |
|------|----------|---------|
| 风冷机 | 5 | 1659 |
| 水冷机 | 1 | 755 |
| 分层机 | 10 | 372 |
| 打齿机 | 10 | 838 |
| 裁切机 | 10 | 1322 |
| 导条机 | 10 | 1382 |
| **总计** | **50** | **6328** |

### 视频资源
| 产品 | 视频数 | 大小 |
|------|--------|------|
| C类打孔机 | 250 | 52.9GB |
| 风冷机 | 242 | 67.4GB |
| 打齿机 | 210 | 60.4GB |
| 焊接导条机 | 164 | 27.1GB |
| 客户现场 | 159 | 0.7GB |
| **总计** | **1542** | **327GB** |

**详细索引：**
- 图片：[images/index.json](images/index.json)
- 视频：[videos/index.json](videos/index.json)
- 视频说明：[references/videos.md](references/videos.md)

## 编码规则速查

**格式：** `A1DCJ1000-00-00`

| 位置 | 含义 |
|------|------|
| 第1位字母 | 款式 (A-Z) |
| 第2位数字 | 迭代 (1-9) |
| 第3-5位 | 机型代码 |
| 第4位数字 | 规格 |
| 后缀 | 定制选项 |

**机型代码：**
- FLJ = 风冷机
- SLJ = 水冷机
- DCJ = 打齿机
- CQJ = 裁切机
- XDT = 导条机
- FCJ = 分层机

**常用后缀：**
- `C` = 单相220V
- `AD` = 单相220V/60Hz（出口）
- `D1/D2/D3/D4` = 定制版本

## 使用方式

1. 用户提产品相关问题 → 自动触发
2. 根据问题类型读取对应 references 文件
3. 提取相关信息回答用户

## 企业信息

- **公司：** 温州红龙工业设备制造有限公司
- **品牌：** HOLO（红龙）
- **地址：** 瑞安市东山街道望新路188号3幢101室
- **税号：** 91330381MA2855GF3G
- **电话：** 0577-66856856
- **销售电话：** 18057753889
- **销售邮箱：** sale@18816.cn

## 官网矩阵

| 网站 | 定位 | 主要内容 |
|------|------|----------|
| [www.18816.cn](http://www.18816.cn) | 国内官网 | 全产品线、联系方式 |
| [www.beltsplicepress.com](https://www.beltsplicepress.com) | 国际官网 | 输送带接驳设备、拼接机 |
| [www.holobelt.com](https://www.holobelt.com) | 品牌官网 | 工业皮带设备制造商 |
| [www.aibelt.com](https://www.aibelt.com) | PU皮带 | PU同步带、传动带 |
