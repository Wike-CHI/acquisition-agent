---
name: social-publish
version: "1.0.0"
description: |
  社媒自动发布技能。通过 HOLO 浏览器自动化将内容发布到 LinkedIn、Facebook 等平台。
  支持纯文本帖子、带图帖子。当用户说"发布到LinkedIn"、"发社媒"、"自动发布"、"post to LinkedIn"时使用。
triggers:
  - 发布到LinkedIn
  - 发布到Facebook
  - 发社媒
  - 自动发布
  - post to LinkedIn
  - publish content
  - social-publish
category: social-media
tools:
  - browser_act
  - browser_snapshot
---

# 社媒自动发布

> **Skill Graph：** 领域 → [[_index-outreach|多渠道触达领域]]


通过 HOLO browserTools 将内容发布到各平台。

## 前置条件

- 用户已在内置浏览器中登录目标平台
- 发布前必须先 `browser_snapshot` 确认页面状态
- **所有发布操作必须经用户确认后才执行**

---

## LinkedIn 发布流程

### Step 1: 检查登录状态

```
browser_act action=navigate url=https://www.linkedin.com/feed/
→ 等待页面加载
browser_snapshot
→ 检查是否有 "Start a post" 按钮
→ 如果跳转到登录页 → ask_user 提示登录
```

### Step 2: 打开发帖框

```
browser_snapshot
→ 找到 "Start a post" 按钮的 element ID
browser_act action=click element={start_post_btn_id}
→ 等待 1 秒
browser_snapshot
→ 确认弹出了发帖对话框
```

### Step 3: 输入内容

LinkedIn 的帖子编辑器是 contenteditable div，不能用普通的 type 操作。
用 eval + clipboard API 注入内容：

```
browser_act action=eval js="
(async () => {
  const editor = document.querySelector('[contenteditable=\"true\"]');
  if (!editor) return 'no_editor_found';
  editor.focus();
  // 用 clipboard API 写入纯文本
  const text = ${JSON.stringify(POST_CONTENT)};
  const blob = new Blob([text], {type: 'text/plain'});
  const item = new ClipboardItem({'text/plain': blob});
  await navigator.clipboard.write([item]);
  document.execCommand('paste');
  return 'content_inserted';
})()
"
```

如果 clipboard API 被限制（常见于 LinkedIn），降级方案：

```
browser_act action=eval js="
(() => {
  const editor = document.querySelector('[contenteditable=\"true\"]');
  if (!editor) return 'no_editor_found';
  editor.focus();
  // 逐段插入
  const paragraphs = ${JSON.stringify(POST_LINES)};
  for (const p of paragraphs) {
    document.execCommand('insertText', false, p);
    document.execCommand('insertLineBreak');
  }
  return 'content_inserted';
})()
"
```

### Step 4: 确认内容

```
browser_snapshot
→ 读取编辑器中的文字，确认内容正确
→ 截图让用户确认
→ ask_user: "内容已填入，确认发布？"
  options: ["确认发布", "取消，我要修改"]
```

### Step 5: 发布

```
browser_snapshot
→ 找到 "Post" 按钮（注意：LinkedIn 的 Post 按钮在输入内容前是禁用状态）
browser_act action=click element={post_btn_id}
→ 等待 2 秒
browser_snapshot
→ 确认帖子已发布（对话框关闭，回到 feed 页面）
```

### LinkedIn 发布注意事项

- **Post 按钮**在输入内容前是 `disabled` 状态，填入内容后自动变为可点击
- **contenteditable** 不能用 `browser_act action=type`，必须用 eval 注入
- **长文本** LinkedIn 会自动截断但不会报错，输入前确认字符数 < 3000
- **Hashtag** 会被自动识别并高亮，不需要特殊处理
- **换行** 用 `insertLineBreak` 而不是 `Enter` 键（Enter 在 LinkedIn 会触发提交）

---

## Facebook 公司页发布流程

### Step 1: 导航到公司页

```
browser_act action=navigate url=https://www.facebook.com/{company_page_id}/
browser_snapshot
→ 确认到达公司页
```

### Step 2: 创建帖子

```
browser_snapshot
→ 找到 "Create post" 或发帖区域
browser_act action=click element={create_post_btn_id}
browser_snapshot
→ 确认弹出发帖对话框
```

### Step 3: 输入内容

Facebook 发帖框也是 contenteditable：

```
browser_act action=eval js="
(() => {
  const editor = document.querySelector('[contenteditable=\"true\"]');
  if (!editor) return 'no_editor_found';
  editor.focus();
  const text = ${JSON.stringify(POST_CONTENT)};
  // Facebook 支持直接设置 innerText
  editor.innerText = text;
  editor.dispatchEvent(new Event('input', {bubbles: true}));
  return 'content_inserted';
})()
"
```

### Step 4: 确认并发布

```
browser_snapshot → ask_user 确认
browser_act action=click element={post_btn_id}
```

---

## Instagram 发布流程

Instagram 网页版不支持直接发帖（仅限移动端 API）。替代方案：

1. **Instagram Graph API** — 需要 Facebook Business 账号和 App 审核通过
2. **移动端模拟** — 通过 browserTools 模拟移动端 viewport

当前优先级：LinkedIn > Facebook > Instagram

---

## 通用规则

### 1. 发布前必做

| 检查 | 方法 |
|------|------|
| 登录状态 | browser_snapshot 检查页面元素 |
| 内容长度 | 不超过目标平台限制 |
| 内容预览 | ask_user 让用户确认 |
| 截图存档 | 发布成功后截图保存到 workspace/ |

### 2. 发布后必做

| 动作 | 原因 |
|------|------|
| 截图 | 记录发布成功状态 |
| 记录到 content-log | 追踪发布历史（关键词/日期/平台/互动） |
| 告知用户 | "已成功发布到 LinkedIn，预计 24h 内开始获取互动数据" |

### 3. 错误处理

| 错误 | 处理 |
|------|------|
| 未登录 | ask_user 提示登录，不自动填写密码 |
| 内容输入失败 | 降级方案或提示用户手动粘贴 |
| Post 按钮仍 disabled | 内容可能未触发 input 事件，重新注入 |
| 页面结构变化 | 告知用户 "LinkedIn 页面结构可能更新，需要更新发布流程" |

### 4. 安全红线

- **永远不自动填写登录密码**
- **永远不绕过 CAPTCHA**
- **永远不在用户未确认时发布内容**
- **发布频率限制**：LinkedIn 每天不超过 2 篇，Facebook 不超过 3 篇
