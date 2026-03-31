# 获客渠道智能路由

> 模式四：根据情况选工具
> 更新时间：2026-03-27

---

## 设计思路

根据官方推荐的模式四：
> "适合同一个需求但条件不同的场景。写法就是一棵决策树——
> 什么条件走什么分支。把选择理由也告诉用户。"

---

## 决策树

```
用户输入：获客需求
    ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 1: 判断客户类型                                        │
├─────────────────────────────────────────────────────────────┤
│  需要国内客户？                                              │
│  ├── 是 → 微博/微信公众号 ⭐⭐⭐⭐⭐                        │
│  └── 否 → 继续判断                                          │
│                                                             │
│  需要海外客户？                                              │
│  ├── 是 → 继续判断                                          │
│  └── 否 → LinkedIn（全球）                                  │
│                                                             │
│  需要采购记录？                                              │
│  ├── 是 + 有特易账号 → 特易海关数据 ⭐⭐⭐⭐⭐             │
│  ├── 是 + 无特易账号 → Exa搜索海关数据 ⭐⭐⭐              │
│  └── 否 → 继续判断                                          │
│                                                             │
│  需要决策人？                                                │
│  ├── 是 + LinkedIn MCP可用 → LinkedIn搜索 ⭐⭐⭐⭐⭐       │
│  ├── 是 + LinkedIn MCP不可用 → Exa搜索LinkedIn ⭐⭐⭐⭐    │
│  └── 否 → 继续判断                                          │
│                                                             │
│  需要企业背调？                                              │
│  ├── 是 + 中文企业 → company-research ⭐⭐⭐⭐⭐           │
│  ├── 是 + 海外企业 → Exa + Jina Reader ⭐⭐⭐⭐            │
│  └── 否 → Google搜索                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 渠道能力矩阵

| 渠道 | 状态 | 适用场景 | 优势 | 劣势 |
|------|------|----------|------|------|
| **微博** | ✅ | 国内客户 | 实时、活跃 | 需筛选 |
| **Exa** | ✅ | 海外搜索 | 全面、快速 | 非实时 |
| **LinkedIn MCP** | ⚠️ | 决策人 | 精准、专业 | 需启动 |
| **特易海关** | ✅ | 采购记录 | 真实、详细 | 需RPA |
| **Jina Reader** | ✅ | 背调 | 深度、免费 | 无结构化 |
| **微信公众号** | ✅ | 国内内容 | 专业、深度 | 需关键词 |

---

## 智能路由规则

### 规则1: 国内客户

```
条件: 客户在中国 或 需要国内客户

推荐渠道:
1️⃣ 微博搜索 - 实时活跃用户
   mcporter call "weibo.search_users(keyword: '[行业]', limit: 10)"

2️⃣ 微信公众号 - 专业内容
   python -c "from miku_ai import get_wexin_article..."

3️⃣ 百度/搜狗 - 企业信息
   web_search: "site:baike.baidu.com [公司名]"

选择理由:
- 微博用户活跃度高，适合快速触达
- 微信公众号内容专业，适合深度了解
- 百度百科信息权威，适合背调
```

---

### 规则2: 海外客户 + 需要采购记录

```
条件: 海外客户 + 需要真实采购数据

推荐渠道:
1️⃣ 特易海关数据 - 最权威 ⭐⭐⭐⭐⭐
   - 有账号 → 使用RPA自动化
   - 无账号 → 提示用户购买

2️⃣ Exa搜索海关数据 - 备选 ⭐⭐⭐
   mcporter call "exa.web_search_exa(query: 'customs data [公司名]', numResults: 5)"

3️⃣ ImportGenius/Panjiva - 付费备选
   - 需要用户自己有账号

选择理由:
- 特易是中国海关数据，对国内企业最权威
- Exa可以搜索公开的海关数据
- ImportGenius适合美国进口数据
```

---

### 规则3: 海外客户 + 需要决策人

```
条件: 海外客户 + 需要直接联系决策人

推荐渠道:
1️⃣ LinkedIn MCP（如果可用）- 最精准 ⭐⭐⭐⭐⭐
   mcporter call linkedin.search_people keywords="..."

2️⃣ Exa搜索LinkedIn - 备选 ⭐⭐⭐⭐
   mcporter call "exa.web_search_exa(query: 'site:linkedin.com [职位] [公司]', numResults: 10)"

3️⃣ Hunter.io - 邮箱查找
   - 需要API Key

选择理由:
- LinkedIn是职业社交网络，决策人信息最全
- LinkedIn MCP可以精准搜索
- Exa备选在MCP不可用时使用
```

---

### 规则4: 海外客户 + 需要背调

```
条件: 海外客户 + 需要深度了解公司

推荐渠道:
1️⃣ Exa搜索 - 快速了解 ⭐⭐⭐⭐
   mcporter call "exa.web_search_exa(query: '[公司名] news financial', numResults: 10)"

2️⃣ Jina Reader - 深度背调 ⭐⭐⭐⭐⭐
   curl.exe -s "https://r.jina.ai/https://[官网]"

3️⃣ LinkedIn公司页 - 员工规模
   mcporter call "exa.web_search_exa(query: 'site:linkedin.com/company/[公司名]', numResults: 5)"

