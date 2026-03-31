# LEARNINGS.md

## [LRN-20260331-001] best_practice

**Logged**: 2026-03-31T10:00:00+08:00
**Priority**: high
**Status**: promoted
**Area**: infra

### Summary
特易平台（et.topease.net）国家选择必须用 JS 注入，填写搜索框无效

### Details
特易"特易搜搜"页面的国家选择列表基于 Vue 组件渲染，`agent-browser fill` 往国家搜索框填值只更新了 DOM 值，并不触发 Vue 的 v-model 过滤逻辑，也不会高亮/选中对应国家。`agent-browser find text "埃及" click` 会错误地点击搜索框内的文字而不是国家选项。

唯一可靠方式：用 `agent-browser eval` 注入 JS，通过 `querySelectorAll('.country span').find(el=>el.textContent.trim()==='目标国家')` 定位再 `.closest('.country').click()`。

进入 `/gt/company/result` 后同样逻辑：用 `.country-item` 打开国家弹窗，在弹窗内用 JS 定位国家并点击。

### Suggested Action
teyi-customs SKILL.md v2.1.0 已加入"方式4: JS自动化流程"及陷阱表格

### Metadata
- Source: conversation
- Related Files: C:\Users\Administrator\.workbuddy\skills\teyi-customs\SKILL.md
- Tags: teyi, agent-browser, vue, js-injection, 国家选择
- Pattern-Key: harden.vue-component-interaction
- Recurrence-Count: 1
- First-Seen: 2026-03-31
- Last-Seen: 2026-03-31

### Resolution
- **Resolved**: 2026-03-31T10:00:00+08:00
- **Notes**: 已整理为 SKILL.md v2.1.0 方式4，包含 7 步完整流程和陷阱对照表
- **Status**: promoted

---

## [LRN-20260331-002] best_practice

**Logged**: 2026-03-31T10:00:00+08:00
**Priority**: medium
**Status**: resolved
**Area**: infra

### Summary
特易 SPA 路由：从详情页返回后搜索条件丢失，不能用 `back()`

### Details
特易平台为 Vue SPA，`/gt/search` 页通过 JS 路由跳转，浏览器 `back()` 后参数不会自动恢复。  
正确策略：不依赖浏览器历史，需要切换页面时直接 `open` 目标 URL（如 `/gt/company/result?wlf=CompanyIndex`），再重新设置搜索条件。

### Suggested Action
已在 teyi-customs SKILL.md v2.1.0 陷阱表格中记录

### Metadata
- Source: conversation
- Related Files: C:\Users\Administrator\.workbuddy\skills\teyi-customs\SKILL.md
- Tags: teyi, SPA, 路由, agent-browser
- Pattern-Key: harden.spa-navigation
- Recurrence-Count: 1
- First-Seen: 2026-03-31
- Last-Seen: 2026-03-31

---

## [LRN-20260331-003] best_practice

**Logged**: 2026-03-31T10:00:00+08:00
**Priority**: medium
**Status**: resolved
**Area**: infra

### Summary
agent-browser snapshot -i 的 ref 编号每次页面加载后重新分配，不能跨 session 硬编码

### Details
Playwright accessibility tree 的 ref（如 @e43, @e92）在每次页面加载后都会重新分配。同一个输入框，上次 ref 是 e43，下次加载可能变成 e94。跨 session 硬编码 ref 会导致操作失败。

正确做法：每次操作前都先执行 `snapshot -i`，根据元素的 type/label/role 识别目标元素后再操作。

### Metadata
- Source: conversation
- Tags: agent-browser, ref, snapshot, playwright
- Pattern-Key: harden.dynamic-ref
- Recurrence-Count: 1
- First-Seen: 2026-03-31

---

## [LRN-20260331-004] best_practice

**Logged**: 2026-03-31T10:10:00+08:00
**Priority**: high
**Status**: promoted
**Area**: infra

### Summary
单一市场深度调研 SOP：特易 + Exa 双渠道联动的完整7步流程，经埃及市场实战验证

### Details
今日完成埃及 conveyor belt 市场调研，总结出一套可复用的"目标市场深度调研"SOP：

**核心7步**：
1. 特易JS自动化搜索（国家 + 关键词）
2. 逐页提取公司列表（eval + 去重）
3. TOP 20 详情页背调（ICP 6维度评分）
4. Exa 补充搜索（补联系方式）
5. 行业分类与分析
6. 客户分级（S/A/B/C）
7. 生成报告 + 行动清单

**关键经验**：
- 切换到"采购商"标签比"全部"更精准
- 特易联系方式少，Exa 专门用于补 WhatsApp/邮箱
- 水泥行业是工业皮带最大需求群体（埃及约40%）
- 竞品从印度和中国采购，需突出质量/服务差异化
- 大型集团旗下多子公司算一个决策链

**数据验证**：埃及市场，139家特易买家 + 8家Exa，2小时搜索 + 30分钟生成报告

### Suggested Action
已整理为 `global-customer-acquisition/MARKET-DEEP-DIVE.md`，包含完整SOP + ICP评分模板 + 报告模板

### Metadata
- Source: conversation
- Related Files: C:\Users\Administrator\.workbuddy\skills\global-customer-acquisition\MARKET-DEEP-DIVE.md
- Tags: 获客, 市场调研, 特易, exa, ICP评分, 埃及
- Pattern-Key: best_practice.market-deep-dive
- Recurrence-Count: 1
- First-Seen: 2026-03-31

### Resolution
- **Resolved**: 2026-03-31T10:10:00+08:00
- **Notes**: 已提炼为 MARKET-DEEP-DIVE.md，在 SKILL.md 中加入触发词"深度调研：[国家] [关键词]"
- **Status**: promoted

---
