# 多平台支持清单（完整版）

> 全网获客系统支持的所有平台（12个）
> 更新时间: 2026-03-27 14:53

---

## 🌐 平台支持总览

### 客户发现平台（12个）

| # | 平台 | 状态 | 用途 | 市场覆盖 | 技能目录 |
|---|------|------|------|----------|----------|
| 1 | **微博** | ✅ 可用 | 国内客户发现 | 中国 | mcporter/weibo |
| 2 | **Exa 搜索** | ✅ 可用 | 海外客户搜索 | 全球 | mcporter/exa |
| 3 | **LinkedIn MCP** | ✅ 运行中 | 决策人搜索 | 全球（职业社交）| mcporter/linkedin |
| 4 | **抖音 MCP** | ⚠️ 需启动 | 短视频营销 | 中国 | mcporter/douyin |
| 5 | **微信公众号** | ✅ 可用 | 国内内容营销 | 中国 | miku-ai |
| 6 | **V2EX** | ✅ 可用 | 技术客户 | 中国（技术圈）| 公开API |
| 7 | **RSS/Atom** | ✅ 可用 | 内容聚合 | 全球 | Jina Reader |
| 8 | **Jina Reader** | ✅ 可用 | 企业背调 | 全球 | curl |
| 9 | **Facebook** | ⚠️ 需配置 | 社媒客户发现 | 全球（除中国）| facebook-acquisition |
| 10 | **Instagram** | ⚠️ 需配置 | 视觉营销 | 全球（除中国）| instagram-acquisition |
| 11 | **特易海关数据** | ✅ 可用 | 采购记录 | 中国海关数据 | teyi-customs |
| 12 | **Google搜索** | ✅ 可用 | 补充搜索 | 全球 | web_search |

---

## 📊 平台详细说明

### 1. Facebook 客户搜索 ⭐

**技能位置**: `skills/facebook-acquisition/`

**功能**:
- 搜索公司主页
- 挖掘行业群组
- 获取公司信息
- 查看活跃度

**搜索方式**:
```
1. Facebook站内搜索
   https://www.facebook.com/search/top?q={关键词}

2. Google搜索Facebook页面
   site:facebook.com {关键词} {地区}

3. 行业群组搜索
   https://www.facebook.com/search/groups?q={行业关键词}
```

**关键词库**:
| 英文 | 中文 |
|------|------|
| industrial belt distributor | 工业皮带分销商 |
| conveyor belt manufacturer | 输送带制造商 |
| power transmission supplier | 动力传输供应商 |

**触发命令**:
```
Facebook搜索：conveyor belt manufacturer USA
FB获客：工业皮带分销商
```

**数据记录**:
```json
{
  "name": "公司名称",
  "facebook": "https://www.facebook.com/xxx",
  "website": "https://...",
  "email": "contact@xxx.com",
  "phone": "+1-xxx-xxx",
  "followers": 500,
  "industry": "工业皮带分销",
  "location": "USA, Texas",
  "last_post": "2026-03-01"
}
```

---

### 2. Instagram 客户搜索 ⭐

**技能位置**: `skills/instagram-acquisition/`

**功能**:
- 标签搜索（推荐）
- 账号搜索
- 竞争对手粉丝挖掘
- 视觉内容分析

**搜索方式**:
```
1. 标签搜索
   https://www.instagram.com/explore/tags/{关键词}/

2. 账号搜索
   https://www.instagram.com/explore/search/?query={关键词}

3. 竞争对手粉丝挖掘
   - 找到竞争对手账号（如 Habasit, Gates）
   - 查看粉丝列表
   - 筛选企业账号
```

**推荐标签**:
| 标签 | 内容 | 帖子数 |
|------|------|--------|
| #conveyorbelt | 输送带 | 50,000+ |
| #industrialbelt | 工业皮带 | 30,000+ |
| #manufacturing | 制造业 | 5,000,000+ |
| #factory | 工厂 | 10,000,000+ |
| #industrial | 工业 | 8,000,000+ |

**触发命令**:
```
Instagram搜索：conveyorbelt
IG获客：industrial belt
```

**质量判断**:
| 指标 | 高质量 | 中等 | 低质量 |
|------|--------|------|--------|
| 粉丝数 | >1,000 | 500-1,000 | <500 |
| 发帖频率 | >1/周 | 1-2/月 | <1/月 |
| 有网站 | ✅ | - | ❌ |

---

### 3. 特易海关数据 ⭐⭐⭐⭐⭐

**技能位置**: `skills/teyi-customs/`

**平台信息**:
- 名称: 特易(Teyi) - 外贸资讯宝GT7.0
- 登录: https://et.topease.net/login?product=gt
- 账户: 通过「初始化获客系统」配置
- 密码: 通过「初始化获客系统」配置
- 数据覆盖: 200+国家/地区
- 更新频率: 实时更新

