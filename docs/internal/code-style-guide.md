# holo-agent 代码风格指南

> 适用于 holo-agent（Electron 桌面应用）全部前端代码。
> 2026-04-22 制定，基于现有代码库实际模式提炼。

---

## 一、工具链配置

| 工具 | 配置文件 | 关键规则 |
|------|---------|---------|
| TypeScript | `tsconfig.json` | `strict: true`, `ES2022`, `bundler` 模块解析 |
| ESLint | `eslint.config.mjs` | flat config, `no-explicit-any: warn`, `no-unused-*: error`（`_` 前缀忽略） |
| Prettier | `.prettierrc` | 见下方 |
| 路径别名 | `tsconfig.json` | `@/*` → `src/*`, `@electron/*` → `electron/*` |

### Prettier 规则

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

---

## 二、命名规范

| 类别 | 规范 | 示例 |
|------|------|------|
| **组件文件** | PascalCase.tsx | `MainLayout.tsx`, `ChatInput.tsx`, `StatusBadge.tsx` |
| **Store 文件** | kebab-case.ts | `auth.ts`, `batch-research.ts`, `boss-monitor.ts` |
| **Hook 文件** | kebab-case.ts | `use-min-loading.ts`, `use-stick-to-bottom-instant.ts` |
| **工具文件** | kebab-case.ts | `api-client.ts`, `host-api.ts` |
| **类型文件** | kebab-case.ts | `gateway.ts`, `channel.ts` |
| **页面目录** | PascalCase（单数） | `Chat/`, `Boss/`, `Agents/`, `Settings/` |
| **组件目录** | kebab-case | `ui/`, `layout/`, `common/`, `nas/`, `channels/` |
| **组件函数** | PascalCase | `export function MainLayout()`, `export function StatusBadge()` |
| **Store Hook** | camelCase + `use` 前缀 | `useAuthStore`, `useChatStore`, `useGatewayStore` |
| **类型/接口** | PascalCase | `ChatInputProps`, `FileAttachment`, `GatewayStatus` |
| **工具函数** | camelCase | `formatFileSize()`, `extractMediaRefs()` |
| **常量** | SCREAMING_SNAKE_CASE | `AUTH_STORAGE_KEY`, `IMAGE_CACHE_KEY`, `POLL_INTERVAL` |
| **模块私有变量** | `_` 前缀 | `_lastChatEventAt`, `_errorRecoveryTimer`, `_imageCache` |

---

## 三、Import 顺序

严格按以下顺序排列，组间空行分隔：

```typescript
// 1. React
import { useState, useEffect, useCallback } from 'react';
import type { RefObject } from 'react';

// 2. 第三方库
import { toast } from 'sonner';
import { SendHorizontal, Square } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// 3. 内部路径别名 (@/)
import { cn } from '@/lib/utils';
import { invokeIpc } from '@/lib/api-client';
import { useChatStore } from '@/stores/chat';
import { Button } from '@/components/ui/button';
import type { AgentSummary } from '@/types/agent';

// 4. 同目录相对路径
import { extractText, extractThinking } from './message-utils';
import { deriveTaskSteps } from './task-visualization';
```

**规则**：
- `import type` 与 `import` 可以混排，不需要单独分组
- 每组内按字母顺序排列
- 绝对不要用相对路径引用跨目录文件（用 `@/` 别名）

---

## 四、注释规范

### 文件头注释

```typescript
/**
 * Chat Page
 * Native React implementation communicating with OpenClaw Gateway
 * via gateway:rpc IPC.
 */
```

- 英文，一句话说明职责
- 不要写 `@author`、`@date` 等元数据

### 章节分隔符

```typescript
// ── Types ────────────────────────────────────────────────
// ── Helpers ──────────────────────────────────────────────
// ── Component ────────────────────────────────────────────
// ── Store ──────────────────────────────────────────────────
```

### 行内注释

