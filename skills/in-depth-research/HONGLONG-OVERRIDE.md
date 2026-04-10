# 红龙深度研究定制包装

---

## ⚠️⚠️⚠️ 强制搜索规则 ⚠️⚠️⚠️

**❌ 禁止使用：内置 web_search 工具**
**✅ 必须使用：mcporter call exa.xxx（MCP）**

### 🔴 Exa 不可用时的强制流程

1. 执行 `mcporter list` 检查 Exa 是否在线
2. **如果 Exa 离线或未配置**：
   - **🛑 立即停止，告知用户**：「Exa MCP 不可用（当前状态：离线/未配置）。是否允许降级使用 web_search，还是先配置 Exa？」
   - **🚫 禁止静默降级**：未获得用户明确许可前，不得使用 web_search
   - **🚫 禁止跳过此步骤**：即使其他技能允许使用 web_search，本技能也不允许
3. 用户许可后，在输出中明确标注：「⚠️ 本次搜索使用 web_search（已获用户许可降级）」
4. 引导用户配置 Exa MCP（参考下方命令），确保下次使用正确通道

### MCP 配置与使用

如果AI不知道如何使用MCP，参考：
```bash
# 第一步：配置MCP
mcporter config add exa "https://mcp.exa.ai/mcp?tools=web_search_exa,web_search_advanced_exa,get_code_context_exa,deep_search_exa,crawling_exa,company_research_exa,people_search_exa,deep_researcher_start,deep_researcher_check"

# 第二步：验证
mcporter list  # 应显示 exa: 8 tools online

# 第三步：执行搜索
mcporter call exa.deep_search_exa query="conveyor belt manufacturer Africa" numResults=8
mcporter call exa.crawling_exa urls=["https://example.com"]

# ⚠️ PowerShell必须用cmd/c
cmd /c "mcporter call exa.deep_search_exa query=conveyor belt numResults=5"
```

---

> 本文件为 `in-depth-research` 技能提供红龙行业的定制化包装层。
> 包含完整的行业分析框架、关键词优化、输出格式扩展。
>
> **创建时间**: 2026-04-07
> **版本**: 1.0.0

---

## 使用方法

当用户需要深度研究，且涉及以下任一场景时自动使用本文件：
- "深度研究{行业/地区/公司}" — 全局市场分析
- "深度调研{行业/公司}" — 深度情报收集
- "研究{产品/技术}的市场" — 产品市场研究
- "竞争对手深度分析" — 深度竞争分析

## 红龙定制分析框架

按以下维度分析市场：

| 维度 | 分析重点 | 数据源 |
|------|----------|--------|
| 行业规模 (TAM/SAM/SOM) | 全球和区域输送带市场规模、增长趋势、主要玩家 | Statista、行业报告、海关数据 |
| 竞争格局 | 主要供应商、市场份额、价格区间、产品差异化 | Google、LinkedIn、行业目录、海关数据 |
| 分销渠道 | 分销商层级、物流模式、区域覆盖 | LinkedIn、行业目录、官网 |
| 需求特征 | 客户采购行为、决策因素、痛点 | 海关数据、客户访谈、行业论坛 |

## 搜索关键词建议

根据目标自动调整搜索关键词，专注于工业设备相关：

| 默认搜索 | 红龙优化搜索 |
|------|------------------|
| `{industry} market size` | `{industry} conveyor belt market size + distributor` |
| `{industry} top companies` | `{industry} belt splicing equipment top companies` |
| `{product} pricing trends` | `{product} industrial belt pricing trends China` |
| `{company} profile` | `{company} conveyor belt equipment supplier profile` |
| `{region} distributor` | `{region} industrial belt distributor + conveyor` |

## 输出格式扩展

在标准输出基础上追加以下内容：

### 搜索结果红龙适配评估

- **产品匹配度**: 搜索到的产品/服务与红龙产品的关联度
- **客户潜力**: 该市场中红龙目标客户(ICP)的密度
- **竞争强度**: 搜索结果中直接竞争对手的出现频率
- **渠道机会**: 该市场的分销商/代理商网络成熟度

### 深度研究额外维度

| 维度 | 红龙定制分析重点 |
|------|----------------|
| 供应链位置 | 目标公司在输送带产业链中的位置（制造商/分销商/终端） |
| 采购偏好 | 通过海关数据推断的采购频率和金额等级 |
| 技术水平 | 设备类型推断其技术需求（接头机/裁切机/分层机） |
| 决策链 | 推断决策人职位和采购周期 |
| 风险评估 | 财务/法律/竞争风险（来自公开信息） |

## 情报层调用链

深度研究完成后，自动将结果传递给 `company-research` 进行 ICP 评分：

```
深度研究结果
    ↓
提取目标客户基础信息（名称/网站/地区/行业）
    ↓
调用 company-research 进行 6维度 ICP 评分
    ↓
评分 ≥ 75分？ → 进入触达层
    ↓
评分 < 75分 → 标记为观察池，进入 Drip Campaign 监控
```

## 红龙产品关联

深度研究时，关联红龙产品：

| 客户类型 | 相关产品 | 开发重点 |
|---------|---------|---------|
| 输送带分销商 | 风冷机/水冷机 | 设备品质认证、交货速度 |
| 皮带加工厂 | 打齿机/导条机 | 加工精度、设备稳定性 |
| 终端工厂 | 全线产品 | 设备性价比、售后服务 |
| 工程公司 | 分层机/裁切机 | 定制能力、技术支持 |

---

*本文件为红龙获客系统定制，不随社区技能更新覆盖*
