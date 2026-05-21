---
name: fumamx-update
version: 1.0.0
description: "Fumamx CRM 客户更新与培育流程自动化 — 更新已有客户信息、添加到培育序列。Feature Flag: FUMAMX_ENABLE_UPDATE=true 时启用。"
triggers:
  - "更新孚盟客户"
  - "修改客户信息"
  - "更新客户"
  - "添加到培育"
  - "客户培育"
  - "加入培育流程"
  - "批量添加到培育"
---

# Fumamx Update & Nurture Automation v1.0

> **Skill Graph：** 领域 → [[_index-acquisition|核心获客领域]] | 上游 ← [[fumamx-crm|孚盟CRM]] ← [[_index-conversion|转化领域]] | 下游 → 培育序列自动化


客户信息更新和添加到培育流程自动化。Feature Flag `FUMAMX_ENABLE_UPDATE=true` 控制是否启用（默认关闭）。

---

## 何时使用

- 客户信息发生变化（邮箱/电话/地址等）
- 需要将客户加入培育序列进行跟进
- 批量将多个客户添加到培育

---

## 前置条件

1. **登录检测** — 调用 `ipcRenderer.invoke('fumamx:isLoggedIn')`，未登录时中断
2. **Feature Flag** — 环境变量 `FUMAMX_ENABLE_UPDATE=true`，否则提示功能未启用
3. **目标客户** — 需提供客户编号（customerNo）或客户详情 URL

---

## 核心流程

### UPDATE — 客户信息更新

```
1. 检测登录态 → 未登录则提示
2. 收集更新字段（旧值 → 新值）
3. 构建变更预览（"即将更新 {公司名} 的 {字段}：{旧值} → {新值}"）
4. 等待用户确认（Chat 卡片交互）
5. 导航到客户详情页
6. 点击编辑按钮
7. 填写/修改目标字段
8. 点击保存
9. 验证更新成功（回读字段对比）
10. 返回结果卡片
```

### ADD_TO_NURTURE — 添加到培育

```
1. 检测登录态 → 未登录则提示
2. 收集客户信息
3. 导航到客户详情页
4. 点击"添加到培育"按钮
5. 选择培育模板（如有多个）
6. 确认添加
7. 验证培育记录出现
8. 返回结果通知
```

---

## CDP Action Sequences

详细动作序列见 `scripts/update-customer.ts` 和 `scripts/add-to-nurture.ts`。

### UPDATE — 关键选择器

| 步骤 | 操作 | 选择器 |
|------|------|--------|
| 导航 | navigate | `#/main/newClient/NewBF001/detail/{id}` |
| 编辑按钮 | click | `button:has-text("编辑")` 或 `.el-button:has-text("编辑")` |
| 邮箱字段 | fill | `input[placeholder*="邮箱"]` 或 `input.el-input__inner` |
| 电话字段 | fill | `input[placeholder*="手机"]` |
| 保存按钮 | click | `button:has-text("保存")` 或 `.el-button--primary` |
| 确认弹窗 | click | `.el-message-box__btn:has-text("确定")` |

### ADD_TO_NURTURE — 关键选择器

| 步骤 | 操作 | 选择器 |
|------|------|--------|
| 导航 | navigate | `#/main/newClient/NewBF001/detail/{id}` |
| 添加到培育 | click | `button:has-text("添加到培育")` 或 `[class*="nurture"] button` |
| 选择模板 | click | `.el-option:has-text("{模板名}")` |
| 确认 | click | `button:has-text("确定")` 或 `.el-dialog button.el-button--primary` |

---

## 变更预览格式

```json
{
  "type": "fumamx-update-preview",
  "action": "UPDATE" | "ADD_TO_NURTURE",
  "customer": {
    "name": "National Cement Ethiopia",
    "customerNo": "CU2604240002"
  },
  "changes": [
    { "field": "邮箱", "oldValue": "info@old.com", "newValue": "contact@new.com" }
  ],
  "warning": "ICP 评分 68 < 75，继续操作？" 
}
```

显示为 Chat 确认卡片，用户点击"确认"后执行。

---

## 结果格式

```json
{
  "type": "fumamx-update-result",
  "status": "SUCCESS" | "PARTIAL" | "FAILED",
  "customer": { "name": "...", "customerNo": "..." },
  "changes": [...],
  "nurtureAdded": true,
  "nurtureTemplate": "新客户培育",
  "error": "字段更新失败：权限不足"
}
```
