---
name: honglong-products
version: 4.0.0
description: 红龙(HOLO)工业皮带设备产品知识库 — 动态查询 NAS 知识库，始终获取最新产品数据。优先通过 kb_read/kb_search/kb_list Agent 工具实时查询 NAS，本地 references/ 仅作离线兜底缓存。
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

# 红龙产品知识库 v4.0

> **Skill Graph：** 领域 → [[_index-acquisition|核心获客领域]] | 上游 ← [[_index-intelligence|情报领域]] | 下游 → [[knowledge-base|团队知识库]] + [[smart-quote|智能报价]]（产品→报价）+ [[quotation-generator|报价单]]

> **v4.0 架构革新：NAS 实时查询为主，本地缓存仅为离线兜底。产品知识是活的，每次查询都从 NAS 拿最新数据。**

---

## 架构原则

```
┌─────────────────────────────────────────────────────────────┐
│                    产品知识查询流程 (v4.0)                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  用户问产品 → 第一步：kb_search/kb_read 实时查 NAS            │
│                    ↓                                         │
│         ┌─────────────────────────┐                         │
│         │   NAS 知识库可用？       │                         │
│         └─────────────────────────┘                         │
│              ↓ yes              ↓ no                         │
│     kb_search 查产品知识    references/ 本地缓存              │
│     kb_read 读具体条目      离线模式工作                      │
│              ↓                    ↓                          │
│         返回最新数据          返回缓存数据                     │
│         (始终新鲜)            (标注"离线缓存")                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

> **核心转变：NAS 是主数据源，不再是"兜底"。本地 references/ 降级为 NAS 不可用时的离线缓存。**

---

## 查询方式（按优先级排列）

### 方式一：kb_search — 模糊搜索产品（首选）

当用户问产品相关问题但不确定具体条目名时：

```
kb_search(query="风冷机 三代 规格", type="products", limit=5)
kb_search(query="分层机 皮带厚度", type="products", limit=5)
kb_search(query="PA300 参数", type="products", limit=5)
```

### 方式二：kb_read — 读取具体产品条目

当已知产品条目名时：

```
kb_read(type="products", name="风冷接头机-三代")
kb_read(type="products", name="水冷接头机")
kb_read(type="products", name="分层机")
```

### 方式三：kb_list — 浏览产品知识库全貌

```
kb_list(type="products")
```

### 方式四：本地 references/ 离线缓存（仅 NAS 不可用时）

```
Read: skills/honglong-products/references/tech-specs.md
Read: skills/honglong-products/references/products.md
```

> 离线使用时必须在回复中标注"**当前为离线缓存数据，可能与 NAS 最新版本不一致**"

---

## NAS 知识库结构

知识库通过 kb_* 工具访问，底层路径：

```
K:\knowledge\products\          ← kb_read/kb_search 的 products 类型
├── 风冷接头机/
│   ├── 二代.md
│   ├── 三代.md
│   ├── 四代.md
│   └── 规格参数.md
├── 水冷接头机/
├── 分层机/
├── 导条机/
├── 打齿机/
├── 裁切机/
├── 碰接机/
├── 钢扣机/
└── 配套设备/
```

> NAS 连接：`\\192.168.0.98\home\knowledge`（K: 盘），与 holo-desktop Electron 配置一致

---

## 产品目录结构参考（NAS 原始文件）

以下为 NAS 共享盘 `Y:\1.HOLO机器目录（最终资料存放）\` 的目录结构，
用于定位原始产品资料（PDF、图片、视频等非结构化文件）：

```
Y:\1.HOLO机器目录（最终资料存放）\
├── 1.风冷皮带接头机\        ← 主力产品，PA300~PA2100 系列
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

---

## 产品分类速查

| 产品类别 | NAS 知识库条目 | 原始资料目录 | 负责人 |
|---------|---------------|-------------|--------|
| **风冷接头机** | `风冷接头机/` | `1.风冷皮带接头机\` | 吴植材 |
| **水冷接头机** | `水冷接头机/` | `2.水冷式接头机\` | 吴植财 |
| **易洁带碰接机** | `碰接机/` | `3.易洁带碰接机\` | 吴植材 |
| **分层机** | `分层机/` | `4.输送带分层机\` | 黄燕平 |
| **打齿机** | `打齿机/` | `5.打齿机\` | 郑锋 |
| **打孔机** | `配套设备/` | `6.C类打孔机\` | 赵金仓 |
| **裁切机** | `裁切机/` | `7.裁切 切割、环切、分切机\` | 郑锋 |
| **导条机** | `导条机/` | `8.焊接 导条机\` | 赵金仓/黄燕平 |
| **封边机** | `配套设备/` | `9.封边机\` | 赵金仓 |
| **硫化机** | `配套设备/` | `15.橡胶带硫化机\` | 外购 |

---

## 查询示例

### 场景1：客户问风冷机三代参数

```
1. kb_search(query="风冷机 三代", type="products")     ← 先搜索
2. kb_read(type="products", name="风冷接头机-三代")     ← 再读详情
3. 如 NAS 不可用 → Read references/tech-specs.md       ← 离线兜底
```

### 场景2：不确定选风冷还是水冷

```
1. kb_search(query="风冷 水冷 区别 选型", type="products")
2. kb_read(type="products", name="风冷接头机")
3. kb_read(type="products", name="水冷接头机")
4. 对比后给出选型建议
```

### 场景3：了解所有产品线

```
1. kb_list(type="products")                              ← 先看有哪些条目
2. kb_read(type="products", name="分层机")               ← 按需深入
```

### 场景4：查找原始产品资料（图片/PDF）

```
如需要产品实物图、技术图纸、宣传册等非文本资料：
→ 挂载 Y: 盘后浏览对应产品目录
→ 或使用 nas-file-reader 技能读取 PDF/图片
```

---

## 产品索引刷新

NAS 知识库文件变更后，运行索引脚本更新本地缓存：

```powershell
powershell -File "skills\honglong-products\scripts\refresh-product-index.ps1"
```

索引文件 `references/.product-index.json` 记录：
- 扫描时间、文件数量、目录结构
- `lastScanHash` — 用于检测 NAS 是否有变更

---

## 企业信息

| 项目 | 内容 |
|------|------|
| **公司** | 温州红龙工业设备制造有限公司 |
| **品牌** | HOLO（红龙） |
| **地址** | 瑞安市东山街道望新路188号3幢101室 |
| **电话** | 0577-66856856 |
| **销售电话** | 18057753889 |
| **销售邮箱** | sale@18816.cn |
| **WhatsApp** | +86 18057753889 |

## 官网矩阵

| 网站 | 定位 | URL |
|------|------|-----|
| 国内官网 | 全产品线 | www.18816.cn |
| 国际官网 | 输送带接驳设备 | www.beltsplicepress.com |
| 品牌官网 | 工业皮带设备 | www.holobelt.com |
| PU皮带 | PU同步带、传动带 | www.aibelt.com |

---

## 相关技能

| 技能 | 用途 | 数据流 |
|------|------|--------|
| `knowledge-base` | 知识库门卫，统一管理 NAS 读写 | ← 本技能通过 kb_* 工具走 knowledge-base |
| `nas-file-reader` | 读取 NAS 原始文件（PDF/图片） | ← 非结构化资料时使用 |
| `smart-quote` | 智能报价，需要产品规格输入 | → 本技能提供产品参数 |
| `quotation-generator` | PDF 报价单生成 | → 本技能提供 HS CODE、规格 |

---

*本知识库 v4.0 采用动态查询架构：NAS 知识库为主数据源（始终新鲜），本地 references/ 为离线缓存*