选择理由:
- Exa可以快速获取公司新闻和财务信息
- Jina Reader可以深度阅读官网内容
- LinkedIn可以了解员工规模和组织架构
```

---

### 规则5: 海外客户 + 需要行业洞察

```
条件: 海外客户 + 需要了解行业趋势

推荐渠道:
1️⃣ V2EX - 技术客户 ⭐⭐⭐
   curl -s "https://www.v2ex.com/api/topics/hot.json"

2️⃣ Reddit - 行业讨论 ⭐⭐⭐⭐
   curl -s "https://www.reddit.com/r/[行业]/hot.json"

3️⃣ RSS订阅 - 持续监控 ⭐⭐⭐
   curl -s "https://r.jina.ai/[RSS链接]"

选择理由:
- V2EX适合技术导向的客户
- Reddit有大量行业讨论
- RSS可以持续监控行业动态
```

---

## 组合策略

### 策略1: 大客户深度开发

```
场景: 需要全面了解一个大客户

渠道组合:
1. 特易海关数据 → 采购记录
2. LinkedIn → 决策人
3. Jina Reader → 官网背调
4. Exa → 新闻动态

输出:
- 客户背调报告
- 决策人列表
- 开发信草稿
```

---

### 策略2: 批量客户发现

```
场景: 快速获取一批潜在客户

渠道组合:
1. Exa搜索 → 行业关键词
2. 去重 → 排除重复
3. 快速评分 → ICP匹配

输出:
- 客户列表（10-50家）
- 初步评分
```

---

### 策略3: 国内客户开发

```
场景: 开发国内市场

渠道组合:
1. 微博搜索 → 行业关键词
2. 微信公众号 → 专业内容
3. 百度/天眼查 → 企业背调

输出:
- 国内客户线索
- 企业基本信息
```

---

## 自动选择示例

### 示例1: 简单搜索

```
用户: 搜索美国传送带制造商

AI:
🔍 分析需求...
- 客户类型: 海外
- 需求: 客户发现
- 优先级: 速度

✅ 选择渠道: Exa搜索（最快）

执行中...
mcporter call "exa.web_search_exa(query: 'conveyor belt manufacturer USA', numResults: 10)"

找到 10 家美国传送带制造商
```

---

### 示例2: 深度开发

```
用户: 深度开发 Ace Belting Company

AI:
🔍 分析需求...
- 客户类型: 海外
- 需求: 深度开发（背调 + 决策人 + 采购记录）

✅ 选择渠道组合:
1. Exa搜索 → 公司背景
2. LinkedIn → 决策人
3. Jina Reader → 官网背调

执行中...

[1/3] Exa搜索...
找到 5 条公司新闻

[2/3] LinkedIn搜索...
找到 3 个决策人

[3/3] Jina Reader背调...
抓取官网内容

✅ 生成完整报告
```

---

### 示例3: 渠道不可用

```
用户: LinkedIn搜索决策人

AI:
🔍 检查渠道状态...
❌ LinkedIn MCP 不可用（浏览器未初始化）

✅ 自动切换备选渠道: Exa搜索LinkedIn索引

执行中...
mcporter call "exa.web_search_exa(query: 'site:linkedin.com purchasing manager', numResults: 10)"

找到 10 个LinkedIn决策人（索引数据）

💡 提示: 如需实时LinkedIn数据，请先启动LinkedIn MCP服务
```

---

## 技术实现

### 伪代码

```python
def select_best_channel(user_need):
    """根据需求自动选择最佳渠道"""
    
    # 判断客户类型
    if user_need.target_market == "国内":
        return select_domestic_channels(user_need)
    else:
        return select_overseas_channels(user_need)

def select_overseas_channels(user_need):
    """选择海外客户渠道"""
    
    channels = []
    
    # 需要采购记录
    if user_need.need_purchase_records:
        if has_teyi_account():
            channels.append("特易海关数据")
        else:
            channels.append("Exa搜索海关数据")
    
    # 需要决策人
    if user_need.need_decision_makers:
        if linkedin_mcp_available():
            channels.append("LinkedIn MCP")
        else:
            channels.append("Exa搜索LinkedIn")
    
    # 需要背调
    if user_need.need_background_check:
        channels.append("Jina Reader")
    
    return channels

def execute_with_fallback(channel, task):
    """执行任务，失败时自动切换备选"""
    
    try:
        return execute(channel, task)
    except ChannelNotAvailableError:
        # 切换备选渠道
        fallback = get_fallback_channel(channel)
        log(f"⚠️ {channel} 不可用，切换到 {fallback}")
        return execute(fallback, task)
```

---

## 集成到获客系统

### 在 SKILL.md 中的位置

```
获客流程:
1. **智能路由** → 自动选择最佳渠道 ⭐ (新增)
2. 客户发现 → 使用选定的渠道
3. 企业背调 → ICP评分
4. LinkedIn 决策人 → 定位联系人
5. 竞品分析 → 竞争对手识别
6. 开发信生成 → 反复打磨检查
7. 多渠道触达 → 突出优势
8. 跟进管理 → 竞品对比
```

---

_更新时间：2026-03-27_
_模式：根据情况选工具_
_Agent Reach 获客系统 v1.2.0_
