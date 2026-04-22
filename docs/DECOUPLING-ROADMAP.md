# 技能集群维护性改进路线图

> 审查日期：2026-04-22
> 审查范围：`acquisition-agent/skills/` 全部 84 个技能
> 核心目标：**改一处生效全局** — 消除数据散落 30+ 文件的维护痛点
> 真实动机：换电话、换 NAS IP、加新产品、调价格时不用改几十个文件

---

## 一、为什么需要改（真实痛点）

这不是为了"把系统做成可以卖给别人的 SaaS"，而是为了**自己改东西时不痛苦**：

| 日常场景 | 现在 | 改完之后 |
|---------|------|---------|
| 公司换电话号码 | 改 10+ 个文件，可能漏改 | 改 `config/company-profile.json` 1 处 |
| NAS 换 IP 地址 | 改 15+ 个文件，漏改就挂 | 改 `config/infrastructure.json` 1 处 |
| 新增一个产品型号 | 改 3 份产品目录，容易漂移 | 改 `config/products.json` 1 处 |
| 调整 ICP 门槛（比如从 75 改到 70） | 改 5+ 个 references 文件 | 改 `config/business-rules.json` 1 处 |
| 品牌色微调 | 改 3 个 Python 脚本里的 `#D32F2F` | 改 `config/brand.json` 1 处 |
| 业务员入职初始化 | `setup-user.ps1` 不在仓库，流程不透明 | 脚本纳入版本管理，配置标准化 |

---

## 二、现状总览

### 耦合度分布

```
总技能 84 个
├── 完全通用（零耦合）    17 个  ████░░░░░░░░░░░░░░  20%
├── 部分配置化            ~20 个  █████░░░░░░░░░░░░░  24%
└── 深度硬编码            ~47 个  ███████████████░░░  56%
```

### 硬编码关键词统计

| 类别 | 出现次数 | 涉及文件数 |
|------|:--------:|:----------:|
| 公司/品牌名（红龙/HOLO/honglong） | 250+ | 50+ |
| NAS 路径（192.168.0.194） | 120+ | 15+ |
| 产品型号（A2FLJ/A3FLJ/SC130...） | 100+ | 12+ |
| 价格数据（具体 ¥/$ 金额） | 150+ | 8+ |
| 联系方式（邮箱/WhatsApp/电话） | 50+ | 10+ |
| 竞品信息（Beltwin/Flexco/Almex） | 40+ | 8+ |
| 业务规则（ICP≥75/矿业禁止/72h） | 30+ | 5+ |
| 第三方服务（fumamx/teyi） | 50+ | 6+ |
| 品牌资产（#D32F2F/HOLO Red） | 20+ | 3+ |

---

## 二、当前架构（耦合态）

