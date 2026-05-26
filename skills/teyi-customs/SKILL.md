---
name: teyi-customs
version: 3.0.0
description: Use when 需要查询海关进出口数据、采购记录或开发新供应商时。路由：海关数据查询走此技能（内置多模式搜索+决策人挖掘+数据格式化），不要直接调 teyi_customs 工具。
always: false
triggers:
  - 海关数据
  - 特易
  - 采购记录
  - 进出口
  - customs data
  - trade data
  - 特易搜搜
---

# 特易海关数据搜索技能 v3.0

> **Skill Graph：** 领域 → [[_index-acquisition|核心获客领域]] | 上游 ← [[_index-discovery|客户发现领域]] | 下游 → [[company-research|企业背调]]（发现采购商后）


> 底层工具: `teyi_customs` (`teyiCustoms.ts`) — BrowserSession + CDP 自动化, 零外部依赖
> 搜索入口: `https://et.topease.net/gt/company?wlf=sou6_search` (特易搜搜, 非 /gt/search TradeGPT)

## 一、平台信息

- **平台**: 特易(Teyi) 外贸资讯宝GT7.0
- **登录**: https://et.topease.net/login?product=gt
- **数据覆盖**: 233 国家/地区, 4100万+ 企业, 实时更新
- **数据类型**: 进出口报关单、提单、商业发票

## 二、工具 Actions 速查

所有操作通过 `teyi_customs` 工具完成，**不要手动操作浏览器**（浏览器工具仅在登录时使用）。

### 2.1 search — 单关键词搜索

```
teyi_customs action=search keyword="conveyor belt" country="巴西" hscode="4010" max_pages=3 auto_enrich=true enrich_limit=10
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| action | string | 是 | `"search"` |
| keyword | string | 是 | 英文产品关键词 |
| country | string | 否 | 目标国家中文名 (如 "巴西", "秘鲁") |
| hscode | string | 否 | HS编码过滤 (如 "4010") |
| max_pages | number | 否 | 翻页数, 默认1, 最多10 (~20条/页) |
| auto_enrich | boolean | 否 | 是否自动 Exa 补全决策人信息 (默认false) |
| enrich_limit | number | 否 | 最多 enrich 几家公司 (默认5) |
| session | string | 否 | 浏览器 session 名 (子代理自动分配) |

### 2.2 multi_search — 并行多关键词搜索 ⭐

```
teyi_customs action=multi_search keyword_variants=[
  {"keyword":"conveyor belt rubber","hscode":"4010"},
  {"keyword":"belt vulcanizer splicing","hscode":"8477"},
  {"keyword":"correia transportadora emenda"}
] country="巴西" max_pages=2 auto_enrich=true
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| action | string | 是 | `"multi_search"` |
| keyword_variants | array | 是 | `[{keyword, hscode?}]` — 至少2个变体 |
| country | string | 否 | 目标国家中文名 |
| max_pages | number | 否 | 每个 variant 翻页数, 默认1, 最多5 |
| auto_enrich | boolean | 否 | 去重后是否 enrich |
| enrich_limit | number | 否 | 最多 enrich 几家 (默认5, 最多20) |

**自动功能**:
- 每个 variant 独立 browser session 并行执行
- 结果按 `detail_url` 去重合并
- 每条结果标注 `sources` — 被哪个关键词命中
- 自动检测大厂噪音 (CAT, Scania 等21个品牌)
- 返回 `noise_warning` + `next_step` 建议

### 2.3 enrich — Exa 补全决策人

```
teyi_customs action=enrich company_name="Warbel do Brasil" country="巴西"
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| action | string | 是 | `"enrich"` |
| company_name | string | 是 | 公司名 (英文) |
| country | string | 否 | 国家上下文, 提升搜索精度 |

通过 Exa 搜索 10亿+ LinkedIn 个人资料, 返回:
- `decision_makers`: 决策人姓名/职位/LinkedIn URL
- `exa_company_info`: 公司描述/官网

### 2.4 detail — 公司详情

```
teyi_customs action=detail detail_url="https://et.topease.net/gt/company/detail/..."
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| action | string | 是 | `"detail"` |
| detail_url | string | 是 | 公司详情页完整URL (从 search/multi_search 结果中获取) |

从特易详情页提取: 公司基本信息、联系方式(email/电话/网站)、采购记录。

### 2.5 check — 验证登录状态

```
teyi_customs action=check
```

返回 `logged_in`, `url`, `state`, `screenshot`。

## 三、⭐ 搜索策略（必读）


### 3.1 核心原则

**特易擅长找"进口商"，不擅长找"服务商"。**

海关数据记录的是**跨境货物流动**。以下企业在特易中很难找到:
- 皮带接头/硫化服务公司 (不进口设备，只提供服务)
- 小型维修服务商
- 纯贸易中间商

以下企业在特易中容易找到:
- 大型进口商 (Caterpillar, Scania 等)
- 设备进口分销商
- 矿业/港口/钢厂 (自用设备进口)

