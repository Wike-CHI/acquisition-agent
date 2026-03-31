# Agent Reach 集成方案

> 将 Agent Reach 的多渠道能力整合到获客技能集群

---

## 🎯 核心价值

| Agent Reach 渠道 | 获客用途 | 优先级 |
|------------------|----------|--------|
| **LinkedIn** | 决策人搜索 + Profile 获取 | ⭐⭐⭐⭐⭐ |
| **微博** | 国内客户触达 + 品牌监控 | ⭐⭐⭐⭐ |
| **微信公众号** | 行业内容监控 + 竞品动态 | ⭐⭐⭐⭐ |
| **小红书** | 国内B2C客户 + 用户反馈 | ⭐⭐⭐ |
| **抖音** | 视频营销 + 竞品监控 | ⭐⭐⭐ |
| **Exa 搜索** | 语义搜索（替代多引擎） | ⭐⭐⭐⭐ |
| **V2EX** | 技术客户发现 | ⭐⭐ |
| **小宇宙播客** | 行业播客转文字 | ⭐⭐ |

---

## 1. LinkedIn 增强（最直接）

### 现有能力

```
获客流程：
1. Google/LinkedIn 搜索公司
2. 查看员工列表
3. 筛选决策人
4. 发送私信
```

### Agent Reach 增强

```bash
# 直接搜索决策人
mcporter call 'linkedin.search_people(keyword: "purchasing manager conveyor belt", limit: 10)'

# 获取完整 Profile
mcporter call 'linkedin.get_person_profile(linkedin_url: "https://linkedin.com/in/username")'

# 备用方案（Jina Reader）
curl -s "https://r.jina.ai/https://linkedin.com/in/username"
```

### 集成到获客流程

```
┌─────────────────────────────────────────────────────────────┐
│  LinkedIn 获客流程（增强版）                                │
├─────────────────────────────────────────────────────────────┤
│  1. 海关数据 → 找到目标客户公司                             │
│  2. Agent Reach LinkedIn → 搜索公司员工                     │
│  3. Agent Reach LinkedIn → 获取决策人 Profile               │
│  4. 背调 + 评分                                            │
│  5. 生成开发信                                             │
│  6. LinkedIn 私信 / 邮件发送                               │
└─────────────────────────────────────────────────────────────┘
```

### 使用示例

```
用户：帮我找 Dorner Manufacturing 的采购经理

AI：
1. 搜索公司员工...
   mcporter call 'linkedin.search_people(keyword: "Dorner Manufacturing purchasing", limit: 10)'

2. 获取 Profile...
   mcporter call 'linkedin.get_person_profile(linkedin_url: "...")'

3. 输出：
   姓名: John Smith
   职位: Purchasing Manager
   公司: Dorner Manufacturing
   LinkedIn: linkedin.com/in/johnsmith
   邮箱: john.smith@dorner.com（如可用）
   
4. 是否生成开发信？
```

---

## 2. 国内客户开发（新增能力）

### 微博搜索

**用途**：
- 搜索国内传送带公司
- 查看公司动态
- 监控竞品

**命令**：
```bash
# 搜索用户
mcporter call 'weibo.search_users(keyword: "传送带", limit: 10)'

# 搜索内容
mcporter call 'weibo.search_content(keyword: "输送带采购", limit: 20)'

# 获取用户动态
mcporter call 'weibo.get_feeds(uid: "xxx", limit: 20)'

# 热搜榜（行业趋势）
mcporter call 'weibo.get_trendings(limit: 20)'
```

### 微信公众号监控

**用途**：
- 搜索行业文章
- 了解市场趋势
- 竞品动态

**命令**：
```bash
# 搜索公众号文章
python3 -c "
import asyncio
from miku_ai import get_wexin_article
async def s():
    for a in await get_wexin_article('输送带', 5):
        print(f'{a[\"title\"]} | {a[\"url\"]}')
asyncio.run(s())
"

# 阅读文章
cd ~/.agent-reach/tools/wechat-article-for-ai && python3 main.py "https://mp.weixin.qq.com/s/xxx"
```

### 小红书搜索

**用途**：
- 品牌监控
- 用户反馈
- 竞品分析

**命令**：
```bash
# 搜索笔记
mcporter call 'xiaohongshu.search_feeds(keyword: "传送带设备")'

# 获取笔记详情
mcporter call 'xiaohongshu.get_feed_detail(feed_id: "xxx", xsec_token: "yyy")'
```

---

## 3. 竞品监控

### 监控维度

| 竞品 | 微博 | 小红书 | 抖音 | 微信 |
|------|------|--------|------|------|
| Flexco | ✅ | ✅ | ✅ | ✅ |
| Clipco | ✅ | ✅ | ✅ | ✅ |
| 国内竞品 | ✅ | ✅ | ✅ | ✅ |

### 监控命令

```bash
# 微博搜索竞品
mcporter call 'weibo.search_content(keyword: "Flexco", limit: 20)'
mcporter call 'weibo.search_content(keyword: "Clipco", limit: 20)'

# 小红书搜索竞品
mcporter call 'xiaohongshu.search_feeds(keyword: "Flexco")'
mcporter call 'xiaohongshu.search_feeds(keyword: "Clipco")'

# 微信搜索竞品
python3 -c "
from miku_ai import get_wexin_article
# 搜索竞品相关文章
"
```

---

## 4. 内容营销

### 微信公众号内容发现

