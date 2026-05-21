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

> **Skill Graph：** 领域 → [[_index-outreach|多渠道触达领域]] | 上游 ← [[_index-discovery|客户发现领域]] | 下游 → [[company-research|企业背调]]（找到公司后）


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

---

## 详细参考

> 以下内容已拆分到 [[references/extended-guide.md]]，仅在需要时读取：
> - 五、互动策略
> - 六、高价值账号识别
> - 七、竞品分析
> - 八、注意事项
> - 九、快速命令
> - 十、数据导出格式
>
> 何时读取：需要查阅详细步骤、模板、配置或示例时。