```
┌─────────────────────────────────────────────────────────────────┐
│                        当前架构 — 紧耦合                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  L1: 编排层（3个）                                       │   │
│  │  ┌─────────────────────┐  ┌──────────────────────────┐   │   │
│  │  │ global-customer-     │  │ acquisition-             │   │   │
│  │  │ acquisition          │→│ coordinator              │   │   │
│  │  │ (43文件,全部硬编码)   │  │ (依赖10+技能)             │   │   │
│  │  └─────────┬───────────┘  └──────────┬───────────────┘   │   │
│  │            │                         │                    │   │
│  │  ┌─────────▼─────────────────────────▼───────────────┐   │   │
│  │  │ acquisition-workflow                               │   │   │
│  │  │ references/ 14个文件全部硬编码:                      │   │   │
│  │  │   IRON-RULES.md  ← "矿业禁止"                      │   │   │
│  │  │   ICP-STANDARDS.md  ← "ICP≥75, $1M/$500K/$100K"   │   │   │
│  │  │   HOLO-ICP-PROFILE.md  ← 完整红龙ICP画像            │   │   │
│  │  │   MULTILANG-KEYWORDS.md  ← "红龙核心产品多语言"     │   │   │
│  │  │   ROUTING-TABLE.yaml  ← "红龙获客系统路由表"         │   │   │
│  │  │   SCORING.md  ← "$1M/$500K/$100K" 客户分层          │   │   │
│  │  │   PIPELINE.md  ← "红龙获客系统11步流程"              │   │   │
│  │  └────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌───────────────────────────▼──────────────────────────────┐   │
│  │  L2: 业务技能层（~30个）                                  │   │
│  │                                                           │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │   │
│  │  │ smart-quote  │  │ cold-email-  │  │ holo-social- │    │   │
│  │  │ 103个型号    │  │ generator    │  │ gen          │    │   │
│  │  │ 价格硬编码   │  │ NAS路径硬编码 │  │ 品牌色硬编码 │    │   │
│  │  │ NAS路径硬编码 │  │ 红龙模板硬编码│  │ 产品型号硬编码│    │   │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │   │
│  │         │                 │                  │             │   │
│  │  ┌──────▼─────────────────▼──────────────────▼───────┐    │   │
│  │  │ 共享数据源（3份独立拷贝，无关联）                      │    │   │
│  │  │ ① config/products.json  ← 型号，无价格               │    │   │
│  │  │ ② smart-quote/references/products.md ← 103个价格    │    │   │
│  │  │ ③ honglong-products/references/products.md ← 详情    │    │   │
│  │  │                                                      │    │   │
│  │  │ ⚠️ 重复: global-customer-acquisition/references/     │    │   │
│  │  │    和 acquisition-workflow/references/ 12/13文件相同  │    │   │
│  │  └──────────────────────────────────────────────────────┘    │   │
│  └───────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌───────────────────────────▼──────────────────────────────┐   │
│  │  L3: 基础设施层（17个，完全通用）                          │   │
│  │                                                           │   │
│  │  release-manager · credential-manager · pdf-extract        │   │
│  │  excel-xlsx · web-access · playwright · nano-pdf           │   │
│  │  document-pro · office · bash-patch-safe · cli-anything    │   │
│  │  composio · exa-web-search-free · sdr-humanizer            │   │
│  │  skill-creator · skill-discovery · browser-automation       │   │
│  │                                                           │   │
│  │  ✅ 零耦合，可直接复用                                      │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                 │
│  问题清单:                                                       │
│  ❌ 公司信息分散在 30+ 文件                                      │
│  ❌ NAS IP 硬编码 15+ 处                                         │
│  ❌ 产品目录 3 份独立拷贝                                        │
│  ❌ references/ 12 个文件重复                                     │
│  ❌ skill.yaml dependencies 全部为空                             │
│  ❌ workspace/setup-user.ps1 不在仓库中                          │
│  ❌ company-research/config.json 地区错误                        │
└─────────────────────────────────────────────────────────────────┘
```

### 依赖关系图（DAG，无循环依赖）

```
                          [入口]
                    acquisition-init
                   ╱        │       ╲
          credential-    nas-file-   email-
           manager      reader      sender
               │
         acquisition-dependencies


              [编排层]
    global-customer-acquisition
              │
    acquisition-coordinator
              │
    acquisition-workflow ──── references/ (14个共享文件)
              │
     ┌────────┼────────┬────────────┬──────────┐
     │        │        │            │          │
  [发现]   [情报]    [筛选]      [触达]     [支撑]
  teyi-    company-  ICP评分     cold-email- honglong-
  customs  research              generator  products
  exa-     market-               │          nas-file-
  search   research         humanize-      reader
  facebook deep-research    ai-text      credential-
  instagram customer-         │          manager
  linkedin  intelligence   email-sender  fumamx-crm
              │          delivery-queue sales-pipeline-
              │                         tracker
              │
     ┌───────┴────────┐
     │                │
  [报价链]         [社媒链]
  quotation-      holo-social-gen
  generator          │
     │          holo-social-image
  smart-quote        │
     │          cli-anything-hub
  company-research

  [培训链]
  holo-sales-trainer ──→ honglong-products
                     ──→ inquiry-response
                     ──→ cold-email-generator
```

