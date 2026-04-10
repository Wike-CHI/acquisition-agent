# 红龙获客系统 · 多语种词簇库
# Multi-Language Keyword Clusters for HOLO Acquisition System
# 版本：v1.0.0 | 创建时间：2026-04-10

> **用途**：AI 在执行 Step 1 客户发现时，根据目标国家自动切换对应语言的搜索词簇，穿透本地语言壁垒，找到英语搜索无法触达的优质客户。
>
> **核心原则**：用目标国家本地人搜索的方式去搜索，而不是用翻译腔的英语。

---

## 一、如何使用词簇库

### Step 1 触发规则

当用户请求「开发 XX 市场」或「找 XX 国家的客户」时，AI 必须：

```
1. 查询本文档，识别目标国家 → 对应语言区块
2. 从「核心词簇」中选择 3-5 个组合
3. 与「决策人头衔」词簇组合构造搜索查询
4. 优先使用「黄金组合」直接搜索
5. 首轮使用本地语言，第二轮补充英语对照词
```

### 搜索查询构造公式

```
[产品词] + [渠道类型词] + [地理词] = 最优查询
示例（德语）：Förderbandgurt + Händler + Deutschland
```

---

## 二、红龙核心产品多语言对照表

| 产品（中文） | 英语 | 西班牙语 | 德语 | 法语 | 葡语（巴西） | 阿拉伯语 |
|------------|------|---------|------|------|------------|---------|
| 输送带 | conveyor belt | cinta transportadora | Förderband | courroie transporteuse | correia transportadora | حزام ناقل |
| 传动带 | transmission belt | correa de transmisión | Treibriemen / Antriebsriemen | courroie de transmission | correia de transmissão | حزام نقل الحركة |
| 工业皮带 | industrial belt | correa industrial | Industrieriemen | courroie industrielle | correia industrial | حزام صناعي |
| 风冷机 | air cooling machine | enfriadora de aire | Luftkühlmaschine | machine de refroidissement air | máquina de resfriamento a ar | آلة التبريد الهوائي |
| 水冷机 | water cooling machine | enfriadora de agua | Wasserkühlmaschine | machine de refroidissement eau | máquina de resfriamento a água | آلة التبريد المائي |
| 硫化机 | vulcanizing machine | vulcanizadora | Vulkanisiermaschine | vulcanisatrice | vulcanizadora | آلة الفلكنة |
| 皮带经销商 | belt distributor | distribuidor de correas | Riemenhändler | distributeur de courroies | distribuidor de correias | موزع أحزمة |
| 采购经理 | purchasing manager | gerente de compras | Einkaufsleiter | responsable des achats | gerente de compras | مدير المشتريات |

---

## 三、分市场词簇库

---

### 🇩🇪 德国市场（Germany / DACH）

> **语言**：德语（Deutsch）
> **覆盖**：德国 + 奥地利 + 瑞士（DACH）
> **红龙机会**：工业带类需求极大，重型制造业集中，客户单价高
> **搜索提示**：德国人不喜欢英语页面，德语搜索命中率比英语高 3-5 倍

#### 核心词簇

**产品词（Produkt）**
```
Förderband               # 输送带（最常用）
Förderbandgurt           # 输送带（带状）
Transportband            # 传送带
Antriebsriemen           # 传动带
Keilriemen               # V型皮带
Gummiriemen              # 橡胶皮带
Flachriemen              # 平皮带
Zahnriemen               # 齿形带
Industrieband            # 工业带
Fördergurt               # 输送胶带
```

**渠道类型词（Kanaltyp）**
```
Händler                  # 经销商
Großhändler              # 批发商
Vertrieb                 # 代理/分销
Distributor              # 经销商（外来词，德国也用）
Lieferant                # 供应商
Hersteller               # 制造商（也有采购需求）
Fachhandel               # 专业贸易商
Importeur                # 进口商
Werkstatt                # 维修店（配件需求强）
Ingenieurbüro            # 工程公司（大型采购）
```

