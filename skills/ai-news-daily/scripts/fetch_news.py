#!/usr/bin/env python3
"""
AI News Fetcher - 从多个新闻源收集AI相关新闻

使用方法:
    python fetch_news.py [--output output/news_data.json]
"""

import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path
import urllib.request
import urllib.error
import urllib.parse
import re
from html.parser import HTMLParser


class NewsParser(HTMLParser):
    """简单的HTML解析器，提取标题和链接"""
    
    def __init__(self):
        super().__init__()
        self.titles = []
        self.links = []
        self.current_title = ""
        self.in_title = False
        
    def handle_starttag(self, tag, attrs):
        if tag == 'a':
            for attr in attrs:
                if attr[0] == 'href':
                    self.links.append(attr[1])
        elif tag in ['h1', 'h2', 'h3', 'title']:
            self.in_title = True
            self.current_title = ""
    
    def handle_endtag(self, tag):
        if tag in ['h1', 'h2', 'h3', 'title']:
            self.in_title = False
            if self.current_title.strip():
                self.titles.append(self.current_title.strip())
    
    def handle_data(self, data):
        if self.in_title:
            self.current_title += data


def is_chinese(text):
    """判断文本是否主要是中文"""
    chinese_count = 0
    for char in text:
        if '\u4e00' <= char <= '\u9fff':
            chinese_count += 1
    # 如果中文字符占比超过30%，认为是中文
    return chinese_count / len(text) > 0.3 if text else False


def translate_text(text, source_lang='auto', target_lang='zh'):
    """
    翻译文本（使用多个免费API，带降级策略）
    
    Args:
        text: 要翻译的文本
        source_lang: 源语言 (auto=自动检测)
        target_lang: 目标语言 (zh=中文)
    
    Returns:
        翻译后的文本，失败返回原文
    """
    if not text or is_chinese(text):
        return text
    
    # 限制文本长度
    if len(text) > 500:
        text = text[:500]
    
    # 方法1: 尝试使用Google翻译
    try:
        result = translate_google(text, target_lang)
        if result and result != text:
            return result
    except:
        pass
    
    # 方法2: 尝试使用MyMemory翻译
    try:
        result = translate_mymemory(text, target_lang)
        if result and result != text and is_chinese(result):
            return result
    except:
        pass
    
    # 翻译失败，返回原文
    return text


def translate_google(text, target_lang='zh'):
    """使用Google翻译"""
    base_url = "https://translate.googleapis.com/translate_a/single"
    params = {
        'client': 'gtx',
        'sl': 'auto',
        'tl': target_lang,
        'dt': 't',
        'q': text
    }
    
    url = f"{base_url}?{urllib.parse.urlencode(params)}"
    
    headers = {'User-Agent': 'Mozilla/5.0'}
    request = urllib.request.Request(url, headers=headers)
    
    with urllib.request.urlopen(request, timeout=10) as response:
        result = json.loads(response.read().decode('utf-8'))
        
        # 提取翻译结果
        if result and result[0]:
            translated = ''.join([item[0] for item in result[0] if item[0]])
            return translated
    
    return None


def translate_mymemory(text, target_lang='zh'):
    """使用MyMemory API翻译"""
    base_url = "https://api.mymemory.translated.net/get"
    params = {
        'q': text,
        'langpair': f'en|{target_lang}'
    }
    
    url = f"{base_url}?{urllib.parse.urlencode(params)}"
    
    headers = {'User-Agent': 'Mozilla/5.0'}
    request = urllib.request.Request(url, headers=headers)
    
    with urllib.request.urlopen(request, timeout=8) as response:
        data = json.loads(response.read().decode('utf-8'))
        
        if data.get('responseStatus') == 200:
            return data['responseData']['translatedText']
    
    return None


