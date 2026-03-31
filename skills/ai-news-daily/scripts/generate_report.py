#!/usr/bin/env python3
"""
AI News Report Generator - 生成HTML日报

使用方法:
    python generate_report.py [--date 2026-03-13]
"""

import json
import os
import sys
from pathlib import Path
from datetime import datetime
from string import Template


def load_template(template_path):
    """加载HTML模板"""
    with open(template_path, 'r', encoding='utf-8') as f:
        return f.read()


def generate_news_card(news_item):
    """生成单条新闻卡片HTML"""
    title = news_item.get('title', '')
    original_title = news_item.get('original_title', '')
    link = news_item.get('link', '#')
    summary = news_item.get('summary', '')
    source = news_item.get('source', '未知来源')
    published = news_item.get('published', '')
    
    # 格式化时间
    if published:
        try:
            # 尝试解析各种日期格式
            from email.utils import parsedate_to_datetime
            dt = parsedate_to_datetime(published)
            time_str = dt.strftime('%Y-%m-%d %H:%M')
        except:
            time_str = published[:30] if len(published) > 30 else published
    else:
        time_str = datetime.now().strftime('%Y-%m-%d')
    
    # 如果有原标题（翻译后的新闻），显示原标题
    original_title_html = ""
    if original_title:
        original_title_html = f'<p class="original-title" style="color: #888; font-size: 13px; margin-top: 5px; font-style: italic;">原标题: {original_title}</p>'
    
    html = f"""
    <article class="news-card">
        <h3 class="news-title">
            <a href="{link}" target="_blank" rel="noopener noreferrer">{title}</a>
        </h3>
        {original_title_html}
        <p class="news-summary">{summary}</p>
        <div class="news-meta">
            <div class="news-source">
                <span class="source-badge">{source}</span>
            </div>
            <div class="news-time">
                <span>时间: {time_str}</span>
            </div>
        </div>
    </article>
    """
    
    return html


def generate_html_report(classified_news, template_html, date_str):
    """生成完整的HTML报告"""
    
    # 统计数量
    total_count = sum(len(items) for items in classified_news.values())
    counts = {cat: len(items) for cat, items in classified_news.items()}
    
    # 生成各分类新闻HTML
    sections_html = {}
    for category, items in classified_news.items():
        if items:
            cards = [generate_news_card(item) for item in items]
            sections_html[f"{category}_news"] = '\n'.join(cards)
        else:
            sections_html[f"{category}_news"] = '<p class="no-news">暂无相关新闻</p>'
    
    # 替换模板变量
    html = template_html.replace('{date}', date_str)
    html = html.replace('{total_count}', str(total_count))
    html = html.replace('{industry_count}', str(counts.get('industry', 0)))
    html = html.replace('{tech_count}', str(counts.get('tech', 0)))
    html = html.replace('{product_count}', str(counts.get('product', 0)))
    html = html.replace('{policy_count}', str(counts.get('policy', 0)))
    html = html.replace('{investment_count}', str(counts.get('investment', 0)))
    html = html.replace('{research_count}', str(counts.get('research', 0)))
    
    for key, value in sections_html.items():
        html = html.replace('{' + key + '}', value)
    
    html = html.replace('{generated_time}', datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    
    return html


def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='生成AI新闻HTML日报')
    parser.add_argument('--date', default=None, help='日报日期 (YYYY-MM-DD)')
    args = parser.parse_args()
    
    # 确定日期
    if args.date:
        date_str = args.date
    else:
        date_str = datetime.now().strftime('%Y-%m-%d')
    
    skill_dir = Path(__file__).parent.parent
    
    # 读取分类后的新闻
    input_file = skill_dir / "output" / "classified_news.json"
    
    if not input_file.exists():
        print("[错误] 未找到分类数据文件，请先运行 classify_news.py")
        return
    
    print("=" * 60)
    print("[AI新闻报告生成器]")
    print("=" * 60)
    print(f"[日期] {date_str}")
    print(f"[时间] {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    with open(input_file, 'r', encoding='utf-8') as f:
        classified_news = json.load(f)
    
    # 加载模板
    template_path = skill_dir / "assets" / "template.html"
    css_path = skill_dir / "assets" / "style.css"
    
    if not template_path.exists():
        print(f"[错误] 模板文件不存在: {template_path}")
        return
    
    template_html = load_template(template_path)
    
    # 读取CSS并内联
    if css_path.exists():
        with open(css_path, 'r', encoding='utf-8') as f:
            css_content = f.read()
        # 将CSS内联到HTML中
        template_html = template_html.replace(
            '<link rel="stylesheet" href="style.css">',
            f'<style>\n{css_content}\n</style>'
        )
    
    # 生成HTML
    html_report = generate_html_report(classified_news, template_html, date_str)
    
    # 保存输出
    output_file = skill_dir / "output" / f"ai_news_daily_{date_str}.html"
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html_report)
    
    # 同时保存为 index.html 便于查看
    index_file = skill_dir / "output" / "index.html"
    with open(index_file, 'w', encoding='utf-8') as f:
        f.write(html_report)
    
    print("=" * 60)
    print(f"[完成] HTML日报已生成:")
    print(f"   [文件] {output_file}")
    print(f"   [索引] {index_file}")
    print("=" * 60)
    
    # 返回文件路径以便打开
    return str(output_file)


if __name__ == "__main__":
    main()
