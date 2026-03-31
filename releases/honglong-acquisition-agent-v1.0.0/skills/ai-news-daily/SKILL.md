---
name: ai-news-daily
description: 每日AI新闻日报生成器。用于收集、整理和生成AI领域每日新闻报告，包括行业大事件、技术突破、新产品发布、政策法规动态、投融资新闻和学术研究进展。触发词：AI新闻、人工智能新闻、每日AI日报、AI日报、AI新闻汇总、AI行业动态、人工智能日报、AI资讯、AI每日简报、daily AI news、AI news report。
---

# AI 新闻日报生成器

## 概述

自动化收集全球AI新闻，生成结构化的HTML日报，支持定时执行。

## 核心功能

1. **多源新闻收集** - 从国内外主流科技媒体和AI专业媒体抓取最新资讯
2. **智能分类整理** - 自动按六大类别组织新闻（行业大事件、技术突破、新产品、政策法规、投融资、学术研究）
3. **HTML报告生成** - 输出科技风格的可视化HTML日报，包含原文链接

## 工作流程

### 第一步：新闻收集

使用 `scripts/fetch_news.py` 从多个新闻源收集最新AI新闻：

**新闻来源（国内外混合）**：

**国际来源**：
- TechCrunch AI
- The Verge AI
- MIT Technology Review
- OpenAI Blog
- Google AI Blog
- DeepMind Blog
- Hugging Face Blog
- arXiv AI Papers

**国内来源**：
- 机器之心
- 量子位
- 新智元
- 36氪 AI
- 钛媒体 AI
- InfoQ AI

运行脚本：
```bash
python scripts/fetch_news.py
```

脚本会：
1. 并行访问所有新闻源
2. 提取标题、摘要、链接、发布时间
3. 去重并保存为 JSON 数据文件
4. 输出到 `output/news_data.json`

### 第二步：新闻分类与筛选

使用 `scripts/classify_news.py` 对收集的新闻进行智能分类：

```bash
python scripts/classify_news.py
```

分类规则：
- **行业大事件** - 大公司战略调整、重大合作、行业会议
- **技术突破** - 新算法、新模型、技术里程碑
- **新产品发布** - AI产品、工具、平台更新
- **政策法规** - AI监管政策、法律动态、政府报告
- **投融资新闻** - 融资、并购、IPO
- **学术研究** - 论文、开源项目、研究成果

输出：`output/classified_news.json`

### 第三步：生成HTML日报

使用 `scripts/generate_report.py` 生成科技风格的HTML日报：

```bash
python scripts/generate_report.py --date 2026-03-13
```

HTML特性：
- 深色科技主题设计
- 响应式布局
- 分类标签导航
- 原文链接跳转
- 日期自动生成
- 统计概览

输出：`output/ai_news_daily_YYYY-MM-DD.html`

## 快速开始

### 完整流程（推荐）

一次性执行所有步骤：

```bash
python scripts/run_daily.py
```

此脚本会：
1. 收集新闻
2. 分类整理
3. 生成HTML日报
4. 打开浏览器预览

### 单独执行步骤

```bash
# 仅收集新闻
python scripts/fetch_news.py

# 仅分类
python scripts/classify_news.py

# 仅生成报告
python scripts/generate_report.py
```

## 配置自动化

配合 WorkBuddy 的自动化功能，设置每日定时执行：

使用 `automation_update` 工具创建每日自动化任务：

```
name: "AI新闻日报"
prompt: "使用 ai-news-daily skill 生成今天的AI新闻日报"
rrule: "FREQ=DAILY;BYHOUR=8;BYMINUTE=0"  # 每天早上8点执行
status: "ACTIVE"
```

## 新闻源配置

新闻源列表在 `references/news_sources.json` 中定义，可自定义添加或删除：

```json
{
  "international": [
    {
      "name": "TechCrunch AI",
      "url": "https://techcrunch.com/category/artificial-intelligence/",
      "type": "rss"
    }
  ],
  "domestic": [
    {
      "name": "机器之心",
      "url": "https://www.jiqizhixin.com/",
      "type": "web"
    }
  ]
}
```

## 输出示例

生成的HTML日报包含：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <title>AI 新闻日报 - 2026-03-13</title>
  <!-- 科技风格样式 -->
</head>
<body>
  <header>统计概览：共收集 42 条新闻</header>
  
  <nav>分类导航标签</nav>
  
  <main>
    <section id="industry">
      <h2>行业大事件</h2>
      <article>
        <h3><a href="...">新闻标题</a></h3>
        <p>新闻摘要</p>
        <footer>来源 | 时间</footer>
      </article>
    </section>
    
    <!-- 其他分类 -->
  </main>
</body>
</html>
```

## 资源文件说明

### scripts/ 

包含所有Python脚本：
- `fetch_news.py` - 新闻收集
- `classify_news.py` - 新闻分类
- `generate_report.py` - 生成HTML
- `run_daily.py` - 完整流程脚本

### references/

- `news_sources.json` - 新闻源配置
- `classification_rules.json` - 分类关键词规则

### assets/

- `style.css` - HTML日报样式模板
- `template.html` - HTML日报模板

## 注意事项

1. **API限制** - 部分新闻源可能有访问频率限制，脚本已内置延迟
2. **网络环境** - 国际新闻源可能需要稳定网络
3. **数据存储** - 历史日报保存在 `output/history/` 目录
4. **自定义源** - 可编辑 `references/news_sources.json` 添加自定义新闻源

## 常见问题

**Q: 某些新闻源无法访问怎么办？**
A: 脚本会自动跳过失败的源，继续从其他源收集。检查网络或更新源配置。

**Q: 如何添加新的新闻源？**
A: 编辑 `references/news_sources.json`，添加源名称、URL和类型。

**Q: 日报可以定制样式吗？**
A: 可以修改 `assets/style.css` 自定义样式。

**Q: 支持其他语言吗？**
A: 当前主要支持中文和英文新闻源，可扩展其他语言。