---

## 三、目标架构（解耦态）

```
┌─────────────────────────────────────────────────────────────────┐
│                        目标架构 — 配置驱动                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  中央配置层（新增）                                       │   │
│  │                                                           │   │
│  │  config/                                                  │   │
│  │  ├── company-profile.json    ← 公司信息（单一权威来源）    │   │
│  │  │     name, brand, address, phone, email,                │   │
│  │  │     website[], competitors[], industry                  │   │
│  │  │                                                        │   │
│  │  ├── infrastructure.json    ← 基础设施配置                  │   │
│  │  │     nas_ip, nas_shares[], smtp, paths[]                │   │
│  │  │                                                        │   │
│  │  ├── products.json          ← 产品目录（单一权威来源）      │   │
│  │  │     models[], pricing[], specs[]                       │   │
│  │  │                                                        │   │
│  │  ├── business-rules.json    ← 业务规则                     │   │
│  │  │     icp_threshold, excluded_industries[],              │   │
│  │  │     customer_tiers[], follow_up_rules                  │   │
│  │  │                                                        │   │
│  │  ├── brand.json             ← 品牌资产                     │   │
│  │  │     colors{}, fonts{}, watermark{}                    │   │
│  │  │                                                        │   │
│  │  └── services.json          ← 第三方服务                    │   │
│  │        crm: {type, endpoint},                             │   │
│  │        customs: {type, endpoint},                         │   │
│  │        email: {type, endpoint}                            │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                              │ 引用                              │
│  ┌───────────────────────────▼──────────────────────────────┐   │
│  │  L1: 编排层（不变，但引用配置而非硬编码）                    │   │
│  │                                                           │   │
│  │  references/ → 从 acquisition-workflow/references/ 精简   │   │
│  │    IRON-RULES.md    → 引用 business-rules.json            │   │
│  │    ICP-STANDARDS.md → 引用 business-rules.json            │   │
│  │    HOLO-ICP-PROFILE.md → 改为通用 ICP-PROFILE.md          │   │
│  │    MULTILANG-KEYWORDS.md → 引用 products.json i18n        │   │
│  │    ROUTING-TABLE.yaml → 保留（技能路由，不含业务数据）     │   │
│  │    SCORING.md       → 引用 business-rules.json tiers      │   │
│  │    PIPELINE.md      → 保留（流程定义，不含业务数据）       │   │
│  └───────────────────────────┬───────────────────────────────┘   │
│                              │                                   │
│  ┌───────────────────────────▼──────────────────────────────┐   │
│  │  L2: 业务技能层（引用 config/ 而非硬编码）                  │   │
│  │                                                           │   │
│  │  smart-quote       → 读 config/products.json              │   │
│  │  cold-email-gen    → 读 config/company-profile.json       │   │
│  │  holo-social-gen   → 读 config/brand.json + products.json │   │
│  │  inquiry-response  → 读 config/products.json              │   │
│  │  email-sender      → 读 config/company-profile.json       │   │
│  │  linkedin/whatsapp → 读 config/company-profile.json       │   │
│  └───────────────────────────┬───────────────────────────────┘   │
│                              │                                   │
│  ┌───────────────────────────▼──────────────────────────────┐   │
│  │  L3: 基础设施层（不变）                                   │   │
│  │  ✅ 17个通用技能，零修改                                   │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                 │
│  改进效果:                                                       │
│  ✅ 公司信息集中在 1 个文件（改电话号码改 1 处）                   │
│  ✅ NAS IP 集中在 1 个文件（换 IP 改 1 处）                      │
│  ✅ 产品目录统一为 1 份（加产品改 1 处）                          │
│  ✅ references/ 无重复（不会改了 A 忘了 B）                       │
│  ✅ skill.yaml 声明真实依赖（机器可解析）                         │
│  ✅ workspace/setup 纳入版本管理                                 │
│  ✅ 所有业务数据变更只需要改 config/ 下的 JSON 文件               │
└─────────────────────────────────────────────────────────────────┘
```

