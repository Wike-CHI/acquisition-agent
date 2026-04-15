# graphify — 红龙知识图谱技能

> 从红龙产品目录、客户对话、市场调研中构建知识图谱，发现隐藏关联、交叉销售机会和竞争洞察。
> 基于 graphify 库，适配红龙工业皮带设备销售场景。

---

## 触发场景

| 触发 | 说明 |
|------|------|
| 手动："构建产品知识图谱" | 全量构建产品关联图 |
| 手动："分析客户关系" | 从 ChromaDB + CRM 构建客户图谱 |
| 手动："分析竞争格局" | 从 Supermemory 竞品情报构建竞争图 |
| Cron（可选）：每周重建 | lead-discovery 更新后重建图谱 |

---

## 核心概念

```
节点（Node）    — 产品、公司、人、市场
边（Edge）      — 关系：卖给/买自/竞品/同类/替代
社区（Community）— 紧密关联的节点群
神节点（God Node）— 连接数最多的核心产品
```

---

## 图谱类型

### 1. 产品知识图谱

**输入**：`honglong-products` 知识库 + NAS 产品目录

**用途**：
- 找到核心产品（God Nodes）→ 冷启动优先推这些
- 发现非显而易见交叉销售路径 → "买 X 的客户通常也需要 Y"
- 产品家族 → 打包定价机会

**构建**：

```python
import json
from pathlib import Path

# 读取红龙产品知识库
product_files = list(Path("~/.hermes/skills/acquisition/honglong-products/").rglob("*.md"))
# 产品节点：型号、分类、规格、认证、目标市场
# 边关系：同家族 / 同认证 / 同目标市场 / 互补 / 替代

# 输出
- nodes: X 个产品
- edges: Y 条关系
- communities: 产品家族数
- god_nodes: 连接数最多的 5 个产品
```

**销售行动**：

| 图谱发现 | 销售动作 |
|---------|---------|
| God Node = 风冷三代机 | 冷启动优先推这个 |
| 交叉销售：分层机 → 导条机 | 报价时一起推 |
| 社区 = 欧式分层机系列 | 打包定价 |
| 孤岛节点（无连接）| 补充产品关联信息 |

---

### 2. 客户情报图谱

**输入**：
- ChromaDB 对话历史（`chroma:recall`）
- 孚盟MX CRM 数据
- Supermemory 研究资料（`memory:search`）

**用途**：
- 按行为聚类客户 → 针对不同群制定培育策略
- 找桥节点（连接不同行业的客户）→ 推荐来源
- 发现孤立节点（无跟进）→ 激活停滞线索

**构建**：

```python
# 提取关系
companies → employees（决策人）
companies → products（购买/询价过）
companies → companies（同行业/同地区/竞品）
people → people（推荐关系）
deals → products, timelines, objections

# 输出
- 客户总数 / 节点
- 行业分布（社区）
- 活跃客户 / 停滞客户
- 推荐路径
```

**销售行动**：

| 图谱发现 | 销售动作 |
|---------|---------|
| 巴西客户集群 | 批量发葡萄牙语开发信 |
| "桥节点"客户：同时有矿业和物流业务 | 请他推荐 |
| 孤立节点：6个月无跟进 | WhatsApp 激活 |
| 热图：某产品被多个客户询价但未成交 | 分析阻力点 |

---

### 3. 市场研究图谱

**输入**：
- Supermemory 中的竞品情报（`memory:search "Beltwin"`）
- HEARTBEAT 线索发现结果
- 海关数据（特易）

**用途**：
- 竞品 → 产品/价格/市场覆盖
- 市场 → 趋势/法规/展会
- 客户 → 竞品（他们还从谁那里买）

**构建**：

```python
# 提取
competitors → products, pricing, markets
markets → trends, regulations, trade_events
customers → competitors they also buy from
regions → seasonal demand patterns

# 输出
- 竞品覆盖热力图
- 市场优先级（god nodes = 最多客户机会）
- 季节性规律
```

---

## 图查询命令

构建完图谱后，可运行时查询：

```bash
# 广度优先（宽泛上下文）
python3 -m graphify query "巴西 传送带加工" --budget 1500

# 深度优先（追溯关系链）
python3 -m graphify query "Beltwin 客户 巴西" --dfs --budget 1000
```

**使用场景**：

| 场景 | 查询 |
|------|------|
| 客户问产品问题 | 查询产品图谱 |
| 准备报价 | 找交叉销售机会 |
| 冷启动触达 | 从市场图谱了解客户背景 |

---

## 输出格式

### 产品图谱报告

```
产品知识图谱：
- X 个节点 · Y 条边 · Z 个社区

核心产品（God Nodes）：
1. [三代风冷机] — 12 个连接
2. [欧式分层机] — 9 个连接
3. ...

交叉销售机会：
- [分层机] ↔ [导条机] [置信度 0.85]
- [水冷机] ↔ [矿山行业] [置信度 0.72]

知识盲区：
- [某产品] 无认证信息 → 建议补充

建议：更新产品知识库中 [X] 的认证信息
```

### 客户图谱报告

```
客户关系图谱：
- X 个客户节点 · Y 条关系

行业分布：
- 矿业：X 家
- 物流：X 家
- 制造业：X 家

推荐路径：
- Belttech → Transbelt（同一地区，矿业客户）

停滞客户（>90天无跟进）：X 家
建议：批量发送激活消息
```

---

## 重建策略

| 图谱 | 重建频率 | 触发条件 |
|------|---------|---------|
| 产品图谱 | 按需 | honglong-products 更新时 |
| 客户图谱 | 每周 | ChromaDB + CRM 快照 |
| 市场图谱 | 每日 | HEARTBEAT 线索发现输出后 |

---

## 与其他技能的关系

| 技能 | 如何配合 graphify |
|------|-----------------|
| `lead-discovery` | 查询市场图谱后再搜索 → 定位更精准 |
| `quotation-generator` | 查询产品图谱 → 报价时包含关联产品 |
| `chroma-memory` | 输入对话数据 → 构建客户情报图谱 |
| `supermemory` | 输入研究资料 → 构建市场研究图谱 |
| `sdr-humanizer` | 图谱上下文 → 更相关的个性化对话 |
| `HEARTBEAT` | 图谱驱动停滞客户激活推荐 |

---

## 快速测试

```bash
# 测试 graphify 是否可用
python3 -c "import graphify; print('ok')" 2>/dev/null || echo "need install"

# 构建产品图谱
python3 -c "
from pathlib import Path
from graphify.extract import collect_files, extract
from graphify.build import build
products = list(Path('~/.hermes/skills/acquisition/honglong-products/').rglob('*.md'))
print(f'Found {len(products)} product files')
"
```

---

## 输出目录

图谱数据存储在 `~/.hermes/skills/acquisition/graphify-out/`

```
graphify-out/
├── products-graph.json      # 产品图谱数据
├── products-graph.html       # 可视化 HTML（分享给老板）
├── customers-graph.json      # 客户图谱数据
├── market-graph.json        # 市场图谱数据
└── GRAPH_REPORT.md          # 最新图谱报告
```