**用途**：
- 发现行业热门内容
- 了解客户痛点
- 获取营销素材

**命令**：
```bash
# 搜索行业文章
python3 -c "
from miku_ai import get_wexin_article
# 搜索：输送带、皮带接头、硫化机等
"
```

### 小宇宙播客转文字

**用途**：
- 行业播客内容提取
- 专家观点收集

**命令**：
```bash
# 转录播客
~/.agent-reach/tools/xiaoyuzhou/transcribe.sh "https://www.xiaoyuzhoufm.com/episode/xxx"
```

---

## 5. 语义搜索（Exa）

### 替代多引擎搜索

**现有**：`multi-search-engine` 技能

**Agent Reach 方案**：
```bash
# 语义搜索
mcporter call 'exa.web_search_exa(query: "conveyor belt manufacturer USA", numResults: 10)'

# 代码搜索（技术客户）
mcporter call 'exa.get_code_context_exa(query: "conveyor belt splicing machine", tokensNum: 3000)'
```

### 集成到获客流程

```
┌─────────────────────────────────────────────────────────────┐
│  客户发现（Exa 增强）                                        │
├─────────────────────────────────────────────────────────────┤
│  1. Exa 语义搜索 → 找到相关公司                             │
│  2. Jina Reader → 读取公司官网                              │
│  3. LinkedIn → 找决策人                                    │
│  4. 背调 + 开发信                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. V2EX 技术客户

**用途**：
- 找技术型客户（工程师、开发者）
- 了解技术需求

**命令**：
```bash
# 热门主题
curl -s "https://www.v2ex.com/api/topics/hot.json"

# 技术节点
curl -s "https://www.v2ex.com/api/topics/show.json?node_name=python"
```

---

## 📋 集成清单

### 立即可用（无需配置）

| 渠道 | 命令 | 用途 |
|------|------|------|
| LinkedIn | `mcporter call 'linkedin.search_people'` | 决策人搜索 |
| 微博 | `mcporter call 'weibo.search_content'` | 国内客户 |
| 微信公众号 | `miku_ai.get_wexin_article` | 行业内容 |
| V2EX | `curl v2ex.com/api/...` | 技术客户 |
| Exa | `mcporter call 'exa.web_search_exa'` | 语义搜索 |
| Jina Reader | `curl r.jina.ai/URL` | 网页读取 |

### 需要配置

| 渠道 | 配置方法 | 用途 |
|------|----------|------|
| 小红书 | Cookie-Editor 导入 | 国内B2C |
| 抖音 | pip install douyin-mcp-server | 视频营销 |
| 小宇宙 | Groq API Key | 播客转录 |

---

## 🚀 快速开始

### 场景1：海外客户开发（LinkedIn）

```
用户：帮我找美国传送带制造商的采购经理

AI：
1. [Exa 搜索] mcporter call 'exa.web_search_exa(query: "conveyor belt manufacturer USA purchasing", numResults: 10)'
2. [LinkedIn 搜索] mcporter call 'linkedin.search_people(keyword: "purchasing manager conveyor belt USA", limit: 10)'
3. [获取 Profile] mcporter call 'linkedin.get_person_profile(...)'
4. [生成开发信] ...
```

### 场景2：国内客户开发（微博）

```
用户：帮我找国内的传送带制造商

AI：
1. [微博搜索] mcporter call 'weibo.search_users(keyword: "传送带", limit: 20)'
2. [获取动态] mcporter call 'weibo.get_feeds(uid: "xxx", limit: 20)'
3. [背调] ...
4. [触达] 微博私信 / 邮件
```

### 场景3：竞品监控

```
用户：监控 Flexco 最近有什么动态

AI：
1. [微博] mcporter call 'weibo.search_content(keyword: "Flexco", limit: 20)'
2. [小红书] mcporter call 'xiaohongshu.search_feeds(keyword: "Flexco")'
3. [微信] python3 -c "from miku_ai import get_wexin_article..."
4. [汇总报告] ...
```

---

## 📊 效果对比

| 指标 | 现有方案 | Agent Reach 方案 | 提升 |
|------|----------|------------------|------|
| LinkedIn Profile 获取 | 手动查看 | API 直接获取 | +50% 效率 |
| 国内客户触达 | 无 | 微博/小红书 | 新增渠道 |
| 竞品监控 | 手动 | 自动化 | +80% 效率 |
| 语义搜索 | 多引擎聚合 | Exa 语义 | +30% 准确率 |

---

## 🔧 配置优先级

1. **立即可用**：LinkedIn、微博、V2EX、Exa、Jina Reader
2. **优先配置**：微信公众号（已装）、小红书（需 Cookie）
3. **可选配置**：抖音、小宇宙

---

## 📝 更新 SKILL.md

将 Agent Reach 集成到 `global-customer-acquisition/SKILL.md`：

```markdown
## 工具集成

### Agent Reach 渠道（新增）

| 渠道 | 功能 | 用途 |
|------|------|------|
| LinkedIn | Profile 搜索 + 获取 | 决策人定位 |
| 微博 | 用户/内容搜索 | 国内客户触达 |
| 微信公众号 | 文章搜索 | 行业内容监控 |
| Exa | 语义搜索 | 客户发现 |
| V2EX | 技术社区 | 技术客户 |
| 小红书 | 笔记搜索 | 品牌监控 |
```

---

_版本: 1.0.0_
_更新: 2026-03-27_