- **技术说明用英文**：`// Auto-resize textarea`、`// Snapshot before clearing streaming state`
- **业务/领域说明用中文**：`// 全局悬浮聊天面板 -- 跨页面持久`、`// 老板视角：默认匿名显示`
- **注释要解释 Why，不是 What**：

```typescript
// ❌ 差：设置 pendingFinal 为 true
// ✅ 好：设置 pendingFinal — AI 完成了一个工具调用但整个运行还没结束，UI 需要显示"处理中"
```

### 不要写的注释

- 不要写显而易见的注释：`// 循环遍历数组`、`// 返回结果`
- 不要写 TODO 注释（直接做或开 issue）
- 不要写被注释掉的代码（git 记录了历史）

---

## 五、组件规范

### Props 接口

```typescript
interface ChatInputProps {
  onSend: (text: string, attachments?: FileAttachment[]) => void;
  onStop?: () => void;
  disabled?: boolean;
  sending?: boolean;
}
```

- 用 `interface` 不用 `type`（除非需要联合类型）
- 必需 props 不加 `?`，可选 props 加 `?`
- 回调函数命名：`on` + 动词（`onSend`, `onClose`, `onChange`）

### 导出方式

```typescript
// ✅ 推荐：命名导出
export function StatusBadge({ status }: StatusBadgeProps) { ... }

// ✅ 页面组件可以同时有命名和默认导出
export function Chat() { ... }
export default Chat;

// ❌ 不要：只用默认导出（不利于 tree-shaking 和重构）
export default function StatusBadge() { ... }
```

### 组件拆分

- **同文件内部组件**：只在当前组件使用、3 行以内的小组件（如 `FileIcon`, `TypingIndicator`）
- **独立文件**：超过 20 行或被多个地方使用的组件
- **页面文件上限**：~400 行。超出时拆分为子组件文件

### 不要用 React.memo

当前代码库没有使用 `React.memo()`。除非性能分析明确需要，否则不加。

---

## 六、Zustand Store 规范

### 基本结构

```typescript
interface MyState {
  // 状态
  items: Item[];
  loading: boolean;
  error: string | null;

  // 动作
  loadItems: () => Promise<void>;
  addItem: (item: Item) => void;
  clearError: () => void;
}

export const useMyStore = create<MyState>()((set, get) => ({
  items: [],
  loading: false,
  error: null,

  loadItems: async () => { ... },
  addItem: (item) => { ... },
  clearError: () => set({ error: null }),
}));
```

### Selector 模式（强制）

```typescript
// ✅ 正确：始终使用 selector，只订阅需要的字段
const messages = useChatStore((s) => s.messages);
const sending = useChatStore((s) => s.sending);
const loadHistory = useChatStore((s) => s.loadHistory);

// ❌ 错误：解构整个 store（每次任何字段变化都重渲染）
const { messages, sending } = useChatStore();
```

### 非响应式读取

```typescript
// 在 store action 内部或非 React 上下文中
const { currentSessionKey } = useChatStore.getState();
```

### Store 拆分

当 store 超过 500 行或包含多个独立关注点时，拆分为 action factory 文件：

```
stores/
  chat/
    types.ts              ← 类型定义
    store-api.ts          ← ChatSet/ChatGet 类型别名
    internal.ts           ← 初始状态 + 动作组合
    session-actions.ts    ← 会话管理 actions
    history-actions.ts    ← 历史加载 actions
    runtime-send-actions.ts  ← 发送 actions
    runtime-event-handlers.ts ← 事件处理
    helpers.ts            ← 纯工具函数
```

---

## 七、TypeScript 规范

### 严格类型

```typescript
// ✅ 好：定义接口
interface ApiResponse {
  success: boolean;
  result?: { runId?: string };
  error?: string;
}

// ✅ 好：类型断言用于 API 响应（有运行时校验保障时）
const result = await invokeIpc('gateway:rpc', 'chat.send', params) as ApiResponse;

// ❌ 差：裸 any
function process(data: any) { ... }

// ✅ 好：unknown + 类型收窄
function process(data: unknown) {
  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>;
    // ...
  }
}
```