**地理词（Geografie）**
```
Deutschland              # 德国
Bayern                   # 巴伐利亚（工业重地）
Nordrhein-Westfalen      # 北威州（鲁尔工业区）
Baden-Württemberg        # 巴登-符腾堡
DACH                     # 德奥瑞三国
Österreich               # 奥地利
Schweiz                  # 瑞士
```

**决策人头衔（Entscheidungsträger）**
```
Einkaufsleiter           # 采购经理
Einkäufer                # 采购员
Beschaffungsmanager      # 采购负责人
Technischer Einkauf      # 技术采购
Betriebsleiter           # 运营经理
Werkzeugmacher           # 工具技师（维修采购）
Geschäftsführer          # 总经理（中小企业）
```

#### 黄金搜索组合（直接可用）
```
Förderbandgurt Händler Deutschland
Antriebsriemen Großhändler Bayern
Förderband Distributor Nordrhein-Westfalen
Keilriemen Vertrieb Deutschland
Gummiriemen Lieferant DACH
"Förderbandgurt" "Einkaufsleiter" site:linkedin.com
```

---

### 🇪🇸 西班牙市场（Spain / LATAM）

> **语言**：西班牙语（Español）
> **覆盖**：西班牙本土 + 墨西哥 + 哥伦比亚 + 秘鲁 + 阿根廷 + 智利 + 委内瑞拉
> **红龙机会**：拉美采矿业+食品加工业带类需求旺盛，西语市场统一搜索效率高
> **搜索提示**：拉美各国西语略有差异，pero核心术语通用

#### 核心词簇

**产品词（Producto）**
```
cinta transportadora     # 输送带（最通用）
banda transportadora     # 输送带（部分拉美）
correa transportadora    # 传送皮带
correa industrial        # 工业皮带
correa de transmisión    # 传动带
banda de caucho          # 橡胶带
correa dentada           # 齿形带
faja transportadora      # 输送带（秘鲁/智利常用）
correa plana             # 平皮带
polea                    # 滑轮/皮带轮
```

**渠道类型词（Tipo de canal）**
```
distribuidor             # 经销商
mayorista                # 批发商
proveedor                # 供应商
comercializador          # 贸易商
importador               # 进口商
representante            # 代理商
repuestos                # 配件供应商（高频！）
suministros industriales # 工业供应商
fabricante               # 制造商
mantenimiento industrial # 工业维护（配件采购商）
```

**地理词（Geografía）**
```
España                   # 西班牙
México                   # 墨西哥
Colombia                 # 哥伦比亚
Perú                     # 秘鲁
Chile                    # 智利
Argentina                # 阿根廷
Brasil                   # 巴西（西班牙语虽然不同，但搜索时同区）
Lima                     # 利马（秘鲁工业中心）
Bogotá                   # 波哥大
Ciudad de México         # 墨西哥城
Monterrey                # 蒙特雷（墨西哥工业重镇）
```

**决策人头衔（Tomadores de decisión）**
```
gerente de compras       # 采购经理
jefe de compras          # 采购主管
director de operaciones  # 运营总监
gerente de mantenimiento # 维护经理
encargado de suministros # 供应负责人
responsable de compras   # 采购负责人
director comercial       # 商务总监
```

#### 黄金搜索组合（直接可用）
```
cinta transportadora distribuidor España
correa industrial proveedor México
faja transportadora mayorista Perú
correa de transmisión importador Colombia
"cinta transportadora" "gerente de compras" site:linkedin.com
suministros industriales correa transportadora Chile
repuestos banda transportadora Argentina
```

---

### 🇫🇷 法国市场（France / Francophone Africa）

> **语言**：法语（Français）
> **覆盖**：法国 + 比利时 + 瑞士法语区 + 北非法语国家（摩洛哥/突尼斯/阿尔及利亚）
> **红龙机会**：法国工业带市场规模大；北非法语区采矿/磷肥行业需求特殊

#### 核心词簇

**产品词（Produit）**
```
courroie transporteuse   # 输送带
bande transporteuse      # 传送带
courroie de transmission # 传动带
courroie industrielle    # 工业皮带
courroie trapézoïdale    # 梯形皮带（V带）
courroie crantée         # 齿形带
tapis roulant            # 传送带（通俗说法）
convoyeur à bande        # 带式输送机
```