**铁律: 特易搜不到不代表不存在。特易 + Web 双通道互补。**

### 3.2 三层搜索漏斗

每次搜索必须按此漏斗逐层进行:

```
第1层: search — 精准英文关键词 + HS编码 + 目标国家
  ├── 命中 >20 条 → 检查质量
  │   ├── 大部分是目标客户 → 直接使用
  │   └── 大部分是大厂杂音 → 进入第2层
  └── 命中 0 条 → 进入第2层

第2层: multi_search — 英文 + 本地语言 + 不同HS编码并行
  ├── 自动去重 + 噪音标记
  ├── 结果质量OK → 筛选用 enrich 补全决策人
  └── 大部分杂音 → 进入第3层

第3层: web_search — 服务商/分销商搜索 (特易外补充)
  ├── 搜索"产品名 + 国家 + empresa/serviço"
  ├── 识别皮带服务公司、分销商
  └── 找到后回特易 search keyword="公司名" 查进口记录
```

### 3.3 工业皮带设备关键词矩阵

| 层级 | 英文 | 葡萄牙语(巴西) | 西班牙语(拉美) | HS编码 |
|------|------|---------------|---------------|--------|
| 产品层 | `conveyor belt`, `rubber belt` | `correia transportadora` | `correa transportadora`, `cinta transportadora`, `banda transportadora` | 4010 |
| 设备层 | `belt vulcanizer`, `belt splicing machine`, `belt joint machine`, `finger puncher` | `vulcanizador de correia`, `emendadeira de correia` | `vulcanizadora de correa`, `empalmadora de correa`, `prensa de vulcanizado` | 8477 |
| 服务层 | `belt splicing service`, `vulcanization service`, `belt repair` | `serviço de emenda de correia`, `vulcanização de correia` | `servicio de empalme de correa`, `reparación de correas`, `mantenimiento de fajas transportadoras` | — |
| 配件层 | `belt fastener`, `belt clamp`, `belt gripper`, `belt repair kit` | `grampo para correia` | `sujetador de correa`, `grampa para correa`, `kit de reparación` | 7318 |

**优先顺序**: 产品层 (最多结果) → 设备层 (精准客户) → 服务层 (web补充) → 配件层 (交叉销售)

### 3.3.1 秘鲁/南美西班牙语市场特殊关键词

> 秘鲁的皮带服务公司常用 `fajas transportadoras` 而非 `correas transportadoras`。
> 加上行业词 `minería`(矿业)、`industrial` 有助于过滤杂音。

**秘鲁专用搜索组合**:
```
multi_search keyword_variants=[
  {keyword:"faja transportadora", hscode:"4010"},
  {keyword:"banda transportadora empalme"},
  {keyword:"servicio mantenimiento fajas transportadoras"},
  {keyword:"vulcanizadora prensa correa"},
  {keyword:"reparacion correas transportadoras"},
  {keyword:"correa transportadora industrial"}
] country="秘鲁"
```

**秘鲁高价值信号** (公司名包含以下关键词时重点关注):
- `servicios`, `servicio` — 服务公司（会用设备）
- `industrial`, `industria` — 工业供应商
- `fajas`, `bandas`, `correas` — 皮带相关
- `reparación`, `mantenimiento`, `empalme` — 维修/接头
- `ingeniería`, `soluciones` — 工程/解决方案公司

**秘鲁矿业终端客户（排除：不是我们的直接客户）**:
会搜出大量矿业公司（Southern Peru Copper, Buenaventura 等）。这些是**终端用户**，买设备自用，不是我们的经销商/服务商目标。标记为杂音排除。

### 3.4 结果质量判断

**立刻排除的杂音**:

大厂噪音黑名单 (工具自动标记):
CATERPILLAR, SCANIA, RENAULT, YAMAHA, ZARA, AMAZON, VOLVO, MERCEDES, TOYOTA, HONDA, NISSAN, FORD, GM, SAMSUNG, LG, APPLE, MICROSOFT, SIEMENS, BOSCH

矿业终端用户 (需人工判断排除 — 他们不是我们的经销商/服务商目标):
Southern Peru Copper, Buenaventura, Antamina, Cerro Verde, Las Bambas, Anglo American, Glencore, Freeport-McMoRan, Newmont, Barrick, Gold Fields, Hochschild, Minsur, Volcan, Nexa Resources

百货/零售 (与工业皮带无关):
SAGA FALABELLA, RIPLEY, CENCOSUD, SODIMAC, TOTTUS, WONG, METRO

工程机械代理商 (需判断 — 如果他们也有皮带服务部门则可保留):
FERREYROS (CAT代理), KOMATSU-MITSUI, UNIMAQ, IPESA

`multi_search` 会自动检测大厂噪音并返回 `noise_list`。矿业/百货/工程机械需人工判断。