### 目标依赖关系图（不变，但数据流清晰化）

```
  [中央配置]
  config/
  ├── company-profile.json ──┐
  ├── infrastructure.json ───┤
  ├── products.json ─────────┤  ← 所有业务技能从这里读取
  ├── business-rules.json ───┤     不再各自硬编码
  ├── brand.json ────────────┤
  └── services.json ─────────┘
           │
           ▼
  ┌────────────────────────────────────────┐
  │           技能执行层（不变）              │
  │                                        │
  │  编排器 → 业务技能 → 基础设施            │
  │  (依赖关系 DAG 不变)                    │
  │  (skill.yaml 补全真实依赖)              │
  └────────────────────────────────────────┘
```

---

## 四、改进路线图

### Phase 0: 快速修复（1天）

> 修复已发现的 bug 和明显错误

| # | 任务 | 文件 | 说明 |
|---|------|------|------|
| 0.1 | 修正地区配置 | `company-research/config.json` | `"region": "浙江"`, `"focus_area": "温州瑞安"` 已修正 ✅ |
| 0.2 | 确认 setup 脚本状态 | `workspace/setup-user.ps1` | 确认是否存在于部署环境，决定是否纳入仓库 |
| 0.3 | 清理 `deep-research` 别名 | `customer-intelligence/SKILL.md` | 统一使用 `deep-research` 或 `in-depth-research` |

### Phase 1: 中央配置（P0，3-5天）

> 建立单一权威来源，消除最大耦合点

| # | 任务 | 影响范围 | 改动量 |
|---|------|:--------:|:------:|
| 1.1 | 创建 `config/company-profile.json` | 30+ 文件引用此配置 | 新建 1 文件，改 30+ 文件 |
| 1.2 | 创建 `config/infrastructure.json` | 15+ 文件 | 新建 1 文件，改 15+ 文件 |
| 1.3 | NAS IP 全部替换为 `${env.NAS_IP}` 或读取 infrastructure.json | 15+ 文件 | 批量替换 |
| 1.4 | 公司联系方式全部替换为读取 company-profile.json | 10+ 文件 | 批量替换 |

**company-profile.json 示例结构：**
```json
{
  "company": {
    "name_zh": "温州红龙工业设备制造有限公司",
    "name_en": "HOLO Industrial Equipment Mfg Co., Ltd",
    "brand": "HOLO",
    "address_zh": "瑞安市东山街道望新路188号3幢101室",
    "address_en": "Ruian, Wenzhou, Zhejiang 325200, China",
    "phone": "+86 0577-66856856",
    "mobile": "+86 18057753889",
    "email": "sale@18816.cn",
    "websites": {
      "domestic": "www.18816.cn",
      "international": "www.beltsplicepress.com",
      "brand": "www.holobelt.com",
      "pu_belt": "www.aibelt.com"
    },
    "factory_location": "中国温州"
  },
  "competitors": {
    "own_brands": ["Beltwin"],
    "rivals": ["Flexco", "Almex", "ASGCO", "ContiTech", "Fonmar"]
  },
  "team": {
    "default_name": "红龙团队"
  }
}
```

**infrastructure.json 示例结构：**
```json
{
  "nas": {
    "ip": "192.168.0.194",
    "shares": {
      "marketing": "Y:\\\\192.168.0.194\\市场营销",
      "sales": "X:\\\\192.168.0.194\\销售",
      "home": "Z:\\\\192.168.0.194\\home",
      "pricing": "W:\\\\192.168.0.194\\公司报价资料",
      "ai_data": "\\\\192.168.0.194\\AI数据"
    },
    "env_user": "NAS_USER",
    "env_pass": "NAS_PASSWORD"
  },
  "paths": {
    "workbuddy": "C:/Users/${USERNAME}/WorkBuddy/",
    "chromadb": "C:/Users/${USERNAME}/chromadb/acquisition/",
    "lancedb": "C:/Users/${USERNAME}/lancedb/acquisition/"
  }
}
```

