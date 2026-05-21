---
name: word-docx
slug: word-docx
version: 1.0.0
description: Word文档生成技能。创建、编辑、格式化Word文档(.docx)，支持标题、段落、表格、样式。当用户说"生成Word"、"导出docx"、"保存为Word"、"写报告"、"背调报告"、"开发信保存"时使用。
triggers:
  - Word
  - docx
  - 文档生成
  - 写报告
  - 保存为Word
---

# Word 文档生成技能

> **Skill Graph：** 领域 → [[_index-meta|系统元技能领域]]


赋予 AI 生成专业 Word (.docx) 文档的能力。当需要输出叙事性、段落性内容时优先选择 Word 而非 Excel。

## 何时使用

- 背调报告、市场分析、ICP 分析等长文本报告
- 开发信、商务函件等正式文档
- 提案、方案书、合同草稿
- 任何以段落、标题为主的叙事性内容

## 何时不使用

- 结构化数据（行列、筛选、排序）→ 用 `excel-xlsx` 生成 .xlsx
- 客户清单、报价明细、对比表 → 用 `excel-xlsx`
- 简短文本（不足 1 页）→ 直接在对话中展示

## 格式选择决策

| 内容特征 | 推荐格式 | 原因 |
|---------|---------|------|
| 段落、标题、排版 | .docx | Word 原生支持 |
| 长文本报告 | .docx | 分页、目录、页眉页脚 |
| 开发信/函件 | .docx | 正式、可打印、可签名 |
| 行列数据 | .xlsx | 筛选、排序、公式 |
| 数字计算 | .xlsx | 公式、数据透视 |
| 简短内容 | 对话直接展示 | 无需文件 |

## 快速参考

### 基础文档生成

```python
from docx import Document
from docx.shared import Inches, Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.style import WD_STYLE_TYPE

doc = Document()

# 设置默认字体
style = doc.styles['Normal']
font = style.font
font.name = 'Calibri'
font.size = Pt(11)

# 标题
doc.add_heading('文档标题', level=0)  # level 0 = Title
doc.add_heading('一级标题', level=1)
doc.add_heading('二级标题', level=2)

# 段落
p = doc.add_paragraph('普通段落文本。')
p.alignment = WD_ALIGN_PARAGRAPH.LEFT

# 粗体/斜体
p = doc.add_paragraph()
run = p.add_run('这是粗体文本')
run.bold = True
run = p.add_run(' 这是普通文本')

# 保存
doc.save('output.docx')
```

### 报告模板（背调/分析报告）

```python
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

doc = Document()

# 页边距
for section in doc.sections:
    section.top_margin = Cm(2.5)
    section.bottom_margin = Cm(2.5)
    section.left_margin = Cm(2.5)
    section.right_margin = Cm(2.5)

# 标题页
doc.add_heading('公司背调报告', level=0)
doc.add_paragraph(f'目标公司：{company_name}')
doc.add_paragraph(f'报告日期：{date}')
doc.add_paragraph(f'报告编号：{report_id}')
doc.add_page_break()

# 正文部分
doc.add_heading('一、企业基本信息', level=1)
doc.add_paragraph('...')

doc.add_heading('二、ICP 匹配度评估', level=1)
doc.add_paragraph('...')

# 表格（如需）
table = doc.add_table(rows=3, cols=3, style='Light Grid Accent 1')
table.cell(0, 0).text = '维度'
table.cell(0, 1).text = '匹配结果'
table.cell(0, 2).text = '得分'

doc.save(f'{company_name}_背调报告.docx')
```

### 开发信模板

```python
from docx import Document
from docx.shared import Pt, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH

doc = Document()

# 发件人信息
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
p.add_run('红龙工业设备有限公司\nHonglong Industrial Equipment Co., Ltd.\nEmail: sales@honglong.com')

doc.add_paragraph('')  # 空行

# 日期
doc.add_paragraph('Date: 2026-05-08')

doc.add_paragraph('')

# 收件人
doc.add_paragraph(f'To: {recipient_name}\n{company_name}')

doc.add_paragraph('')

# 称呼
doc.add_paragraph(f'Dear {recipient_name},')

doc.add_paragraph('')

# 正文
doc.add_paragraph('RE: Industrial Belt Splicing Equipment — European Quality at 1/3 the Price\n')

body = doc.add_paragraph(
    'I hope this email finds you well. ...'
)

# 签名
doc.add_paragraph('')
doc.add_paragraph('Best regards,')
doc.add_paragraph('Wike CHI')
doc.add_paragraph('Sales Director')
doc.add_paragraph('Honglong Industrial Equipment Co., Ltd.')

doc.save(f'开发信_{company_name}_{date}.docx')
```

## 常见陷阱

- **中文文件名**：Windows 下保存 .docx 时文件名含中文需确保 Python 脚本用 UTF-8 编码
- **字体回退**：如果文档中包含中文字符，需设置合适的中文字体（如 SimSun, Microsoft YaHei），否则显示为方块
- **表格合并**：合并单元格用 `table.cell(0, 0).merge(table.cell(0, 1))`
- **图片插入**：`doc.add_picture('image.png', width=Inches(3.0))`
- **页眉页脚**：通过 `section.header` / `section.footer` 访问
- **样式继承**：基于 Normal 样式修改会应用到全文

## 中文文档最佳实践

```python
from docx import Document
from docx.shared import Pt, Cm
from docx.oxml.ns import qn

doc = Document()

# 设置中文字体（重要！）
style = doc.styles['Normal']
style.font.name = 'Microsoft YaHei'  # 或 SimSun
style.element.rPr.rFonts.set(qn('w:eastAsia'), 'Microsoft YaHei')
style.font.size = Pt(11)
style.paragraph_format.line_spacing = 1.5  # 1.5 倍行距

# 标题字体
for i in range(1, 4):
    heading_style = doc.styles[f'Heading {i}']
    heading_style.font.name = 'Microsoft YaHei'
    heading_style.element.rPr.rFonts.set(qn('w:eastAsia'), 'Microsoft YaHei')
```

## 安全与隐私

- 所有文件处理在本地完成
- 不向外部发送数据
- 生成的文件默认保存在工作区目录

## 依赖

```bash
pip install python-docx
```

导入方式：`from docx import Document`

验证安装：`python -c "import docx; print(docx.__version__)"`
