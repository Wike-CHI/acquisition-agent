---
name: nano-pdf
description: PDF编辑技能。通过自然语言指令编辑PDF文件。当用户说"编辑PDF"、"修改PDF"时使用。
version: 1.0.0
triggers:
  - 编辑PDF
  - PDF编辑
homepage: https://pypi.org/project/nano-pdf/
---

# nano-pdf

> **Skill Graph：** 领域 → [[_index-meta|系统元技能领域]]


Use `nano-pdf` to apply edits to a specific page in a PDF using a natural-language instruction.

## Quick start

```bash
nano-pdf edit deck.pdf 1 "Change the title to 'Q3 Results' and fix the typo in the subtitle"
```

Notes:
- Page numbers are 0-based or 1-based depending on the tool’s version/config; if the result looks off by one, retry with the other.
- Always sanity-check the output PDF before sending it out.