### Phase 2: 数据统一（P1，3-5天）

> 消除数据冗余，建立单一产品目录

| # | 任务 | 影响范围 | 改动量 |
|---|------|:--------:|:------:|
| 2.1 | 合并产品目录为 `config/products.json`（含价格+规格+i18n） | 3 份拷贝 → 1 份 | 新建 1 文件，改 12+ 文件 |
| 2.2 | 删除 `global-customer-acquisition/references/` 重复目录 | 12 个文件删除 | 删除 |
| 2.3 | `skill.yaml` 补全真实依赖声明 | 23 个 skill.yaml | 小改动 |
| 2.4 | 创建 `config/business-rules.json` 外置业务规则 | 5+ references 文件 | 新建 1 文件，改 5+ 文件 |

**products.json 示例结构：**
```json
{
  "categories": [
    {
      "id": "air_cooled_press",
      "name_zh": "风冷皮带接头机",
      "name_en": "Air Cooled Splice Press",
      "series": [
        {
          "id": "A3FLJ",
          "name_zh": "三代风冷机",
          "name_en": "3rd Gen Air Cooled Press",
          "models": [
            {
              "code": "A3FLJ600-00-00",
              "name_zh": "小三代风冷机600",
              "name_en": "3rd Gen 600mm",
              "specs": {"width_mm": 600, "pressure_bar": 12},
              "price_cny_ex_tax": 23750,
              "stock_status": "常规库存",
              "website_url": "https://www.beltsplicepress.com/..."
            }
          ]
        }
      ]
    }
  ],
  "pricing_rules": {
    "tax_rate": 0.13,
    "custom_surcharge_min": 0.10,
    "custom_surcharge_max": 0.30,
    "mold_fee": {"guide_bar": 1000, "welding": 600, "first_mold": 12000}
  },
  "i18n": {
    "air_cooled_press": {
      "en": "Air Cooled Splice Press",
      "es": "Prensa Enfriada por Aire",
      "pt": "Prensas Resfriadas a Ar",
      "ar": "صانعة لحام الأحزمة",
      "ru": "Вулканизатор с воздушным охлаждением",
      "fr": "Presse à refroidissement d'air",
      "de": "Kühl-Pressmaschine",
      "ko": "공랭식 스플라이스 프레스",
      "ja": "空冷式スプライスプレス",
      "zh": "风冷皮带接头机"
    }
  }
}
```

**business-rules.json 示例结构：**
```json
{
  "icp": {
    "minimum_score": 75,
    "dimensions": [
      {
        "name": "行业匹配度",
        "weight": 0.3,
        "target_industries": ["输送带制造商", "水泥厂", "港口", "物流"],
        "excluded_industries": ["矿业", "采石场"]
      }
    ]
  },
  "customer_tiers": [
    {"tier": "A", "annual_revenue_usd": 1000000},
    {"tier": "B", "annual_revenue_usd": 500000},
    {"tier": "C", "annual_revenue_usd": 100000}
  ],
  "iron_rules": [
    {"id": "icp_gate", "rule": "ICP评分 >= 75 才继续", "severity": "block"},
    {"id": "no_mining", "rule": "禁止接触矿业客户", "severity": "block"},
    {"id": "decision_maker_email", "rule": "必须决策人邮箱，禁用 info@/sales@", "severity": "block"},
    {"id": "price_approval", "rule": "客户问价必须锁对话等审批", "severity": "block"},
    {"id": "whatsapp_72h", "rule": "72h窗口外禁止主动推送", "severity": "warn"}
  ],
  "email_rules": {
    "domain_blacklist": ["info@", "sales@", "support@"],
    "forbidden_content": ["具体金额", "$", "¥"]
  }
}
```