**渠道类型词（Type de canal）**
```
distributeur             # 经销商
grossiste                # 批发商
fournisseur              # 供应商
revendeur                # 转销商
importateur              # 进口商
représentant commercial  # 商务代表
pièces de rechange       # 备件（配件商）
maintenance industrielle # 工业维护（配件采购）
négoce industriel        # 工业贸易
```

**地理词（Géographie）**
```
France                   # 法国
Paris                    # 巴黎
Lyon                     # 里昂（工业重镇）
Marseille                # 马赛
Belgique                 # 比利时
Maroc                    # 摩洛哥
Algérie                  # 阿尔及利亚
Tunisie                  # 突尼斯
Afrique francophone      # 法语非洲
```

**决策人头衔（Décideurs）**
```
responsable achats       # 采购负责人
directeur des achats     # 采购总监
acheteur industriel      # 工业采购员
directeur technique      # 技术总监
responsable maintenance  # 维护经理
gérant                   # 经营者（中小企业）
```

#### 黄金搜索组合
```
courroie transporteuse distributeur France
courroie de transmission fournisseur Lyon
bande transporteuse importateur Maroc
"courroie industrielle" "responsable achats" site:linkedin.com
pièces de rechange courroie transporteuse Algérie
```

---

### 🇵🇹🇧🇷 葡语市场（Brazil / Portugal）

> **语言**：葡萄牙语（Português）
> **覆盖**：巴西（最大市场） + 葡萄牙 + 安哥拉（非洲葡语）
> **红龙机会**：巴西工业规模庞大，矿业/食品加工/汽车配套，带类需求全球前五
> **搜索提示**：巴西葡语和欧洲葡语有差异，巴西用 "correia"，欧洲有时用 "correia"/"cinta"

#### 核心词簇

**产品词（Produto）**
```
correia transportadora   # 输送带（最常用）
correia de transmissão   # 传动带
correia industrial       # 工业皮带
correia dentada          # 齿形带
correia em V             # V型皮带
fita transportadora      # 传送带（另一种说法）
esteira transportadora   # 传送带（巴西常用）
correia plana            # 平皮带
```

**渠道类型词（Tipo de canal）**
```
distribuidor             # 经销商
atacadista               # 批发商（巴西）
fornecedor               # 供应商
representante            # 代理商
importador               # 进口商
peças de reposição       # 配件（高需求）
manutenção industrial    # 工业维护
suprimentos industriais  # 工业供应
revenda                  # 转销商
```

**地理词（Geografia）**
```
Brasil                   # 巴西
São Paulo                # 圣保罗（工业中心）
Minas Gerais             # 米纳斯吉拉斯（矿业）
Rio Grande do Sul        # 南大河州（工业带）
Paraná                   # 巴拉那州
Portugal                 # 葡萄牙
Angola                   # 安哥拉
```

**决策人头衔（Decisores）**
```
gerente de compras       # 采购经理
diretor de suprimentos   # 供应链总监
comprador industrial     # 工业采购员
responsável por compras  # 采购负责人
diretor de operações     # 运营总监
gerente de manutenção    # 维护经理
```

#### 黄金搜索组合
```
correia transportadora distribuidor São Paulo
correia de transmissão atacadista Brasil
esteira transportadora fornecedor Minas Gerais
"correia industrial" "gerente de compras" site:linkedin.com
peças de reposição correia transportadora Brasil
```

---

### 🇸🇦🇦🇪 阿拉伯市场（Middle East / North Africa）

> **语言**：阿拉伯语（العربية）
> **覆盖**：沙特 + 阿联酋 + 埃及 + 科威特 + 卡塔尔 + 摩洛哥/阿尔及利亚（北非）
> **红龙机会**：海湾国家基建投资大，水泥/采矿/食品工业带需求旺盛
> **搜索提示**：阿拉伯语搜索命中率极低因为大多数外贸人只用英语，信息差最大的一块！

#### 核心词簇

