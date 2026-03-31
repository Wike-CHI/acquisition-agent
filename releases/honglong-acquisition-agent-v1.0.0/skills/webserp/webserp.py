#!/usr/bin/env python3
"""
WebSerp - 网页搜索工具
"""

import os
import json
import urllib.request
import urllib.parse
from typing import List, Dict, Optional


class WebSerpSearch:
    """网页搜索工具"""
    
    def __init__(self):
        self.api_key = os.getenv('BRAVE_API_KEY', '')
        self.base_url = "https://api.search.brave.com/res/v1/web/search"
    
    def search(
        self,
        query: str,
        count: int = 5,
        country: str = "US",
        language: str = "en"
    ) -> List[Dict]:
        """
        搜索网页
        
        Args:
            query: 搜索查询
            count: 返回结果数量
            country: 国家代码
            language: 语言代码
        
        Returns:
            搜索结果列表
        """
        if not self.api_key:
            return self._fallback_search(query, count)
        
        try:
            # 构建请求
            params = {
                "q": query,
                "count": count,
                "country": country,
                "search_lang": language
            }
            
            url = f"{self.base_url}?{urllib.parse.urlencode(params)}"
            
            req = urllib.request.Request(url)
            req.add_header("Accept", "application/json")
            req.add_header("Accept-Encoding", "gzip")
            req.add_header("X-Subscription-Token", self.api_key)
            
            with urllib.request.urlopen(req, timeout=10) as response:
                data = json.loads(response.read().decode())
            
            # 解析结果
            results = []
            for item in data.get("web", {}).get("results", [])[:count]:
                results.append({
                    "title": item.get("title", ""),
                    "url": item.get("url", ""),
                    "description": item.get("description", ""),
                })
            
            return results
            
        except Exception as e:
            print(f"Search API error: {e}")
            return self._fallback_search(query, count)
    
    def _fallback_search(self, query: str, count: int) -> List[Dict]:
        """备用搜索（ DuckDuckGo HTML 抓取）"""
        # 简化实现，实际可以使用其他搜索 API
        return [
            {
                "title": f"搜索结果: {query}",
                "url": "https://duckduckgo.com/?q=" + urllib.parse.quote(query),
                "description": f"请配置 BRAVE_API_KEY 以使用完整搜索功能"
            }
        ]


def web_search(query: str, count: int = 5, language: str = "zh") -> List[Dict]:
    """
    搜索网页
    
    Args:
        query: 搜索查询
        count: 返回结果数量
        language: 语言代码
    
    Returns:
        搜索结果列表
    """
    searcher = WebSerpSearch()
    country = "CN" if language == "zh" else "US"
    return searcher.search(query, count, country, language)


def format_search_results(results: List[Dict]) -> str:
    """格式化搜索结果"""
    if not results:
        return "未找到相关结果"
    
    output = []
    for i, result in enumerate(results, 1):
        output.append(f"{i}. **{result['title']}**")
        output.append(f"   URL: {result['url']}")
        output.append(f"   {result['description']}")
        output.append("")
    
    return "\n".join(output)


if __name__ == "__main__":
    # 测试
    results = web_search("GLM-5 智谱AI", count=3)
    print(format_search_results(results))
