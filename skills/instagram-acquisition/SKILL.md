---
name: instagram-acquisition
version: 1.0.0
description: Instagram客户搜索技能。在Instagram上搜索潜在客户，挖掘行业标签，获取公司账号信息。当用户需要从Instagram获取客户时使用此技能。
always: false
triggers:
  - Instagram搜索
  - IG获客
  - 社媒获客
  - Instagram客户
---

# Instagram 客户搜索技能

利用Instagram平台搜索潜在客户，挖掘行业标签，获取公司信息。

## 一、agent-browser 自动化 SOP

> 使用 agent-browser CLI 进行 headless 自动化搜索，无需手动操作浏览器。

### 1.0 环境检测

首次运行必须检测 agent-browser 是否可用：

```bash
which agent-browser
```

- **输出路径**：环境就绪，使用 agent-browser 模式
- **输出为空**：提示安装 `npm install -g agent-browser && agent-browser install --with-deps`

### 1.1 安全约束

本技能**仅使用** agent-browser 的只读命令：

```bash
agent-browser open "<url>"       # 打开页面
agent-browser snapshot -c        # 获取页面文本内容
agent-browser close              # 关闭浏览器
```

**禁止使用**：`fill`、`click`、`type`、`eval`、`state save/load`、`cookies`、`network route`

### 1.2 自动化搜索流程

**标签搜索**：

```bash
# 通过 Google 索引搜索 Instagram 标签（无需登录）
agent-browser open "https://www.google.com/search?q=site:instagram.com+{keyword}+supplier"
agent-browser snapshot -c
# 提取搜索结果中的 Instagram 账号链接

# 逐个访问账号主页（公开账号可访问）
agent-browser open "https://www.instagram.com/{username}/"
agent-browser snapshot -c
# 提取：用户名、bio、网站、粉丝数、帖子数、类别
```

**竞品粉丝挖掘**：

```bash
agent-browser open "https://www.google.com/search?q=site:instagram.com/{competitor-username}+followers"
agent-browser snapshot -c
# 提取竞品相关企业账号

agent-browser close
```

### 1.3 数据提取模板

从 snapshot 输出中提取以下字段：

```json
{
  "username": "@account_name",
  "company": "公司名称（从 bio 提取）",
  "website": "从 bio 链接提取",
  "email": "从 bio 或网站提取",
  "followers": "粉丝数",
  "posts": "帖子数",
  "category": "账号类别",
  "location": "地区",
  "source": "instagram"
}
```

### 1.4 反爬策略

- 每次搜索间隔 5-10 秒
- 每轮最多访问 20 个页面
- 遇到登录墙或验证码时停止，记录已获取数据
- 优先通过 Google 索引搜索（无需 Instagram 登录）
- Instagram 公开账号通常可直接访问

---

## 二、平台信息

**Instagram** - 全球最大的图片和视频社交平台
- 网址: https://www.instagram.com
- 月活用户: 20亿+
- 企业账号: 2亿+
- 目标人群: B2B企业、制造商、分销商、批发商

## 二、搜索方式

### 2.1 标签搜索（推荐）

**搜索链接**：
```
https://www.instagram.com/explore/tags/{关键词}/
```

**推荐标签**：
| 标签 | 内容 | 帖子数 |
|------|------|--------|
| #conveyorbelt | 输送带 | 50,000+ |
| #industrialbelt | 工业皮带 | 30,000+ |
| #manufacturing | 制造业 | 5,000,000+ |
| #factory | 工厂 | 10,000,000+ |
| #industrial | 工业 | 8,000,000+ |
| #conveyor | 输送 | 200,000+ |
| #transmissionbelt | 传动带 | 10,000+ |
| #rubberbelt | 橡胶带 | 15,000+ |

### 2.2 账号搜索

**搜索链接**：
```
https://www.instagram.com/explore/search/?query={关键词}
```

**搜索类型**：
- 账号搜索
- 标签搜索
- 地点搜索

### 2.3 竞争对手粉丝挖掘

```
1. 找到竞争对手账号（如 Habasit, Gates）
2. 查看粉丝列表
3. 筛选企业账号
4. 记录联系方式
```

## 三、搜索流程

### Step 1: 标签搜索

```
1. 打开 Instagram
2. 搜索行业标签（如 #conveyorbelt）
3. 查看"最新"帖子
4. 点击发帖账号
5. 查看账号简介
6. 判断是否为潜在客户
7. 记录信息
```

### Step 2: 账号分析

**查看内容**：
- 简介（bio）
- 网站（website）
- 联系方式（邮箱/电话）
- 粉丝数
- 发帖频率
- 账号类型（企业/个人）

**判断标准**：
| 指标 | 高质量 | 中等 | 低质量 |
|------|--------|------|--------|
| 粉丝数 | >1,000 | 500-1,000 | <500 |
| 发帖频率 | >1/周 | 1-2/月 | <1/月 |
| 有网站 | ✅ | - | ❌ |
| 有联系方式 | ✅ | 部分有 | ❌ |

### Step 3: 信息记录

```json
{
  "username": "@abc_industrial",
  "company_name": "ABC Industrial Supply",
  "bio": "Industrial conveyor belt supplier since 1990",
  "website": "https://www.abc-industrial.com",
  "email": "sales@abc-industrial.com",
  "phone": "+1-xxx-xxx-xxxx",
  "followers": 2500,
  "following": 500,
  "posts": 350,
  "verified": false,
  "category": "Industrial Supplier",
  "location": "Texas, USA",
  "last_post": "2026-03-20"
}
```

## 四、关键词库

### 4.1 行业关键词

