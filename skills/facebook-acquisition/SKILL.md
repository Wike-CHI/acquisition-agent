---
name: facebook-acquisition
version: 1.0.0
description: Facebook客户搜索技能。在Facebook上搜索潜在客户，挖掘行业群组，获取公司主页信息。当用户需要从Facebook获取客户时使用此技能。
always: false
triggers:
  - Facebook搜索
  - FB获客
  - 社媒获客
---

# Facebook 客户搜索技能

利用Facebook平台搜索潜在客户，挖掘行业群组，获取公司信息。

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

**搜索公司主页**：

```bash
# 打开 Facebook 搜索（通过 Google 索引，无需登录）
agent-browser open "https://www.google.com/search?q=site:facebook.com+{keyword}+distributor"
agent-browser snapshot -c
# 提取搜索结果中的 Facebook 公司主页链接

# 逐个访问公司主页
agent-browser open "https://www.facebook.com/{company-slug}"
agent-browser snapshot -c
# 提取：公司名称、About 信息、网站、联系方式、粉丝数
```

**搜索行业群组**：

```bash
agent-browser open "https://www.google.com/search?q=site:facebook.com/groups+{keyword}"
agent-browser snapshot -c
# 提取群组链接、名称、成员数

agent-browser close
```

### 1.3 数据提取模板

从 snapshot 输出中提取以下字段：

```json
{
  "name": "公司名称",
  "facebook": "https://www.facebook.com/xxx",
  "website": "https://...",
  "email": "从 About 页面提取",
  "phone": "从 About 页面提取",
  "followers": "粉丝数",
  "industry": "行业",
  "location": "地区",
  "source": "facebook"
}
```

### 1.4 反爬策略

- 每次搜索间隔 5-10 秒
- 每轮最多访问 20 个页面
- 遇到登录墙或验证码时停止，记录已获取数据
- 优先通过 Google 索引搜索（无需 Facebook 登录）

---

## 二、搜索方式

### 1.1 Facebook站内搜索
```
https://www.facebook.com/search/top?q={关键词}
```

**关键词组合**：
- `{industry} distributor` - 行业分销商
- `{industry} manufacturer` - 行业制造商
- `{industry} supplier` - 行业供应商
- `{product} wholesale` - 产品批发

**示例**：
- `industrial belt distributor`
- `conveyor belt manufacturer`
- `power transmission supplier`

### 1.2 Google搜索Facebook页面
```
site:facebook.com {关键词} {地区}
```

**示例**：
- `site:facebook.com industrial belt distributor USA`
- `site:facebook.com conveyor belt manufacturer Germany`

### 1.3 行业群组搜索
```
https://www.facebook.com/search/groups?q={行业关键词}
```

**有价值的群组类型**：
- 行业协会群组
- 采购商群组
- 制造商社群
- 展会群组

## 二、搜索流程

### Step 1: 搜索公司主页
1. 打开Facebook搜索
2. 输入行业关键词
3. 筛选"公共主页"
4. 记录潜在客户信息

### Step 2: 查看公司详情
- 关于信息
- 网站链接
- 联系方式
- 公司规模
- 成立时间

### Step 3: 检查活跃度
- 最近发帖时间
- 互动频率
- 关注者数量