def fetch_url(url, timeout=10):
    """获取URL内容"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    request = urllib.request.Request(url, headers=headers)
    
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return response.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"  [错误] 获取失败: {e}")
        return None


def parse_rss_feed(content, source_name):
    """解析RSS feed，提取新闻项"""
    news_items = []
    
    # 简单的RSS解析
    items = re.findall(r'<item>(.*?)</item>', content, re.DOTALL)
    
    for item in items[:10]:  # 限制每个源最多10条
        title_match = re.search(r'<title><!\[CDATA\[(.*?)\]\]></title>|<title>(.*?)</title>', item)
        link_match = re.search(r'<link>(.*?)</link>', item)
        desc_match = re.search(r'<description><!\[CDATA\[(.*?)\]\]></description>|<description>(.*?)</description>', item)
        date_match = re.search(r'<pubDate>(.*?)</pubDate>', item)
        
        title = ""
        if title_match:
            title = title_match.group(1) if title_match.group(1) else title_match.group(2)
        
        link = link_match.group(1) if link_match else ""
        description = ""
        if desc_match:
            description = desc_match.group(1) if desc_match.group(1) else desc_match.group(2)
        
        pub_date = date_match.group(1) if date_match else ""
        
        if title and link:
            # 翻译标题和摘要
            translated_title = translate_text(title.strip())
            translated_summary = translate_text(description.strip()[:200]) if description else ""
            
            news_items.append({
                "title": translated_title,
                "original_title": title.strip() if translated_title != title.strip() else "",
                "link": link.strip(),
                "summary": translated_summary,
                "source": source_name,
                "published": pub_date.strip(),
                "fetched_at": datetime.now().isoformat()
            })
    
    return news_items


def parse_web_page(content, source_name, url):
    """解析网页，提取新闻项"""
    news_items = []
    
    parser = NewsParser()
    parser.feed(content)
    
    # 配对标题和链接
    min_len = min(len(parser.titles), len(parser.links))
    
    for i in range(min_len):
        title = parser.titles[i]
        link = parser.links[i]
        
        # 过滤非新闻链接
        if not link.startswith('http'):
            continue
        if any(x in link.lower() for x in ['login', 'register', 'subscribe', 'about']):
            continue
        
        # 过滤非新闻标题
        if len(title) < 10 or len(title) > 200:
            continue
        
        # 翻译标题
        translated_title = translate_text(title)
        
        news_items.append({
            "title": translated_title,
            "original_title": title if translated_title != title else "",
            "link": link,
            "summary": "",
            "source": source_name,
            "published": "",
            "fetched_at": datetime.now().isoformat()
        })
    
    return news_items[:10]


def fetch_from_source(source):
    """从单个新闻源获取新闻"""
    name = source['name']
    url = source['url']
    source_type = source.get('type', 'web')
    
    print(f"[获取] 正在获取: {name}")
    
    content = fetch_url(url)
    if not content:
        return []
    
    # 延迟避免请求过快
    time.sleep(1)
    
    if source_type == 'rss':
        return parse_rss_feed(content, name)
    else:
        return parse_web_page(content, name, url)


def filter_ai_news(news_items):
    """过滤AI相关新闻"""
    ai_keywords = [
        'ai', 'artificial intelligence', 'machine learning', 'deep learning',
        'neural network', 'gpt', 'chatgpt', 'claude', 'llm', 'openai',
        '人工智能', '机器学习', '深度学习', '神经网络', '大模型',
        '生成式ai', 'generative ai', 'transformer', 'nlp',
        'computer vision', 'reinforcement learning', '机器人',
        'hugging face', 'stability ai', 'anthropic', 'midjourney'
    ]
    
    filtered = []
    for item in news_items:
        title_lower = item['title'].lower()
        if any(keyword in title_lower for keyword in ai_keywords):
            filtered.append(item)
    
    return filtered


def deduplicate(news_items):
    """去重"""
    seen_titles = set()
    unique_items = []
    
    for item in news_items:
        title_lower = item['title'].lower().strip()
        if title_lower not in seen_titles:
            seen_titles.add(title_lower)
            unique_items.append(item)
    
    return unique_items


def main():
    """主函数"""
    # 新闻源配置
    news_sources = [
        # 国际RSS源
        {"name": "TechCrunch AI", "url": "https://techcrunch.com/feed/", "type": "rss"},
        {"name": "MIT Technology Review", "url": "https://www.technologyreview.com/feed/", "type": "rss"},
        {"name": "VentureBeat AI", "url": "https://venturebeat.com/feed/", "type": "rss"},
        
        # 国内新闻网站
        {"name": "机器之心", "url": "https://www.jiqizhixin.com/", "type": "web"},
        {"name": "量子位", "url": "https://www.qbitai.com/", "type": "web"},
        {"name": "新智元", "url": "https://www.sohu.com/a/", "type": "web"},
    ]
    
    print("=" * 60)
    print("[AI新闻收集器]")
    print("=" * 60)
    print(f"[时间] {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"[新闻源] {len(news_sources)} 个")
    print()
    
    all_news = []
    
    for source in news_sources:
        try:
            items = fetch_from_source(source)
            all_news.extend(items)
            print(f"  [OK] 获取 {len(items)} 条新闻")
        except Exception as e:
            print(f"  [错误] 失败: {e}")
    
    print()
    print("[过滤] 过滤AI相关新闻...")
    ai_news = filter_ai_news(all_news)
    print(f"  找到 {len(ai_news)} 条AI相关新闻")
    
    # 统计翻译情况
    translated_count = sum(1 for item in ai_news if item.get('original_title'))
    if translated_count > 0:
        print(f"  其中 {translated_count} 条已翻译成中文")
    
    print()
    print("[去重] 去重处理...")
    unique_news = deduplicate(ai_news)
    print(f"  去重后 {len(unique_news)} 条新闻")
    
    # 确保输出目录存在
    output_dir = Path(__file__).parent.parent / "output"
    output_dir.mkdir(exist_ok=True)
    
    # 保存到JSON
    output_file = output_dir / "news_data.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(unique_news, f, ensure_ascii=False, indent=2)
    
    print()
    print("=" * 60)
    print(f"[完成] 新闻已保存到: {output_file}")
    print(f"[统计] 总计: {len(unique_news)} 条新闻")
    print("=" * 60)
    
    return unique_news


if __name__ == "__main__":
    main()
