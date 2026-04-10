---
name: Market Development Report
slug: market-development-report
version: 1.0.0
description: 市场开发调研报告技能。当用户说「开发XX市场」「开发南美」「开发非洲」等时，自动生成结构化的目标市场分析报告，包含市场规模、竞争格局、关税政策、开发优先级、获客关键词。
triggers:
  - 开发市场
  - 开发南美
  - 开发非洲
  - 开发东南亚
  - 开发中东
  - 开发欧洲
  - 开发北美
  - 开发澳洲
  - 市场拓展
  - market development
  - explore market
  - expand market
always: false
---

# 市场开发调研报告技能 v1.0.0

当业务员说「开发XX市场」时，先生成一份结构化市场调研报告，再进入获客流程。

## 触发条件

用户输入包含「开发」+「区域/国家名」，例如：
- 开发南美市场
- 开发巴西
- 开发非洲
- 开发德国市场
- 我想拓展中东

## 执行流程

```
用户说「开发XX市场」
  │
  ├─ Step 1: 识别目标区域和国家
  │   解析用户输入 → 确定目标国家列表
  │
  ├─ Step 2: 多源数据搜索
  │   ① Exa搜索：市场规模+增长趋势+行业数据
  │   ② Exa搜索：竞争对手+中国出口商
  │   ③ Exa搜索：进口关税+认证要求
  │   ④ Exa搜索：目标国家传送带设备采购商
  │
  ├─ Step 3: 生成结构化报告
  │   按下方模板填充数据
  │
  ├─ Step 4: 用户确认下一步
  │   选项：搜索目标客户 / 从优先国家开始背调 / 生成开发计划
  │
  └─ Step 5: 转入获客流程
      调用 customer_discovery 路由
```

## 搜索指令

**必须使用 mcporter call exa**，禁止使用内置 web_search。

```bash
# 搜索1: 市场规模
mcporter call exa.web_search_exa query="[区域] conveyor belt equipment market size [年份] growth" numResults=8

# 搜索2: 竞争对手
mcporter call exa.web_search_exa query="conveyor belt splicing vulcanizing equipment manufacturer China export [目标国]" numResults=8

# 搜索3: 关税政策
mcporter call exa.web_search_exa query="[目标国] import tariff HS code 84778000 machinery requirement certification" numResults=5

# 搜索4: 行业需求（按国家语言搜索）
# 西语国家:
mcporter call exa.web_search_exa query="correa transportadora mineria [目标国] importador distribuidor" numResults=8
# 葡语国家:
mcporter call exa.web_search_exa query="correia transportadora mineracao Brasil importador distribuidor" numResults=8
# 阿拉伯国家:
mcporter call exa.web_search_exa query="conveyor belt mining equipment distributor [目标国] import" numResults=8

# 搜索5: 多语种词簇（如已配置）
# 参考 references/MULTILANG-KEYWORDS.md 构造本地语言搜索
```

## 报告模板

```markdown
# 红龙(HOLO) [区域名] 市场分析报告

> 生成时间：[日期]
> 目标区域：[区域]
> 分析师：HOLO获客系统

---

## 一、市场规模

| 指标 | 数据 |
|------|------|
| 区域传送带市场(最新年) | [XX]K吨 / $[XX]亿 |
| 预测(N年后) | [XX]K吨 / $[XX]亿, CAGR [X]% |
| 传送带系统市场增量 | +$[XX]亿 (预测期) |

## 二、各国消费排名

| 排名 | 国家 | 消费量 | 进口量 | 进口额 | 核心驱动行业 |
|------|------|--------|--------|--------|-------------|
| 1 | [国1] | [数据] | [数据] | [数据] | [行业] |
| 2 | [国2] | ... | ... | ... | ... |
| ... | ... | ... | ... | ... | ... |

**关键发现**: [1-2句总结性发现]

## 三、行业需求分析

1. **[行业1]** — [驱动因素说明]
2. **[行业2]** — [驱动因素说明]
3. **[行业3]** — [驱动因素说明]
4. **[行业4]** — [驱动因素说明]

## 四、竞争对手分析

| 竞争对手 | 位置 | 产品 | 特点 |
|----------|------|------|------|
| [对手1] | [城市] | [产品线] | [优势/规模] |
| [对手2] | ... | ... | ... |

**HOLO的竞争优势**:
- [优势1]
- [优势2]
- [优势3]

## 五、进口政策与关税

**[国家1]**:
- 进口关税: [X]%
- 增值税: [X]%
- 其他税负: [描述]
- 实际税负: CIF 的 [X]%
- 特殊政策: [如有]

**[国家2]**:
- ...

## 六、开发优先级推荐

```
优先级1: [国家] ★★★★★
  - [推荐理由，2-3行]

优先级2: [国家] ★★★★☆
  - [推荐理由]

优先级3: [国家] ★★★★☆
  - [推荐理由]