### Step 4: 记录信息
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
  "last_post": "2026-03-01",
  "notes": "活跃度高，潜在客户"
}
```

## 三、关键词库

### 3.1 行业关键词
| 英文 | 中文 |
|------|------|
| industrial belt | 工业皮带 |
| conveyor belt | 输送带 |
| power transmission | 动力传输 |
| timing belt | 同步带 |
| v-belt | V带 |
| flat belt | 平皮带 |

### 3.2 公司类型关键词
| 英文 | 中文 |
|------|------|
| distributor | 分销商 |
| manufacturer | 制造商 |
| supplier | 供应商 |
| wholesaler | 批发商 |
| dealer | 经销商 |

### 3.3 地区关键词
| 英文 | 中文 |
|------|------|
| USA | 美国 |
| Germany | 德国 |
| UK | 英国 |
| Australia | 澳大利亚 |
| Canada | 加拿大 |

## 四、群组挖掘

### 4.1 搜索行业群组
```
https://www.facebook.com/search/groups?q={行业关键词}
```

**推荐搜索关键词**：
- `industrial belt`
- `conveyor belt`
- `power transmission`
- `industrial equipment`

### 4.2 高价值群组列表

| 群组名称 | 成员数 | 活跃度 | 链接 |
|----------|--------|--------|------|
| Automotive,Industrial& Agricultural transmission belt | 1.6万 | 20+帖/天 | [加入](https://www.facebook.com/groups/1031842026902198/) |
| CONVEYOR BELT SPLICER TECH | 1.6万 | 5帖/天 | [加入](https://www.facebook.com/groups/267220038270897/) |
| Industrial V Belts | 1,447 | 5帖/天 | [加入](https://www.facebook.com/groups/205411585752562/) |

### 4.3 加入群组操作

**方式1：直接访问群组链接**
```
用户: 帮我加入 "Automotive,Industrial& Agricultural transmission belt" 群组
→ 打开群组页面
→ 点击"加入"按钮
```

**方式2：搜索后加入**
```
用户: 搜索 conveyor belt 相关群组
→ 打开 https://www.facebook.com/search/groups?q=conveyor+belt
→ 展示群组列表
→ 用户选择要加入的群组
```

### 4.4 有价值群组特征
- ✅ 成员数 > 1000
- ✅ 活跃发帖（每周有新帖）
- ✅ 允许商业推广
- ✅ 目标客户聚集
- ✅ 公开群组（更容易加入）

### 4.5 群组互动策略
1. **加入群组** - 点击加入按钮
2. **观察7天** - 了解群规和话题
3. **提供价值** - 分享有用信息
4. **适度推广** - 每周1-2次产品介绍
5. **私信跟进** - 对感兴趣的用户私信

### 4.6 群组发帖模板

**产品介绍帖**：
```
🏭 Looking for industrial belt equipment?

HOLO (红龙) offers:
✅ Air/Water Cooled Press
✅ Finger Puncher
✅ Belt Slitting Machine
✅ Ply Separator

20+ years experience | CE certified

📩 DM for catalog and pricing

#IndustrialBelt #ConveyorBelt #Manufacturing
```

**问题解答帖**：
```
Great question about belt splicing!

From our 20+ years experience:
1. Temperature control is key
2. Pressure must be even
3. Cooling time matters

We manufacture splice presses if anyone needs equipment.

Happy to answer more questions!
```

## 五、私信模板

### 5.1 首次接触
```
Hi {Name},

I noticed your company {Company} in the {Industry} group. 
We're HOLO, a manufacturer of industrial belt equipment 
with 20+ years experience.

Would you be interested in discussing potential collaboration?

Best,
{Your Name}
```

### 5.2 产品介绍
```
Hi {Name},

Following up on our conversation. Here's more about our products:

- Air/Water Cooled Press (Splice Press)
- Finger Puncher
- Belt Slitting Machine
- Ply Separator

Website: www.beltsplicepress.com

Happy to discuss how we can support your business.

Best,
{Your Name}
```

## 六、注意事项

### 6.1 账号安全
- 避免频繁搜索（防止被封）
- 控制私信频率
- 使用真实信息

### 6.2 礼貌沟通
- 避免硬性推销
- 提供有价值信息
- 尊重对方时间

### 6.3 数据记录
- 及时记录客户信息
- 标记跟进状态
- 定期更新数据库

## 七、质量评估

### 7.1 客户质量判断
| 指标 | 高质量 | 中等 | 低质量 |
|------|--------|------|--------|
| 关注者 | >500 | 100-500 | <100 |
| 最近发帖 | 1周内 | 1月内 | >3月 |
| 有联系方式 | ✅ | 部分 | ❌ |
| 行业相关 | ✅ | 间接 | ❌ |

### 7.2 优先级排序
1. 有网站 + 有联系方式 + 活跃
2. 有联系方式 + 活跃
3. 有联系方式
4. 信息不完整

---
*相关技能*:
- global-customer-acquisition: 主控技能
- acquisition-workflow: 工作流
- company-research: 客户背调