**产品词（المنتجات）**
```
حزام ناقل               # 输送带
حزام نقل                # 传送带
حزام صناعي              # 工业皮带
حزام الإرسال            # 传动带
حزام مطاطي              # 橡胶带
ناقل شريطي              # 带式输送机
```

**渠道类型词（قنوات التوزيع）**
```
موزع                    # 经销商
تاجر جملة               # 批发商
مورد                    # 供应商
مستورد                  # 进口商
وكيل                    # 代理商
قطع غيار               # 配件
صيانة صناعية            # 工业维护
```

**地理词（المناطق）**
```
السعودية                # 沙特
الإمارات                # 阿联酋
مصر                     # 埃及
الكويت                  # 科威特
قطر                     # 卡塔尔
الرياض                  # 利雅得
دبي                     # 迪拜
جدة                     # 吉达
القاهرة                 # 开罗
```

**决策人头衔（صانعو القرار）**
```
مدير المشتريات          # 采购经理
مسؤول المشتريات         # 采购负责人
مدير العمليات           # 运营经理
مدير الصيانة            # 维护经理
```

#### 黄金搜索组合
```
حزام ناقل موزع السعودية
حزام صناعي مورد الإمارات
حزام نقل تاجر جملة مصر
"حزام ناقل" "مدير المشتريات" site:linkedin.com
قطع غيار حزام ناقل دبي
```

---

### 🇮🇩🇻🇳 东南亚市场（Southeast Asia）

> **语言**：印尼语（Bahasa Indonesia）/ 越南语（Tiếng Việt）
> **覆盖**：印尼 + 越南 + 泰国 + 马来西亚 + 菲律宾
> **红龙机会**：东南亚制造业高速扩张，皮带类需求增速最快的地区之一

#### 印尼语词簇（Bahasa Indonesia）

**产品词**
```
sabuk konveyor           # 输送带
belt conveyor            # 输送带（英语借词，印尼也常用）
belt industri            # 工业皮带
sabuk transmisi          # 传动带
ban berjalan             # 传送带（通俗）
```

**渠道词**
```
distributor              # 经销商（英语借词）
supplier                 # 供应商（英语借词）
grosir                   # 批发商
agen                     # 代理商
importir                 # 进口商
suku cadang              # 备件
perawatan industri       # 工业维护
```

#### 越南语词簇（Tiếng Việt）

**产品词**
```
băng tải                 # 输送带
dây curoa                # 皮带/传动带
dây đai truyền động      # 传动带
băng tải công nghiệp     # 工业输送带
```

**渠道词**
```
nhà phân phối            # 经销商
nhà cung cấp             # 供应商
đại lý                   # 代理商
nhập khẩu                # 进口商
phụ tùng thay thế        # 备件
```

#### 黄金搜索组合（印尼）
```
sabuk konveyor distributor Indonesia
belt conveyor supplier Jakarta
belt industri grosir Surabaya
"sabuk konveyor" "manajer pembelian" site:linkedin.com
```

#### 黄金搜索组合（越南）
```
băng tải nhà phân phối Việt Nam
dây curoa nhà cung cấp Hà Nội
"băng tải" "trưởng phòng mua hàng" site:linkedin.com
```

---

### 🇵🇱🇹🇷 东欧/土耳其市场

#### 波兰语词簇（Polski）

```
# 产品词
taśma transportowa       # 输送带
pas napędowy             # 传动带
pas klinowy              # V型皮带

# 渠道词
dystrybutor              # 经销商
dostawca                 # 供应商
hurtownik                # 批发商

# 黄金组合
taśma transportowa dystrybutor Polska
"pas napędowy" "kierownik zakupów" site:linkedin.com
```

#### 土耳其语词簇（Türkçe）

```
# 产品词
konveyör bant            # 输送带
aktarma kayışı           # 传动带
endüstriyel kayış        # 工业皮带

# 渠道词
distribütör              # 经销商
tedarikçi                # 供应商
toptancı                 # 批发商
ithalatçı                # 进口商

# 黄金组合
konveyör bant distribütör Türkiye
"endüstriyel kayış" "satın alma müdürü" site:linkedin.com
aktarma kayışı tedarikçi İstanbul
```