优先级4: [国家] ★★★☆☆
  - [推荐理由]

优先级5: [国家] ★★★☆☆
  - [推荐理由]
```

## 七、获客关键词

**英语**:
- [keyword1]
- [keyword2]
- [keyword3]

**[本地语言]**:
- [keyword1]
- [keyword2]
- [keyword3]

## 八、下一步建议

1. [建议1]
2. [建议2]
3. [建议3]
4. [建议4]
```

## 区域→国家默认映射

当用户说「开发XX」时，自动展开为国家列表：

| 区域 | 默认国家 |
|------|---------|
| 南美 | 巴西、智利、阿根廷、哥伦比亚、秘鲁 |
| 中美 | 墨西哥、危地马拉、哥斯达黎加 |
| 非洲 | 南非、尼日利亚、肯尼亚、埃及、摩洛哥 |
| 中东 | 沙特、阿联酋、卡塔尔、科威特、阿曼 |
| 东南亚 | 印尼、越南、泰国、马来西亚、菲律宾 |
| 欧洲 | 德国、英国、法国、意大利、波兰、西班牙 |
| 北美 | 美国、加拿大 |
| 澳洲 | 澳大利亚、新西兰 |
| 中亚 | 哈萨克斯坦、乌兹别克斯坦 |
| 南亚 | 印度、巴基斯坦、孟加拉 |

## HOLO产品线（报告时参考）

| 产品 | 英文名 | 目标客户 |
|------|--------|---------|
| 风冷接头机 | Air-cooled belt splicing press | 传送带加工厂/维修商 |
| 水冷接头机 | Water-cooled belt splicing press | PVC/PU传送带加工 |
| 分层机 | Belt skiving/splitting machine | 传送带制造/加工 |
| 导条机 | Guide bar welding machine | 传送带配套加工 |
| 打齿机 | Timing belt punching machine | 同步带加工 |
| 裁切机 | Belt cutting machine | 传送带裁切 |
| 封边机 | Belt edge sealing machine | 传送带封边 |
| 硫化机 | Rubber belt vulcanizing press | 橡胶带硫化 |

## 搜索质量检查

报告生成前自检：
- [ ] 市场规模有具体数字（不是模糊描述）
- [ ] 至少3个国家有消费/进口数据
- [ ] 竞争对手至少列出3家（含中国出口商）
- [ ] 关税/进口政策有具体税率或说明
- [ ] 获客关键词包含目标国本地语言
- [ ] 开发优先级有明确推荐和理由

---

## 单国家 vs 区域：模板适配

当用户说「开发美国」「开发巴西」等单个国家时：
- 第二章「各国消费排名」改为「消费结构」，按细分行业/地区拆分，不列多国排名
- 第六章「开发优先级」按客户类型（加工商/分销商/终端/服务商）排，不按国家排
- 关税章节只写一个国家，但要更深入：包含特别关税（如Section 301）、认证要求（UL/CE/MSHA等）

当用户说「开发南美」「开发东南亚」等区域时：
- 按原模板执行，按国家排名

## 搜索实战技巧（v1.0.1 补充）

1. **竞争对手搜索要同时搜中国出口商** — query 用 "China export" 后缀，能直接找到温州/无锡的同行（Beltwin/EPNUO/FUDA），这对HOLO定位至关重要

2. **关税搜索要搜 Section 301 / 反倾销** — 对中国出口商，不仅查MFN税率，必须额外搜索贸易制裁/特别关税。query示例：
   ```bash
   mcporter call exa.web_search_exa query="[目标国] import tariff China origin [产品] Section 301 anti-dumping 2024 2025" numResults=5
   ```

3. **英语国家不需要多语种词簇** — 美国/英国/澳洲/加拿大直接用英语搜索，跳过MULTILANG-KEYWORDS加载

4. **成熟市场的竞品分析要更深入** — 美国/欧洲等成熟市场，竞争对手分为：
   - 本土品牌（有服务网络、认证齐全）
   - 中国出口商（价格优势、无本土服务）
   - 欧洲品牌（技术领先、价格高）
   分别列出，并在HOLO优势分析中明确对标哪个梯队

## 搜索质量检查

报告生成前自检：
- [ ] 市场规模有具体数字（不是模糊描述）
- [ ] 区域报告：至少3个国家有消费/进口数据 / 单国报告：有细分行业数据
- [ ] 竞争对手至少列出3家（含中国出口商）
- [ ] 关税/进口政策有具体税率或说明
- [ ] **对中国出口：是否查了特别关税（Section 301/反倾销）？**
- [ ] **认证要求是否列出（UL/CE/MSHA等）？**
- [ ] 获客关键词包含目标国本地语言（英语国家除外）
- [ ] 开发优先级有明确推荐和理由

---

*版本: 1.0.1 | 创建时间: 2026-04-10*
*来源: 南美市场测试时沉淀的方法论，美国市场测试后补充单国家适配和关税深搜*