**数据库统计**:
| 数据库 | 数量 |
|--------|------|
| 国际贸易企业数量 | 41,162,257 |
| 采购商数量 | 27,283,382 |
| 供应商数量 | 13,878,875 |
| 海外商业企业库 | 16,957,315 |
| 社交媒体企业库 | 25,155,108 |
| 海外会展企业库 | 290,888 |
| 广交会采购商 | 1,628,786 |
| 海外KYC报告库 | 329,316,159 |

**搜索参数**:
```
1. 产品关键词
   - conveyor belt（输送带）
   - timing belt（同步带）
   - v belt（V带）
   - rubber belt（橡胶带）

2. HS编码
   - 4010: 橡胶输送带
   - 4010.10: 输送带（金属增强）
   - 4010.20: 输送带（纺织增强）
   - 5910: 橡胶传动带

3. 目标国家
   - 北美洲：美国、加拿大、墨西哥
   - 南美洲：巴西、阿根廷、智利
   - 亚洲：印度、越南、土耳其
   - 欧洲：德国、英国、法国
   - 非洲：南非、尼日利亚、埃及
   - 大洋洲：澳大利亚、新西兰

4. 公司信息
   - 公司名称
   - 公司地址
   - 交易次数
   - 采购金额
```

**触发命令**:
```
海关数据：美国输送带采购商
特易搜索：conveyor belt USA
采购记录：印度输送带进口商
```

**获取信息**:
- 采购商名称
- 采购商联系方式
- 供应商信息
- 采购频次
- 采购金额
- 交易记录

**使用流程**:
```
1. 登录特易平台
2. 选择"搜公司"
3. 输入产品关键词
4. 选择目标国家
5. 筛选条件（交易次数、金额）
6. 查看结果
7. 导出数据
```

---

## 📊 平台能力矩阵（更新版）

| 平台 | 客户发现 | 决策人搜索 | 企业背调 | 内容营销 | 触达 | 监控 | 特殊能力 |
|------|----------|------------|----------|----------|------|------|----------|
| **微博** | ✅ | ❌ | ⚠️ | ✅ | ❌ | ✅ | 国内实时 |
| **Exa** | ✅ | ⚠️ | ✅ | ❌ | ❌ | ❌ | 语义搜索 |
| **LinkedIn** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 职业社交 |
| **抖音** | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ | 短视频 |
| **微信** | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ | 公众号 |
| **V2EX** | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ | 技术圈 |
| **Jina Reader** | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | 网页提取 |
| **特易** | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | **海关数据** ⭐ |
| **Facebook** | ✅ | ⚠️ | ✅ | ✅ | ⚠️ | ✅ | **社媒挖掘** ⭐ |
| **Instagram** | ✅ | ⚠️ | ⚠️ | ✅ | ⚠️ | ✅ | **视觉营销** ⭐ |
| **RSS** | ⚠️ | ❌ | ⚠️ | ✅ | ❌ | ✅ | 内容聚合 |
| **邮件** | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | 直接触达 |

---

## 🎯 按市场选择平台（更新版）

### 国内市场（中国）

```
推荐组合:
1. 微博（客户发现）
2. 微信公众号（内容营销）
3. 抖音（短视频营销）
4. V2EX（技术客户）
5. 特易海关数据（采购记录）⭐
```

### 海外市场（全球）

```
推荐组合:
1. LinkedIn（决策人触达）⭐⭐⭐⭐⭐
2. Exa搜索（客户发现）
3. Facebook（社媒挖掘）⭐
4. Instagram（视觉营销）⭐
5. Jina Reader（企业背调）
6. 邮件（触达）
```

### 美国市场

```
推荐组合:
1. 特易海关数据（采购记录）⭐⭐⭐⭐⭐
2. LinkedIn（决策人）
3. Facebook（社媒挖掘）⭐
4. Exa搜索（企业背调）
5. 邮件（触达）
```

### 东南亚市场

```
推荐组合:
1. 特易海关数据（采购记录）⭐
2. LinkedIn（决策人）
3. Facebook（社媒挖掘）⭐
4. Instagram（视觉营销）⭐
5. 邮件 + WhatsApp（触达）
```

---

## 🔧 平台配置指南

### 1. Facebook 配置

**方式**: 浏览器自动化（RPA）

**配置步骤**:
```powershell
# 1. 使用浏览器工具
browser action=start

# 2. 登录Facebook
browser action=open url="https://www.facebook.com"

# 3. 执行搜索
browser action=act kind=type ref=search_box text="conveyor belt manufacturer"

# 4. 提取结果
browser action=snapshot
```

**参考**: `skills/facebook-acquisition/SKILL.md`

---

### 2. Instagram 配置

**方式**: 浏览器自动化（RPA）

**配置步骤**:
```powershell
# 1. 使用浏览器工具
browser action=start

# 2. 登录Instagram
browser action=open url="https://www.instagram.com"

# 3. 搜索标签
browser action=open url="https://www.instagram.com/explore/tags/conveyorbelt/"

# 4. 提取账号信息
browser action=snapshot
```

**参考**: `skills/instagram-acquisition/SKILL.md`

---

### 3. 特易海关数据配置

**登录信息**:
```
网址: https://et.topease.net/login?product=gt
账号: {{从凭据管理器读取}}
密码: {{从凭据管理器读取}}
```

