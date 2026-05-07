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

> **执行引擎已内置** — 不再需要手动 `mcporter call exa.xxx` 逐步骤执行。
> 使用 `create_agent` + `spawn_agent` 动态编排，参考 `prompts/tools/team.md`。

---

## 前置读取

- `docs/全球大客户战略地图.md` — 区域优先级 + 竞品格局 + 利润底线
- 涉及的具体子技能 SKILL.md（按需读取）

---

## 获客标准工作流（5阶段）

```
搜索 ──→ 验证 ──→ 背调 ──→ 筛选 ──→ 触达
```

### 阶段1: 搜索（并行）

创建 lead-finder 代理，按市场并行搜索。同一市场的不同搜索词也用独立代理。

推荐代理角色：`lead-finder`（见 team.md 角色模板）
推荐工具白名单：`web_search`, `web_fetch`, `read_file`
每代理步数上限：8

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
| 矿业过滤 | 非矿业终端客户（贸易商除外） | 排除，标记 mining_blocked |
| 伙伴保护 | 非 Beltwin 已有客户 | 排除，不抢伙伴客户 |

输出：高价值客户列表（2-5 家）

### 阶段5: 触达

对通过筛选的客户：
1. `email-composer` 代理生成开发信（评分 ≥ 9.0）
2. AI 检测 + 润色（`sdr-humanizer`）
3. 发送 + 设置 D3/D7/D14 跟进序列

---

## 委派方式

```
// 批量搜索（示例：开发巴西市场）
create_agent("lead-finder", ...)
create_agent("customer-researcher", ...)
create_agent("email-composer", ...)

// 阶段1+3 合并：搜索 + 背调并行
spawn_agent({
  agents: [
    { name: "lead-finder", prompt: "搜索巴西输送带相关企业..." },
    { name: "customer-researcher", prompt: "背调已找到的客户A..." },
    { name: "customer-researcher", prompt: "背调已找到的客户B..." },
  ]
})

// 阶段5：开发信
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

### 背调
| 公司 | ICP | 等级 | 状态 |
|------|-----|------|------|
| A | 85 | A | ✅ 进入触达 |
| B | 68 | B | ⏭️ 培育池 |

### 触达
- 已发送：N 封
- 跟进：D3/D7/D14

### 建议
- [下一步行动]
```

---

*版本: 3.0.0 | 变更: 从手动 mcporter 引擎退化为工作流参考；执行交给内置团队工具*