### 类型断言使用场景

仅在以下场景允许 `as` 断言：
1. API 响应反序列化（`invokeIpc` 返回值）
2. DOM 类型查询（`document.getElementById`）
3. `unknown` 到具体类型的收窄

### 模块私有状态

定时器、缓存等非 React 状态可以用模块级变量，但必须：
- 用 `_` 前缀标识私有
- 提供清理函数
- 在文档中说明为什么不能放在 store 中

```typescript
let _historyPollTimer: ReturnType<typeof setTimeout> | null = null;

function clearHistoryPoll(): void {
  if (_historyPollTimer) {
    clearTimeout(_historyPollTimer);
    _historyPollTimer = null;
  }
}
```

---

## 八、样式规范

### Tailwind 优先

所有样式用 Tailwind 类，不写 CSS Modules 或内联 `<style>`。

```typescript
className={cn(
  'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[14px]',
  isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
)}
```

### cn() 工具

条件样式组合用 `cn()`（基于 clsx + tailwind-merge），不要手动拼接字符串：

```typescript
// ✅ 好
className={cn('base-class', isActive && 'active-class', className)}

// ❌ 差
className={`base-class ${isActive ? 'active-class' : ''} ${className || ''}`}
```

### Dark Mode

用 `dark:` 前缀，不要用 JS 动态切换样式：

```typescript
className="bg-white dark:bg-card border-black/10 dark:border-white/10"
```

### 颜色透明度

用 Tailwind 透明度修饰符，不要用 rgba：

```typescript
// ✅ 好
className="bg-black/5 text-muted-foreground/60"

// ❌ 差
style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
```

### 禁止的样式模式

- 不用 `style={{}}` 内联样式（除非动态计算的定位/尺寸）
- 不用 `!important`
- 不用 CSS-in-JS 库
- 不用任意值字符串拼接：`text-[${size}px]`（用 `style` 代替）

---

## 九、测试相关

### data-testid

关键交互元素添加 `data-testid`：

```typescript
<button data-testid="sidebar-new-chat" onClick={onNew}>
<div data-testid="chat-message-0">
<input data-testid="email-input" />
```

命名规范：`{component}-{element}` 或 `{component}-{element}-{index}`。

---

## 十、错误处理

### Store 中

```typescript
try {
  result = await invokeIpc('gateway:rpc', 'chat.history', params);
} catch (err) {
  // 静默处理，不 throw（避免 UI 崩溃）
  console.warn('[chat.history] failed:', err);
  set({ error: String(err), loading: false });
}
```

### 组件中

```typescript
// 用 try/catch 包裹异步操作
useEffect(() => {
  let cancelled = false;
  void fetchData().then((data) => {
    if (cancelled) return;
    setData(data);
  }).catch((err) => {
    console.warn('Failed to load:', err);
  });
  return () => { cancelled = true; };
}, []);
```

---

## 十一、i18n

用户可见文本优先走 i18n：

```typescript
const { t } = useTranslation('chat');
// ...
<p>{t('welcome.subtitle')}</p>
```

- 翻译文件在 `src/i18n/locales/{lang}/`
- 技术性文本（console.log、debug 信息）用英文
- 业务文本（按钮、提示、标签）走 i18n

---

## 十二、Git 提交规范

```
<type>: <description>

<optional body>
```

| 类型 | 用途 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `refactor` | 重构（不改变行为） |
| `docs` | 文档变更 |
| `test` | 测试变更 |
| `chore` | 构建/工具/依赖变更 |
| `perf` | 性能优化 |
| `ci` | CI/CD 变更 |

---

_版本：1.0.0 | 2026-04-22_
