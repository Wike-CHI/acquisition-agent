---
name: acquisition-coordinator
version: 3.0.0
description: 获客工作流参考模板。当用户请求批量获客、多步骤任务时，以此为蓝图决定如何委派子代理执行。实际执行使用内置团队工具（create_agent + spawn_agent）。
triggers:
  - 批量获客
  - 完整流程
  - 批量背调
  - 多步骤任务
  - 并行搜索
---

# 获客工作流参考 v3.0

> **Skill Graph：** 领域 → [[_index-meta|系统元技能领域]] | 上游 ← [[_index-acquisition|核心流程领域]] | 下游 → [[global-customer-acquisition|获客总入口]] → 各子技能


> **执行引擎已内置** — 不再需要手动 `mcporter call exa.xxx` 逐步骤执行。
> 使用 `create_agent` + `spawn_agent` 动态编排，参考 `prompts/tools/team.md`。

---

## 前置读取（必须按顺序）

1. **`references/HOLO-ICP-PROFILE.md`** — 目标客户画像（A/B/C类），识别信号，排除规则
2. **`references/ICP.md`** — 15,885家客户数据验证的 ICP 分类和搜索关键词
3. **`../../CLAUDE.md` 铁律** — 矿业禁止铁律、伙伴保护铁律、报价锁定铁律
4. **`../excel-xlsx/SKILL.md`** — Excel 生成技能（含 Python/openpyxl 代码模板）。**每次客户清单任务必须加载。**
5. 涉及的具体子技能 SKILL.md（按需读取）

> ⚠️ 不要依赖 `honglong-products` 技能的行业列表来判断目标客户。产品应用场景 ≠ 目标客户画像。ICP 画像才是客户筛选的唯一权威来源。

---

## 输出格式要求

**客户清单必须输出为 Excel (.xlsx) 文件**。禁止输出 JSON、CSV、Markdown 表格作为最终交付物。

**生成方式（必须遵守）：**
1. 先把合并后的数据用 `write_file` 保存为 JSON（如 `reports/merged.json`）
2. 再用 `shell` 执行 `python` 调用 openpyxl，读取 JSON 生成 .xlsx，包含表头样式、自动筛选、列宽适配
3. 参考 `excel-xlsx` 技能的 Python 代码模板

Excel 应包含列：公司名、国家、行业、网站、LinkedIn公司页、决策人姓名、决策人职位、决策人LinkedIn、邮箱、匹配产品、ICP评分、优先级。

---

## 获客标准工作流（5阶段）

```
搜索 ──→ 验证 ──→ 背调 ──→ 筛选 ──→ 触达
```

### 阶段1: 搜索（真正并行 — 使用 delegate_task）

**必须用 `delegate_task` 一次性创建 3-4 个真正并行的子代理**，每个负责一个区域。不要分多次调用——一次调用把所有区域全部覆盖。

推荐任务划分（4 并行）：
- 任务1：南美（巴西、智利、秘鲁、阿根廷）
- 任务2：北美+欧洲（美国、加拿大、德国、意大利、土耳其、英国）
- 任务3：亚太（印尼、泰国、越南、澳洲、印度）
- 任务4：中东+非洲（沙特、阿联酋、南非、摩洛哥）

每个子代理：
- 工具：`web_search`, `write_file`
- 步数：8
- 输出：将本区域客户列表写入 `workspace/{region}_leads.xlsx`

### 阶段2: 验证

**铁律：无决策人邮箱不继续。** 检查每个客户：
- 邮箱非 info@/sales@/contact@
- 联系方式时效 ≤ 12 个月
- 至少 2 个来源交叉验证
- 不满足 → 标记"需人工确认"并跳过

### 阶段3: 背调（并行）

创建 customer-researcher 代理，对验证通过的客户并行背调。
结果必须包含 360 度（6+6）分析框架和 ICP 评分。

推荐代理角色：`customer-researcher`（见 team.md 角色模板）
推荐工具白名单：`web_search`, `web_fetch`, `read_file`
每代理步数上限：8
最多并行：5

### 阶段4: 筛选

质量门控（不可违反）：

| 检查点 | 条件 | 失败处理 |
|--------|------|----------|
| ICP 评分 | ≥ 75 分 | 标记暂缓，移入培育池 |
| 竞品检查 | 非 Flexco/Almex/ContiTech 等直接竞品 | 排除 |
| **矿业过滤** | **非矿业终端客户（贸易商除外）。有输送带硫化维修团队的矿业公司OK，纯采矿作业企业禁止。** | 排除，标记 mining_blocked |
| 伙伴保护 | 非 Beltwin 已有客户 | 排除，不抢伙伴客户 |

输出：高价值客户列表（2-5 家）

### 阶段5: 触达

对通过筛选的客户：
1. `email-composer` 代理生成开发信（评分 ≥ 9.0）
2. AI 检测 + 润色（`sdr-humanizer`）
3. 发送 + 设置 D3/D7/D14 跟进序列

---

## 委派方式

```bash
# ⭐ 阶段1：真正并行搜索（一次性创建4个并行子代理）
delegate_task({
  max_steps: 8,
  tasks: [
    { prompt: "搜索南美输送带客户: 巴西、智利、秘鲁...搜索关键词参考 ICP.md" },
    { prompt: "搜索北美+欧洲输送带客户..." },
    { prompt: "搜索亚太输送带客户..." },
    { prompt: "搜索中东+非洲输送带客户..." },
  ]
})
# 4个子代理在独立线程中同时运行，互不阻塞

# 阶段5：开发信
spawn_agent({
  agents: [
    { name: "email-composer", prompt: "给客户A写开发信: [背调结果]" },
    { name: "email-composer", prompt: "给客户B写开发信: [背调结果]" },
  ]
})
```

---

## 输出模板

完成后给业务员：

```markdown
## 获客任务报告 — [市场/任务名]

### 搜索
- 发现 X 家
- 有效联系方式：Y 家

### 交付文件
- 📊 `workspace/{region}_leads.xlsx` — 完整客户清单（Excel）
- 📊 `workspace/all_leads_summary.xlsx` — 汇总表

### 建议
- [下一步行动]
```

---

*版本: 3.1.0 | 变更: 强制 Excel 输出；ICP画像唯一权威；delegate_task 4并行；矿业过滤细化*
