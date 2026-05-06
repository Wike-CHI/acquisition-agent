---
name: pdf-extract
description: PDF文本提取技能。从PDF中提取文本供LLM处理。当用户说"提取PDF"、"读PDF"、"PDF转文字"时使用。
version: 1.0.0
triggers:
  - 提取PDF
  - PDF提取
---

# PDF Extract

Extract text from PDF files for LLM processing. Uses `pdftotext` from the poppler-utils package to convert PDF documents into plain text.

## Commands

```bash
# Extract all text from a PDF
pdf-extract "document.pdf"

# Extract text from specific pages
pdf-extract "document.pdf" --pages 1-5
```

## Install

```bash
sudo dnf install poppler-utils
```