### Phase 3: 品牌与样式外置（P2，2-3天）

> 将视觉品牌资产参数化

| # | 任务 | 影响范围 | 改动量 |
|---|------|:--------:|:------:|
| 3.1 | 创建 `config/brand.json` | 3 个社媒技能 | 新建 1 文件，改 3+ 文件 |
| 3.2 | 社媒脚本读取品牌色/字体/水印配置 | `holo-social-gen/`, `holo-social-image/`, `holo-social-infographic/` | 改 5+ 脚本 |
| 3.3 | 创建 `config/services.json` 外置第三方服务 | `fumamx-crm/`, `teyi-customs/`, `acquisition-init/` | 新建 1 文件，改 6+ 文件 |

**brand.json 示例结构：**
```json
{
  "brand": {
    "name": "HOLO",
    "name_zh": "红龙",
    "slogan_en": "Leading Industrial Belt Equipment Manufacturer",
    "slogan_zh": "工业皮带设备制造商",
    "colors": {
      "primary": "#D32F2F",
      "primary_name": "HOLO Red",
      "secondary": "#1976D2",
      "background": "#FFFFFF",
      "text": "#212121"
    },
    "fonts": {
      "heading": "Arial Bold",
      "body": "Arial"
    },
    "watermark": {
      "text": "HOLO Industrial Equipment",
      "opacity": 0.15,
      "position": "bottom-right"
    },
    "social_hashtags": ["#conveyorbelt", "#beltsplicing", "#HOLO"]
  }
}
```

### Phase 4: 技能声明规范化（P3，2-3天）

> 让依赖关系可被机器解析

| # | 任务 | 影响范围 | 改动量 |
|---|------|:--------:|:------:|
| 4.1 | 23 个 `skill.yaml` 补全 `dependencies` 字段 | 23 个文件 | 批量小改动 |
| 4.2 | references 文件去除硬编码公司名，改为通用模板 | 14 个 references 文件 | 中等改动 |
| 4.3 | `workspace/setup-user.ps1` 纳入版本管理 | 1 个文件 | 小改动 |

---

## 五、预期效果

### 改进前 vs 改进后对比

| 指标 | 改进前 | 改进后 |
|------|:------:|:------:|
| 公司信息定义点 | 30+ 处 | 1 处 |
| NAS IP 定义点 | 15+ 处 | 1 处 |
| 产品目录副本 | 3 份（会漂移） | 1 份（单一权威） |
| references 重复文件 | 12 个 | 0 个 |
| skill.yaml 有效依赖 | 0/23 | 23/23 |
| 改电话/改 IP 需改文件数 | 10-15 个 | 1 个 |
| 完全通用技能 | 17/84 (20%) | 17/84 (20%) |
| 配置化技能 | 20/84 (24%) | 67/84 (80%) |

### 真实场景验证

```
场景1: 公司换了 WhatsApp 号码
  改进前: 改 ai-social-media-content/SKILL.md (12处)
          + holo-social-image/SKILL.md
          + holo-social-infographic/scripts/gen_compare_long.py
          + whatsapp-outreach/scripts/whatsapp_bulk_send.py
          + linkedin/SKILL.md
          + email-sender/scripts/send-batch-emails.ps1
          + ... 可能还有漏的
  改进后: 改 config/company-profile.json 里的 "mobile" 字段，1处搞定

场景2: 新增一款产品（比如四代风冷机 A4FLJ）
  改进前: 改 smart-quote/references/products.md (加价格行)
          + honglong-products/references/products.md (加详情)
          + global-customer-acquisition/config/products.json (加型号)
          + holo-social-gen/data/product_data.py (加型号映射)
          + holo-social-gen/data/i18n/locales.yaml (加9种语言翻译)
          + holo-social-infographic/scripts/product_db.py (加规格)
          + ... 7+ 个文件
  改进后: 改 config/products.json 里加一个 model 对象，1处搞定
```

