#!/usr/bin/env python3
"""
AI News Classifier - 对新闻进行分类

使用方法:
    python classify_news.py [--input output/news_data.json] [--output output/classified_news.json]
"""

import json
import re
from pathlib import Path
from datetime import datetime


# 分类关键词规则
CLASSIFICATION_RULES = {
    "industry": {
        "name": "行业大事件",
        "keywords": [
            "合作", "partnership", "战略合作", "合并", "merger", "acquisition",
            "收购", "并购", "ipo", "上市", "高管", "ceo", "cto", "裁员",
            "layoff", "招聘", "大会", "conference", "峰会", "峰会",
            "google", "微软", "microsoft", "百度", "阿里巴巴", "腾讯", "字节跳动",
            "华为", "anthropic", "stability ai", "midjourney", "hugging face",
            "战略", "布局", "生态", "平台化"
        ]
    },
    "tech": {
        "name": "技术突破",
        "keywords": [
            "突破", "breakthrough", "sota", "state-of-the-art", "新算法",
            "algorithm", "新模型", "model", "架构", "architecture",
            "性能", "performance", "benchmark", "基准", "精度", "accuracy",
            "gpt-4", "gpt-5", "llama", "gemini", "claude", "mistral",
            "transformer", "attention", "diffusion", "gan", "vae",
            "训练", "training", "推理", "inference", "优化", "optimization",
            "量子", "quantum", "芯片", "chip", "gpu", "tpu", "npu",
            "技术", "研究", "research", "论文", "paper"
        ]
    },
    "product": {
        "name": "新产品发布",
        "keywords": [
            "发布", "launch", "推出", "release", "新品", "产品",
            "product", "工具", "tool", "平台", "platform", "api",
            "chatgpt", "copilot", "assistant", "助手", "机器人", "bot",
            "应用", "app", "软件", "software", "服务", "service",
            "功能", "feature", "更新", "update", "升级", "upgrade",
            "开源", "open source", "免费", "free"
        ]
    },
    "policy": {
        "name": "政策法规",
        "keywords": [
            "政策", "policy", "法规", "regulation", "法律", "law",
            "监管", "regulate", "合规", "compliance", "伦理", "ethics",
            "安全", "safety", "隐私", "privacy", "数据保护", "data protection",
            "政府", "government", "国会", "congress", "欧盟", "eu",
            "人工智能法案", "ai act", "监管框架", "framework",
            "禁止", "ban", "限制", "restriction", "审查", "censorship"
        ]
    },
    "investment": {
        "name": "投融资",
        "keywords": [
            "融资", "funding", "投资", "investment", "融资轮", "round",
            "a轮", "b轮", "c轮", "series a", "series b", "series c",
            "估值", "valuation", "独角兽", "unicorn",
            "风投", "vc", "venture capital", "投资人", "investor",
            "募资", "raise", "注资", "inject", "ipo", "上市",
            "并购", "m&a", "收购", "acquire", "亿美元", "million", "billion"
        ]
    },
    "research": {
        "name": "学术研究",
        "keywords": [
            "论文", "paper", "arxiv", "研究", "research", "实验室", "lab",
            "大学", "university", "学院", "institute", "学者", "researcher",
            "教授", "professor", "博士", "phd", "学术", "academic",
            "发表", "publish", "期刊", "journal", "会议", "conference",
            "neurips", "icml", "iclr", "cvpr", "acl", "emnlp",
            "开源", "open source", "github", "代码", "code", "数据集", "dataset",
            "实验", "experiment", "验证", "validate"
        ]
    }
}


def classify_news(news_item):
    """对单条新闻进行分类"""
    title = news_item.get('title', '').lower()
    summary = news_item.get('summary', '').lower()
    text = title + " " + summary
    
    scores = {}
    
    for category, config in CLASSIFICATION_RULES.items():
        score = 0
        keywords = config['keywords']
        
        for keyword in keywords:
            if keyword.lower() in text:
                score += 1
        
        scores[category] = score
    
    # 找到最高分的分类
    if max(scores.values()) > 0:
        best_category = max(scores, key=scores.get)
    else:
        # 默认分类为行业新闻
        best_category = "industry"
    
    return best_category


def classify_all_news(news_data):
    """对所有新闻进行分类"""
    classified = {
        "industry": [],
        "tech": [],
        "product": [],
        "policy": [],
        "investment": [],
        "research": []
    }
    
    for item in news_data:
        category = classify_news(item)
        item['category'] = category
        classified[category].append(item)
    
    return classified


def main():
    """主函数"""
    # 读取新闻数据
    input_file = Path(__file__).parent.parent / "output" / "news_data.json"
    
    if not input_file.exists():
        print("[错误] 未找到新闻数据文件，请先运行 fetch_news.py")
        return
    
    print("=" * 60)
    print("[AI新闻分类器]")
    print("=" * 60)
    print(f"[时间] {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    with open(input_file, 'r', encoding='utf-8') as f:
        news_data = json.load(f)
    
    print(f"[加载] {len(news_data)} 条新闻")
    print()
    
    # 分类
    classified = classify_all_news(news_data)
    
    # 显示统计
    print("[统计] 分类统计:")
    for category, items in classified.items():
        name = CLASSIFICATION_RULES[category]['name']
        print(f"  - {name}: {len(items)} 条")
    print()
    
    # 保存结果
    output_file = Path(__file__).parent.parent / "output" / "classified_news.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(classified, f, ensure_ascii=False, indent=2)
    
    print("=" * 60)
    print(f"[完成] 分类结果已保存到: {output_file}")
    print("=" * 60)


if __name__ == "__main__":
    main()
