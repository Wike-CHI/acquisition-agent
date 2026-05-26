---
name: excel-xlsx
slug: excel-xlsx
version: 1.0.1
homepage: https://clawic.com/skills/excel-xlsx
description: Use when 需要读取/写入/生成Excel文件（含类型检测+日期格式化）时。路由：Excel处理走此技能（内置类型检测+日期格式化+跨平台兼容），不要直接调 office_* 或 generate_file 生成Excel
changelog: Added Core Rules and modern skill structure
triggers:
  - Excel
  - xlsx
  - 电子表格
---

## Setup

On first use, read `setup.md` for integration guidelines. Ask user preferences naturally during conversation.

## holo-desktop 执行方式

**本环境已安装 openpyxl 和 xlsxwriter。生成 Excel 文件的方法：**

使用 `shell` 工具执行 Python 脚本，用 openpyxl 创建 .xlsx 文件。示例：

```python
python -c "
import json, sys
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment

wb = Workbook()
ws = wb.active
ws.title = '客户清单'

# Header
headers = ['公司名', '国家', 'LinkedIn', '决策人', '职位', '邮箱']
for col, h in enumerate(headers, 1):
    cell = ws.cell(row=1, column=col, value=h)
    cell.font = Font(bold=True, color='FFFFFF')
    cell.fill = PatternFill(start_color='1F4E79', fill_type='solid')

# Data rows (从 JSON 文件读取或内联)
data = json.load(open('reports/input.json'))
for i, row in enumerate(data, 2):
    ws.cell(row=i, column=1, value=row['company'])
    # ... more columns

wb.save('reports/output.xlsx')
print('Saved: reports/output.xlsx')
"
```

**关键点：**
- 先用 `write_file` 把数据写成 JSON → 再用 `shell` + Python 把 JSON 转成 .xlsx
- 表头加粗、背景色、自动筛选 (`ws.auto_filter.ref`)
- 数字列右对齐、文本列左对齐
- 完成后告知用户 .xlsx 文件路径

## When to Use

User needs to read, write, or generate Excel files (.xlsx, .xls, .xlsm) for **tabular/structured data**. Agent handles type coercion, date serialization, formula evaluation, and cross-platform quirks.

### ✅ 使用 Excel（必须生成 .xlsx 文件）
- **客户清单** — 必须 Excel，禁止 JSON/CSV/Markdown
- **报价明细、对比表**
- **数字计算、筛选、排序、数据透视**
- **Pipeline 数据、数据库导出**
- **行列结构的结构化数据**

### ❌ 不使用 Excel
- 叙事文本、段落、标题为主的报告 → 用 `word-docx` 生成 .docx
- 背调报告、市场分析、ICP 分析 → 用 `word-docx`
- 开发信、商务函件 → 用 `word-docx` 或对话中展示
- 简短文本（不足 1 页）→ 直接在对话中展示

## Architecture

Memory lives in `~/excel-xlsx/`. See `memory-template.md` for structure.

```
~/excel-xlsx/
└── memory.md     # Preferences, tools, pain points
```

## Quick Reference

| Topic | File |
|-------|------|
| Setup | `setup.md` |
| Memory template | `memory-template.md` |

## Core Rules

### 1. Dates Are Serial Numbers
Excel stores dates as days since 1900-01-01 (Windows) or 1904-01-01 (Mac legacy). Check workbook date system before converting. Time is fractional: 0.5 = noon, 0.25 = 6 AM.

### 2. The 1900 Leap Year Bug
Excel incorrectly treats 1900 as a leap year. Serial 60 represents Feb 29, 1900 (invalid date). Account for this when calculating dates before March 1, 1900.

### 3. 15-Digit Precision Limit
Numbers beyond 15 digits silently truncate. Use TEXT format for: phone numbers, IDs, credit cards, any long numeric identifiers. Leading zeros also require TEXT.

### 4. Formulas vs Cached Values
Cells may contain both formula and cached result. Some readers return formula string, others return cached value. Force recalculation if cached values might be stale.

### 5. Merged Cells Are Traps
Only the top-left cell of a merged range holds the value. Reading other cells in the merge returns empty. Hidden rows/columns still contain data.

### 6. Cross-Platform Testing Required
Windows vs Mac Excel can differ in date system. LibreOffice/Google Sheets may not support all features. Always test roundtrip compatibility when generating files for unknown consumers.

### 7. Use Streaming for Large Files
Loading large files fully into RAM causes memory issues. Use streaming readers (row-by-row) for files with 100K+ rows. Empty rows at end may be padded by some writers.

## Common Traps

- **Type inference on read** → Numbers stored as text stay text; explicit conversion needed
- **Column index confusion** → A=0 or A=1 varies by library; always verify convention
- **Newlines in cells** → `\n` works but cell needs "wrap text" format to display
- **External references** → `[Book.xlsx]Sheet!A1` breaks when source file moves
- **Password protection** → Trivial to break; not real security; encrypt file externally if needed
- **XLSM files** → Contain macros (security risk); XLSB is binary (faster but less compatible)
- **Shared strings** → Large files reuse text indices; libraries handle this, but be aware

## Format Limits

| Format | Rows | Columns | Notes |
|--------|------|---------|-------|
| XLSX | 1,048,576 | 16,384 (XFD) | Modern default |
| XLS | 65,536 | 256 | Legacy, avoid |
| CSV | Unlimited | Unlimited | No formatting |

## Security & Privacy

**Data that stays local:**
- All file processing happens locally
- User preferences stored in `~/excel-xlsx/memory.md` with consent
- No external services called

**This skill does NOT:**
- Send data to external endpoints
- Require network access

## Related Skills
Install with `clawhub install <slug>` if user confirms:
- `csv` — CSV parsing and generation
- `data` — Data processing patterns
- `data-analysis` — Analysis workflows

## Feedback

- If useful: `clawhub star excel-xlsx`
- Stay updated: `clawhub sync`