| 英文 | 中文 | 标签 |
|------|------|------|
| conveyor belt | 输送带 | #conveyorbelt |
| timing belt | 同步带 | #timingbelt |
| v belt | V带 | #vbelt |
| rubber belt | 橡胶带 | #rubberbelt |
| industrial belt | 工业皮带 | #industrialbelt |
| transmission belt | 传动带 | #transmissionbelt |

### 4.2 公司类型关键词

| 英文 | 中文 | 标签 |
|------|------|------|
| manufacturer | 制造商 | #manufacturer |
| distributor | 分销商 | #distributor |
| supplier | 供应商 | #supplier |
| wholesaler | 批发商 | #wholesaler |
| factory | 工厂 | #factory |

### 4.3 地区关键词

| 英文 | 中文 | 标签 |
|------|------|------|
| USA | 美国 | #usa #america |
| Germany | 德国 | #germany #deutschland |
| UK | 英国 | #uk #unitedkingdom |
| Australia | 澳大利亚 | #australia |
| Brazil | 巴西 | #brazil #brasil |

## 五、互动策略

### 5.1 关注账号

**策略**：
1. 关注目标客户
2. 点赞最近3-5条帖子
3. 留下有价值的评论
4. 等待回关

### 5.2 私信模板

**首次接触**：
```
Hi {Name},

Great content on industrial equipment! 

We're HOLO, a manufacturer of industrial belt equipment 
(splice press, finger puncher, etc.) with 20+ years experience.

Would love to connect and discuss potential collaboration.

Best,
{Your Name}
```

**产品介绍**：
```
Hi {Name},

Following up on our connection. Here's what we offer:

✅ Air/Water Cooled Press
✅ Finger Puncher
✅ Belt Slitting Machine
✅ Ply Separator

Website: www.beltsplicepress.com

Happy to discuss how we can support your business!

Best,
{Your Name}
```

### 5.3 评论策略

**有价值评论示例**：
```
"Great setup! What's the belt width you're working with?"
"Nice conveyor system! We specialize in belt splicing equipment."
"Impressive operation! How do you handle belt maintenance?"
```

## 六、高价值账号识别

### 6.1 目标账号特征

| 特征 | 说明 |
|------|------|
| 企业账号 | 蓝色认证或企业标签 |
| 有网站 | 可点击访问 |
| 有联系方式 | 邮箱/电话/WhatsApp |
| 活跃发帖 | 近期有更新 |
| 粉丝适中 | 1,000-50,000 |
| 行业相关 | 工业设备/输送带 |

### 6.2 排除条件

| 条件 | 说明 |
|------|------|
| 个人账号 | 纯生活内容 |
| 粉丝过多 | >100,000（难触达） |
| 粉丝过少 | <100（影响力低） |
| 不活跃 | >3个月未更新 |
| 竞争对手 | 同行账号 |

## 七、竞品分析

### 7.1 主要竞争对手账号

| 公司 | Instagram | 粉丝数 | 关注 |
|------|-----------|--------|------|
| Habasit | @habasit | 5,000+ | ✅ |
| Gates | @gatescorporation | 10,000+ | ✅ |
| Continental | @continentaltire | 50,000+ | ✅ |
| Forbo | @forbomovement | 2,000+ | ✅ |

### 7.2 竞品粉丝挖掘

```
1. 访问竞品账号
2. 点击"粉丝"
3. 筛选企业账号
4. 查看是否为潜在客户
5. 关注+互动
```

## 八、注意事项

### 8.1 账号安全

- 避免频繁关注/取关（<50/天）
- 避免频繁私信（<20/天）
- 避免复制粘贴评论
- 使用真实头像和信息

### 8.2 平台规则

- 遵守Instagram社区准则
- 不发送垃圾信息
- 不购买粉丝/点赞
- 不使用自动化工具（除非官方API）

### 8.3 礼貌沟通

- 提供有价值的内容
- 避免硬性推销
- 尊重对方时间
- 及时回复消息

## 九、快速命令

### 搜索命令
```
用户: 在Instagram搜索 [标签/关键词]
例: 在Instagram搜索 conveyorbelt
例: 在Instagram搜索 industrial belt supplier
```

### 标签命令
```
用户: 查看 [标签] 标签下的账号
例: 查看 #conveyorbelt 标签
```

### 竞品命令
```
用户: 分析 [竞争对手] 的粉丝
例: 分析 Habasit 的粉丝账号
```

## 十、数据导出格式

### 10.1 标准导出
```json
{
  "platform": "Instagram",
  "search_date": "2026-03-25",
  "accounts": [
    {
      "username": "@abc_industrial",
      "company": "ABC Industrial Supply",
      "website": "https://www.abc-industrial.com",
      "email": "sales@abc-industrial.com",
      "followers": 2500,
      "category": "Industrial Supplier",
      "location": "USA",
      "quality_score": 85
    }
  ],
  "total": 10
}
```

### 10.2 评分标准

| 维度 | 权重 | 评分依据 |
|------|------|----------|
| 行业相关 | 30% | 是否工业皮带相关 |
| 粉丝数 | 20% | 1,000-50,000最佳 |
| 活跃度 | 20% | 近期发帖频率 |
| 联系方式 | 20% | 有邮箱/网站 |
| 互动率 | 10% | 点赞/评论比例 |

---
*相关技能*:
- global-customer-acquisition: 全网获客主控
- facebook-acquisition: Facebook获客
- linkedin: LinkedIn获客
- company-research: 企业背调

*平台*: Instagram
*网址*: https://www.instagram.com
*更新时间*: 2026-03-25
