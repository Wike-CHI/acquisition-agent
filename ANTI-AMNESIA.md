# Anti-Amnesia Implementation Spec v2.0

> 红龙获客系统 4层防遗忘记忆实施规范 — **部署和操作补充**。
> 完整架构定义见 `MEMORY.md`，本文档仅包含部署指南和记忆提取 Prompt 等 MEMORY.md 未覆盖的执行细节。
> 版本：v2.0 | 2026-04-27

---

## 概述

本文档覆盖 MEMORY.md 未包含的可执行实现细节：
1. **记忆提取 Prompt** — 供 OpenClaw Agent 每轮对话后自动执行
2. **快速部署指南** — 启动服务、配置环境变量、启用 Active Memory
3. **前置条件清单** — 必须安装的技能和外部服务

4层记忆架构定义请查阅 `MEMORY.md`。

---

## 前置条件

```yaml
required_skills:
  - name: "chroma-memory"
    source: acquisition-agent/skills
    status: must_install
  - name: "supermemory"
    source: acquisition-agent/skills
    status: must_install

external_services:
  - name: "MemOS"
    dashboard: "https://memos-dashboard.openmem.net"
    api_endpoint: "https://api.openmem.net/v1"
    auth: "Bearer <YOUR_MEMOS_API_KEY>"
    note: "免费额度可用"
  - name: "ChromaDB"
    port: 8000
    collection: "holo_conversation_history"
    note: "本地服务，需手动启动"

environment_variables:
  MEMOS_API_KEY: "<从 MemOS Dashboard 获取>"
  MEMOS_NAMESPACE: "holo_acquisition"
  CHROMA_COLLECTION: "holo_conversation_history"
  TOKEN_THRESHOLD: 0.65
  MEMORY_EXTRACT_INTERVAL: 1
```

---

## 记忆提取 Prompt（每轮后自动执行）

此 Prompt 是 MEMORY.md 定义的 JSON Schema 的可执行配套。MEMORY.md 定义数据结构，此 Prompt 定义提取行为：

```
You are a memory extractor. Your sole task is to extract structured information
from conversation content and update the customer memory object.

## Input
- Current conversation content (latest turn or multiple turns)
- Existing memory object (if any)

## Rules
1. Only extract factual information, no speculation
2. If a field has no new information, keep the existing value unchanged
3. If new information contradicts old information, overwrite with the new,
   and record the change in key_facts
4. conversation_state.stage can only advance forward in the state machine,
   never backward (unless customer explicitly says "no longer interested")
5. All timestamps use ISO 8601 format
6. In commitments, if by_when has passed and status is still pending,
   auto-change to overdue

## Output
Output only the updated JSON object, no explanatory text.
```

---

## 快速部署指南

### Step 1: 启动 ChromaDB
```bash
cd ~/.openclaw/chromadb
chroma run --port 8000
```

### Step 2: 启动 Supermemory
```bash
cd ~/.openclaw/supermemory
npm start
```

### Step 3: 获取 MemOS API Key
访问 https://memos-dashboard.openmem.net → 创建 Namespace → 获取 API Key

### Step 4: 设置环境变量
```bash
export MEMOS_API_KEY="your_key_here"
export MEMOS_NAMESPACE="holo_acquisition"
export CHROMA_COLLECTION="holo_conversation_history"
```

### Step 5: 启用 Active Memory（可选）
```bash
openclaw config set plugins.active-memory.enabled true
openclaw config set plugins.active-memory.mode recent
```

### Step 6: 验证
1. 发送测试消息到新客户 → 检查 MemOS 是否创建了 customer_session
2. 检查 `chroma:stats` → 确认 turn 已存储
3. 检查 `memory:stats` → 确认 Supermemory 可用
4. 手动触发 `chroma:snapshot` → 确认 L4 快照可用

---

*基于 B2B-SDR Template ANTI-AMNESIA.md v2.1 · OpenClaw v2026.4.24 · 红龙工业设备定制版*