**使用方式**: RPA自动化

**配置步骤**:
```powershell
# 1. 使用浏览器工具
browser action=start

# 2. 打开特易登录页
browser action=open url="https://et.topease.net/login?product=gt"

# 3. 登录
browser action=act kind=type ref=username text="{{TEYI_USER}}"
browser action=act kind=type ref=password text="{{TEYI_PASS}}"
browser action=act kind=click ref=login_button

# 4. 搜索
browser action=act kind=type ref=search_box text="conveyor belt"
browser action=act kind=click ref=search_button

# 5. 提取数据
browser action=snapshot
```

**参考**: `skills/teyi-customs/SKILL.md`

---

## 📊 平台状态统计（更新版）

```
✅ 完全可用: 7个（微博、Exa、LinkedIn、微信、V2EX、Jina Reader、特易）
⚠️ 需启动/配置: 4个（抖音、Facebook、Instagram、邮件）
⏳ 付费服务: 0个
📦 总计: 12个平台
```

---

## 🚀 快速启动所有平台

```powershell
# 启动MCP服务
~/.agent-reach/start-mcp-services.bat

# 配置浏览器自动化（Facebook/Instagram/特易）
browser action=start

# 测试所有平台
cd C:\Users\Administrator\.openclaw\workspace\customer-acquisition-skills
.\scripts\test.ps1
```

---

## 📝 完整技能目录

```
skills/
├── facebook-acquisition/         # Facebook客户搜索 ⭐
│   ├── SKILL.md                  # 技能说明
│   └── templates/                # 搜索模板
│
├── instagram-acquisition/        # Instagram客户搜索 ⭐
│   ├── SKILL.md                  # 技能说明
│   └── templates/                # 标签库
│
├── teyi-customs/                 # 特易海关数据 ⭐⭐⭐⭐⭐
│   ├── SKILL.md                  # 技能说明
│   ├── scripts/                  # RPA脚本
│   └── data/                     # HS编码库
│
├── global-customer-acquisition/  # 主技能
├── linkedin/                     # LinkedIn集成
├── email-sender/                 # 邮件发送
├── browser-automation/           # 浏览器自动化
└── ...
```

---

## 🎯 特易海关数据 - 核心优势

### 为什么特易是⭐⭐⭐⭐⭐？

1. **真实采购记录** - 不是猜测，是真实交易数据
2. **供应商信息** - 可以分析竞争对手
3. **采购频次** - 判断客户价值
4. **采购金额** - 评估客户规模
5. **联系方式** - 直接获取决策人信息

### 特易 vs 其他平台

| 平台 | 采购记录 | 供应商信息 | 采购频次 | 采购金额 | 联系方式 |
|------|----------|------------|----------|----------|----------|
| **特易** | ✅ | ✅ | ✅ | ✅ | ✅ |
| LinkedIn | ❌ | ❌ | ❌ | ❌ | ✅ |
| Facebook | ❌ | ❌ | ❌ | ❌ | ⚠️ |
| Instagram | ❌ | ❌ | ❌ | ❌ | ⚠️ |
| Exa | ❌ | ❌ | ❌ | ❌ | ⚠️ |

---

## 📝 使用示例

### 示例1: 特易海关数据搜索

```
用户: 海关数据：美国输送带采购商

AI:
🔍 正在搜索特易海关数据...

找到 50 家美国输送带采购商：

1. SEMPERTRANS USA LLC.
   - 采购频次: 12次/年
   - 采购金额: $500,000+
   - 供应商: Semperit AG (自有)
   - 联系方式: +1-xxx-xxx-xxxx

2. Ace Belting Company
   - 采购频次: 6次/年
   - 采购金额: $200,000+
   - 供应商: [竞品1], [竞品2]
   - 联系方式: +1-xxx-xxx-xxxx

...
```

### 示例2: Facebook客户搜索

```
用户: Facebook搜索：conveyor belt distributor USA

AI:
🔍 正在搜索Facebook...

找到 20 家美国输送带分销商：

1. Industrial Belt Supply
   - Facebook: https://facebook.com/industrialbeltsupply
   - 网站: https://...
   - 粉丝: 1,200
   - 最近发帖: 2026-03-25

...
```

### 示例3: Instagram客户搜索

```
用户: Instagram搜索：#conveyorbelt

AI:
🔍 正在搜索Instagram标签 #conveyorbelt...

找到 50 个相关账号：

1. Habasit (@habasit)
   - 粉丝: 5,000+
   - 类型: 制造商
   - 网站: https://habasit.com

...
```

---

## 🚀 下一步

1. **配置特易账号** - 获取海关数据
2. **启动浏览器自动化** - 使用Facebook/Instagram
3. **测试所有平台** - 运行test.ps1
4. **开始获客** - 选择目标市场

---

_更新时间: 2026-03-27 14:53_
_版本: v1.3.0_
_可用平台: 12个（7个完全可用）_
_核心平台: 特易海关数据 ⭐⭐⭐⭐⭐_