**重点关注**:
- 公司名包含 `borracha`/`correia`/`vulcanização`/`belt`/`rubber`
- HS编码集中在 4010/4016/8477/5910
- 采购频次 ≥5次/年, 供应商集中3-8家

### 3.5 禁止行为

- 只用一个宽泛关键词就下结论
- 反复点击平台AI功能 (小易AI等)
- 看到 CAT/Scania 就认为搜对了
- 用浏览器手动操作可被工具自动化的步骤

## 四、标准获客工作流

```
teyi_customs action=search (或 multi_search)
    │
    ├── 结果 >0 ──→ 筛选去噪
    │       │
    │       ├── teyi_customs action=enrich company_name="目标公司"
    │       │   └── 获取决策人姓名/职位/LinkedIn
    │       │
    │       └── teyi_customs action=detail detail_url="详情URL"
    │           └── 提取联系方式 + 采购记录
    │
    └── 结果 =0 ──→ web_search (本地语言找服务商)
            │
            └── teyi_customs action=search keyword="找到的公司名" country="国家"
                └── 用公司名回特易查进口记录
```

## 五、国家-大洲映射

| 大洲 | 国家 |
|------|------|
| 南美洲 | 秘鲁、巴西、阿根廷、智利、哥伦比亚 |
| 非洲 | 埃及、南非、尼日利亚、肯尼亚、摩洛哥 |
| 亚洲 | 沙特、阿联酋、印度、越南、印尼、泰国、马来西亚、菲律宾 |
| 北美洲 | 美国、加拿大、墨西哥 |
| 欧洲 | 德国、英国、法国、意大利、西班牙、波兰 |
| 大洋洲 | 澳大利亚、新西兰 |

## 六、常用HS编码

| 编码 | 产品 | 用途 |
|------|------|------|
| 4010 | 硫化橡胶制输送带/传动带 | conveyor belt, rubber belt |
| 4010.10 | 金属增强输送带 | steel cord belt |
| 4010.20 | 纺织增强输送带 | fabric belt |
| 4016 | 硫化橡胶制品 | rubber products, belt repair materials |
| 5910 | 纺织材料制传动带/输送带 | textile belt |
| 8477 | 橡胶/塑料加工机械 | vulcanizer, splicing press, joint machine |
| 7318 | 钢铁制螺钉/螺栓/铆钉 | belt fasteners, clamps |

## 七、数据质量指标

### 采购商评分

| 指标 | 高质量 | 中等 | 低质量 |
|------|--------|------|--------|
| 采购频次 | ≥10次/年 | 5-10次/年 | <5次/年 |
| 采购金额 | >$100k/年 | $50k-100k/年 | <$50k/年 |
| 采购连续性 | 连续3年+ | 1-3年 | <1年 |
| 供应商数量 | 3-5家 | 5-10家 | >10家或1家 |

### 排除条件

- 采购金额 <$10k/年
- 采购频次 <2次/年
- 供应商 >15家 (价格敏感)
- 采购断档 >6个月

## 八、注意事项

- 海关数据有1-3个月延迟
- 金额为申报值, 可能与实际有差异
- 公司名称可能为简称或别名
- Session 超时后 cookies 持久化自动恢复, 不需重新登录
- 并行搜索时每个 variant 独立 session, 互不干扰
- 仅用于商业开发, 遵守数据使用协议

## 九、结果导出格式

```json
{
  "company_name": "ABC Industrial",
  "country": "Peru",
  "hs_code": "4010",
  "product": "PVC conveyor belt",
  "purchase_count": 12,
  "purchase_amount": "$150,000",
  "suppliers": ["Chinese Supplier A", "German Supplier B"],
  "last_purchase": "2026-03-04",
  "trend": "increasing",
  "sources": ["conveyor belt (HS4010)", "correia transportadora"]
}
```

## 十、分析报告模板

```markdown
## 海关数据分析报告 — {产品} / {国家}

### 搜索条件
- 关键词变体: [keyword1, keyword2, ...]
- 目标国家: {国家}
- 结果数: {total} (去重后)

### 噪音排除
- 大厂杂音: {noise_count}条 (已排除)
- 有效客户: {valid_count}条

### 高价值客户 Top 10
| # | 公司 | 来源 | 推荐 |
|---|------|------|------|
| 1 | ... | belt vulcanizer | ⭐⭐⭐ |

### 下一步
1. 对Top10用 enrich 补齐决策人
2. 用 cold-email-generator 生成开发信
3. 特易搜不到的公司用 web_search 找联系方式
```

---
*底层工具*: teyi_customs (teyiCustoms.ts) — BrowserSession + CDP + Exa
*平台*: 特易外贸资讯宝GT7.0
*登录*: https://et.topease.net/login?product=gt
*搜索入口*: https://et.topease.net/gt/company?wlf=sou6_search
*版本*: 3.0.0 (2026-05-08 — 全面对齐 teyiCustoms.ts 工具实现)