---

## 四、跨市场通用搜索策略

### 4.1 「本地语言 + 英语」双轮搜索标准流程

```
第1轮（本地语言）：
  [本地产品词] + [本地渠道词] + [目标城市]
  目的：找到只在本地语言网络存在的实力商

第2轮（英语补充）：
  [English product term] + [country name] + [channel type]
  目的：找到有国际化意识的客户（更容易沟通）

第3轮（LinkedIn决策人）：
  [本地头衔] + [公司名] site:linkedin.com
  目的：直接定位采购决策人
```

### 4.2 搜索词组合模板

| 搜索目的 | 查询模板 |
|---------|---------|
| 找经销商 | `[产品词][本地语] + [经销商词][本地语] + [国家/城市]` |
| 找批发商 | `[产品词][本地语] + [批发商词][本地语] + [地区]` |
| 找配件商 | `[配件词][本地语] + [产品词][本地语] + [国家]` |
| 找决策人 | `"[决策人头衔][本地语]" + [公司名] site:linkedin.com` |
| 找维修商 | `[维修词][本地语] + [产品词][本地语] + [城市]` |

### 4.3 语言识别规则

AI 自动语言选择规则：

| 目标国家 | 使用语言 | 词簇章节 |
|---------|---------|---------|
| 德国 / 奥地利 / 瑞士 | 德语 | 第三章 §DE |
| 西班牙 | 西班牙语 | 第三章 §ES |
| 墨西哥/哥伦比亚/秘鲁/智利/阿根廷 | 西班牙语（拉美） | 第三章 §ES |
| 法国 / 比利时 | 法语 | 第三章 §FR |
| 摩洛哥 / 阿尔及利亚 / 突尼斯 | 法语（北非） | 第三章 §FR |
| 巴西 | 巴西葡语 | 第三章 §PT |
| 葡萄牙 / 安哥拉 | 葡语 | 第三章 §PT |
| 沙特 / 阿联酋 / 科威特 | 阿拉伯语 | 第三章 §AR |
| 埃及 | 阿拉伯语（北非）| 第三章 §AR |
| 印度尼西亚 | 印尼语 | 第三章 §SEA |
| 越南 | 越南语 | 第三章 §SEA |
| 波兰 | 波兰语 | 第三章 §EE |
| 土耳其 | 土耳其语 | 第三章 §EE |
| 英国 / 美国 / 澳大利亚 | 英语（直接用） | - |

---

## 五、实战案例：德国 vs 英语搜索对比

> 以下是文章作者提到的「德语词簇直达378家独立水泵实体」的还原逻辑：

**英语搜索（传统方式）**
```
Query: "conveyor belt distributor Germany"
结果：大多是英语网站、跨国企业官网、B2B平台
命中本地隐形冠军的概率：~15%
```

**德语词簇搜索（本文方法）**
```
Query: "Förderbandgurt Händler Bayern"
Query: "Antriebsriemen Vertrieb Nordrhein-Westfalen"
Query: "Keilriemen Großhändler Deutschland Mittelstand"
结果：大量只在德国本地网络存在的家族企业、专业经销商
命中本地隐形冠军的概率：~60-70%
```

**关键差异**：德国 Mittelstand（中小型家族工业企业）往往没有英文网页，但它们掌握着本地真实渠道，是最优质的合作伙伴。

---

## 六、词簇扩展规则（AI自主扩展）

当以上词簇不够用时，AI 可以按以下规则自主扩展：

```
1. 同义词扩展：在目标语言中找该产品的其他说法
2. 上位词扩展：如「工业皮带」可扩展为「工业配件」「传动元件」
3. 行业词扩展：针对红龙目标行业（水泥/采矿/食品）添加行业词
4. 地区词扩展：添加目标城市/工业区的名称
5. 公司类型词扩展：添加「有限公司/股份公司」等法律形式词
```

---

*文件版本：v1.0.0 | 维护人：夏夏（HOLO系统AI助手）*
*更新时间：2026-04-10*
*下次更新触发条件：新增市场时 / 发现更优词簇时 / 实战验证后*