---

## 六、风险与注意事项

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 技能读取 config 的方式不统一（SKILL.md 是 Markdown，不是代码） | 部分技能无法 `import` JSON | 在 SKILL.md 指令中写明"先读取 config/xxx.json"，AI 执行时按指令读取 |
| Python 脚本可以 `import json`，但 SKILL.md 指令只能靠 AI 理解 | AI 可能忽略配置直接用硬编码值 | 在 SKILL.md 开头加强制指令："所有公司信息必须从 config/ 读取" |
| acquisition-init 的初始化流程需要适配新配置结构 | 新业务员首次配置体验 | 更新 setup-user.ps1 生成新格式配置 |
| NAS 价格文件仍是外部权威来源 | config 里的价格可能过期 | config/products.json 标注"NAS 报价参考表.xlsx 为权威来源，此处为缓存" |
| 改动量大（30+ 文件） | 需要分批推进，不能一次性全改 | 严格按 Phase 分批，每批独立可测试 |

---

## 七、附录：技能耦合度分类清单

### 完全通用（零耦合，不需要改）— 17 个

`bash-patch-safe` · `browser-automation` · `cli-anything-hub` · `composio` ·
`data-automation-service` · `document-pro` · `exa-web-search-free` · `excel-xlsx` ·
`MCP管理器` · `nano-pdf` · `office` · `pdf-smart-tool-cn` · `playwright` ·
`sdr-humanizer` · `skill-creator` · `skill-discovery` · `web-access`

### 部分配置化（改为读 config 即可）— ~20 个

`acquisition-coordinator` · `acquisition-init` · `acquisition-workflow` ·
`company-research` · `cold-email-generator` · `credential-manager` ·
`customer-deduplication` · `customer-intelligence` · `daily-report-writer` ·
`delivery-queue` · `email-sender` · `fumamx-crm` · `follow-up-signal-monitor` ·
`holo-heartbeat-executor` · `holo-updater` · `knowledge-base` ·
`linkedin-writer` · `nas-file-reader` · `quotation-generator` ·
`sales-pipeline-tracker` · `sdr-training-ground` · `teyi-customs` ·
`whatsapp-outreach` · `holo-sales-trainer` · `holo-proposal-generator` ·
`market-research` · `deep-research` · `inquiry-response`

### 深度硬编码（需提取硬编码值到 config）— ~47 个

`acquisition-dependencies` · `acquisition-development-notes` ·
`acquisition-evaluator` · `agent-reach-setup` · `ai-social-media-content` ·
`business-development` · `calendar-skill` · `crm` · `email-inbox` ·
`evolver` · `facebook-acquisition` · `graphify` · `holo-activity-log` ·
`holo-social-gen` · `holo-social-image` · `holo-social-infographic` ·
`honglong-assistant` · `honglong-products` · `instagram-acquisition` ·
`linkedin` · `market-development-report` · `proactive-agent` ·
`proactive-agent-lite` · `release-manager` · `routing-table-audit` ·
`sales` · `skill-auditor` · `skill-finder-cn` · `skill-onboarding-checklist` ·
`skill-system-audit` · `smart-memory` · `smart-quote` · `supermemory` ·
`telegram-toolkit` · `web-content-fetcher` · `global-customer-acquisition` ·
及其他含 `name: 红龙团队` 的 skill.yaml 文件

> **注**: "深度硬编码"中的大部分在完成 Phase 1-3 配置外置后，实际只需改为"先读取 config/xxx.json"。真正需要结构性重构的只有 `honglong-products`（整个技能围绕红龙产品知识库构建）和 `honglong-assistant`（身份绑定为红龙小助手）——但这两个技能本身就是红龙专属的，不需要通用化。
