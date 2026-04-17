---
name: holo-crm-snapshot
description: HOLO CRM每日快照备份 - 读取Pipeline Excel数据，存入ChromaDB+LanceDB。HEARTBEAT第12项专用。
triggers:
  - CRM快照
  - CRM backup
  - HEARTBEAT 12
version: 1.0
---

# HOLO CRM 每日快照备份

HEARTBEAT 第12项：CRM 每日快照备份。从 WorkBuddy Pipeline Excel 读取数据，存储到 ChromaDB + Supermemory(LanceDB)。

## 数据源

从 4 个 Pipeline Excel 读取（路径已校准，见 `holo-pipeline-locator` 技能）：

| 来源 | 文件 | 路径 |
|------|------|------|
| Global Q1 | 红龙全球客户Pipeline-2026Q1.xlsx | `.../20260330165354/` |
| Saudi | 沙特客户Pipeline_4行业.xlsx | `.../20260406084601/` |
| SEA | 东南亚获客Pipeline.xlsx | `.../20260406084602/` |
| Indonesia | 印尼客户数据库.xlsx | `.../20260409114812/` |

## Pipeline Stage 映射规则

| 原始 Status | 映射 Stage |
|-------------|------------|
| `Sent (Apr 6)` / `已WhatsApp触达` | contacted |
| `待发送` / `待开发` / `待获邮箱` / `未开发` / `To Contact` / `沙特福布斯百强` | new |
| `interested` / `意向` | interested |
| `quote` / `报价` | quote_sent |
| `negotiat` / `谈判` | negotiating |
| `nurture` / `培育` | nurture |

## Hot Lead 判断

- `grade` ∈ `['S', 'A', 'A级']` 或 `icp_val >= 80`

## ⚠️ Python 环境问题

**ChromaDB 和 LanceDB 不在 hermes-agent venv 中！**

必须使用系统 Python：
```bash
/usr/bin/python3.13   # ✓ 有 chromadb, lancedb, pyarrow
/root/.hermes/hermes-agent/venv/bin/python3   # ✗ 没有 chromadb
```

## 存储步骤

### 1. ChromaDB

```python
import chromadb, os
chroma_path = '/root/.hermes/chroma_db'
os.makedirs(chroma_path, exist_ok=True)
client = chromadb.PersistentClient(path=chroma_path)
collection = client.get_or_create_collection(
    name='pipeline_snapshots',
    metadata={'description': 'HOLO CRM pipeline daily snapshots'}
)
collection.upsert(
    ids=[f'pipeline_snapshot_{TODAY}'],
    documents=[doc_text],
    metadatas=[{
        'date': TODAY,
        'total_leads': N,
        'new': N, 'contacted': N, 'interested': N,
        'quote_sent': N, 'negotiating': N, 'nurture': N,
        'hot_leads': N, 'new_this_week': N, 'closed_won': N,
    }]
)
```

### 2. Supermemory (LanceDB)

```python
import lancedb, pyarrow as pa, os

db_path = '/root/.hermes/supermemory_db'
os.makedirs(db_path, exist_ok=True)
db = lancedb.connect(db_path)

schema = pa.schema([
    ('date', pa.string()), ('tag', pa.string()),
    ('total_leads', pa.int32()), ('new', pa.int32()),
    ('contacted', pa.int32()), ('interested', pa.int32()),
    ('quote_sent', pa.int32()), ('negotiating', pa.int32()),
    ('nurture', pa.int32()), ('hot_leads', pa.int32()),
    ('new_this_week', pa.int32()), ('closed_won', pa.int32()),
    ('doc', pa.string()),
])

try:
    tbl = db.create_table('pipeline_backup', schema=schema)
except:
    tbl = db.open_table('pipeline_backup')

arrow_table = pa.Table.from_pylist(data, schema=schema)
tbl.add(arrow_table)
```

## 完整执行命令

```bash
/usr/bin/python3.13 << 'EOF'
# 完整脚本见上方代码块
# 读取4个Pipeline → 统计 → 存ChromaDB → 存LanceDB
EOF
```

## 注意事项

- `本周新增`：按 Pipeline 文件 mtime 判断，文件修改日在本周（≥ 2026-04-13）才计入
- `closed_won`：当前 Pipeline 无此状态，始终为 0
- Supermemory server 不需要运行，直接文件级操作 LanceDB 即可

---

_Version 1.0 — 2026-04-17 — 创建：HEARTBEAT第12项执行中发现 chromadb/lancedb 在 venv 不在系统Python_
