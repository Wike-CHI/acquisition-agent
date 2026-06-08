---
name: knowledge-base
version: "1.3.0"
description: Use when 需要读写HOLO团队共享知识库或查找已有的调研报告/企业档案时。路由：知识库读写走此技能（内置去重+版本管理+权限校验），优先使用 kb_read/kb_write/kb_search/kb_list Agent 工具，PowerShell 脚本作为兜底。
triggers:
  - 知识库
  - 查一下
  - 市场知识
  - 产品知识
  - knowledge-base
  - 保存报告
  - 写入知识库
  - 保存到NAS
  - write_to_knowledge
  - read_from_knowledge
allowed-tools: Bash,Read,Write
---

> ⚠️ **【强制执行规则] 知识库不是文档，是必须执行的工具！**
>
> **任何获客行为前，必须执行两道检查：**
> 1. `check_existing_customer` — 是否为成交客户黑名单（命中则禁止触达）
> 2. `kb_search` / `kb_read` — 知识库是否已有档案（有则直接复用）
>
> 收到调研报告/背调报告/竞品分析后，**必须**：
> 1. 调用 `kb_write` 或 `write-knowledge.ps1` 保存到 NAS
> 2. 返回保存结果（含实际路径），不能只说"已保存"
>
> **错误示例**：`报告保存路径: \\192.168.0.98\home\knowledge\...` ❌（只输出，没保存）
> **正确示例**：执行 `exec({command: "powershell -Command \". '.\\write-knowledge.ps1' -Type market -Name 'Flexco' ...\"})` ✅

# Knowledge Base Skill - 红龙知识库管理

> **Skill Graph：** 领域 → [[_index-intelligence|情报与知识领域]] | 上游 ← [[company-research|背调报告]] / [[cold-email-generator|开发信]] / [[smart-quote|报价]] ← [[_index-intelligence|情报领域]] | 下游 → NAS持久化 → 全员复用


> ⭐ **团队共享情报中心 + 产品知识库**

---

## 🔴 核心规则：知识库门卫（强制前置检查）

> ⚠️ **所有获客行为必须先过知识库！**

```
┌─────────────────────────────────────────────────────────────┐
│                    知识库门卫流程                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  用户请求：分析东南亚市场 / 背调查公司 / 了解产品...          │
│                    ↓                                         │
│         ┌─────────────────────────┐                         │
│         │   执行知识库前置检查     │  ← 🔴 强制执行！         │
│         └─────────────────────────┘                         │
│                    ↓                                         │
│    ┌──────┴──────┬──────┴──────┬──────┴──────┐             │
│    ↓             ↓             ↓             ↓             │
│ 产品知识库    市场知识库     公司知识库     邮件知识库         │
│    ↓             ↓             ↓             ↓             │
│ ┌──┴──┐      ┌──┴──┐      ┌──┴──┐      ┌──┴──┐         │
│ │有？ │      │有？ │      │有？ │      │有？ │         │
│ └──┬──┘      └──┬──┘      └──┬──┘      └──┬──┘         │
│    ↓            ↓            ↓            ↓             │
│ ┌──┴──┐      ┌──┴──┐      ┌──┴──┐      ┌──┴──┐         │
│ │ 是  │      │ 是  │      │ 是  │      │ 是  │         │
│ └──┬──┘      └──┬──┘      └──┬──┘      └──┬──┘         │
│    ↓            ↓            ↓            ↓             │
│ 读取上下文   读取上下文   读取上下文   读取上下文         │
│ 告知用户     告知用户     告知用户     告知用户             │
│ "已有档案"   "已有报告"   "已有档案"   "已有记录"         │
│    ↓            ↓            ↓            ↓             │
│ ┌──┴──┐      ┌──┴──┐      ┌──┴──┐      ┌──┴──┐         │
│ │ 否  │      │ 否  │      │ 否  │      │ 否  │         │
│ └──┬──┘      └──┬──┘      └──┬──┘      └──┬──┘         │
│    ↓            ↓            ↓            ↓             │
│ 执行调研     执行调研     执行背调     发送邮件           │
│ 完成后保存   完成后保存   完成后保存   发送后保存         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 强制执行规则

| 规则 | 说明 |
|------|------|
| **前置检查** | 任何获客行为开始前，必须先查知识库 |
| **先读后写** | 知识库有内容 → 直接使用；无内容 → 执行调研 |
| **自动保存** | 调研完成后必须保存到知识库 |
| **全局复用** | 任何业务员调研的结果，全员可查 |

---

## 一、知识库类型

### 1.1 四类知识库

| 类型 | 目录 | 用途 | 查询时机 |
|------|------|------|---------|
| **products** | `products/` | 产品知识库 | 任何涉及产品的问题 |
| **market** | `market-research/` | 市场调研报告 | 市场分析前 |
| **companies** | `companies/` | 企业背调档案 | 公司调研前 |
| **emails** | `emails/` | 已发送开发信 | 开发信生成前 |

### 1.2 产品知识库结构

```
\\192.168.0.98\home\knowledge\
├── products/                    # ⭐ 产品知识库
│   ├── index.md               # 产品总索引
│   ├── 风冷接头机/
│   │   ├── index.md          # 产品系列索引
│   │   ├── 二代.md
│   │   ├── 三代.md
│   │   ├── 四代.md
│   │   └── 规格参数.md
│   ├── 水冷接头机/
│   │   └── ...
│   ├── 分层机/
│   ├── 导条机/
│   └── 配套设备/
├── market-research/            # 市场调研
│   ├── 东南亚市场.md
│   ├── 非洲市场.md
│   └── 南美市场.md
├── companies/                  # 企业背调
│   └── ABC-Corp.md
├── contacts/                   # 联系人
│   └── ABC-Corp/
│       └── John-Smith.md
└── emails/                     # 开发信记录
    └── 2026-04/
        └── ABC-Corp.md
```

---

## 二、查询接口（双层：Agent 工具优先，PowerShell 兜底）

### 2.0 kb_* Agent 工具（首选 — holo-desktop 内置）

> 在 holo-desktop Agent 运行时中，优先使用内置的 kb_* 工具，无需挂载 NAS。

```typescript
// 模糊搜索 — 不确定条目名时首选
kb_search(query="风冷机 三代 规格", type="products")
kb_search(query="Flexco 竞品", type="market")
kb_search(query="cement", type="company")

// 精确读取 — 已知条目名
kb_read(type="products", name="风冷接头机-三代")
kb_read(type="market", name="东南亚市场")
kb_read(type="company", name="ABC-Corp")
kb_read(type="email", name="ABC-Corp")

// 浏览全貌 — 列出某类所有条目
kb_list(type="products")
kb_list(type="market")

// 写入 — 调研完成后保存到 NAS
kb_write(type="market", name="Flexco竞品分析", content="...", overwrite=false)
```

> kb_* 工具底层路径：`K:\knowledge\`（`\\192.168.0.98\home\knowledge`）

### 2.1 read-knowledge.ps1（兜底 — 非 holo-desktop 环境使用）

**⚠️ 必须用 exec 工具实际执行查询！**

```powershell
# 查询产品知识库
exec({command: "powershell -Command \". '.\\read-knowledge.ps1' -Type products -Name '风冷机三代'\"", workdir: "skills\\knowledge-base\\scripts"})

# 查询市场调研
exec({command: "powershell -Command \". '.\\read-knowledge.ps1' -Type market -Name '东南亚市场'\"", workdir: "skills\\knowledge-base\\scripts"})

# 查询企业档案
exec({command: "powershell -Command \". '.\\read-knowledge.ps1' -Type company -Name 'ABC Corp'\"", workdir: "skills\\knowledge-base\\scripts"})

# 查询开发信记录
exec({command: "powershell -Command \". '.\\read-knowledge.ps1' -Type email -Name 'ABC Corp'\"", workdir: "skills\\knowledge-base\\scripts"})

# 搜索关键词
exec({command: "powershell -Command \". '.\\search-knowledge.ps1' -Query '风冷机 规格'\"", workdir: "skills\\knowledge-base\\scripts"})
```

### 2.2 write-knowledge.ps1

**⚠️ 关键：必须用 exec 工具实际执行保存命令，不能只输出路径！**

保存报告的标准流程（3步）：

**Step 1**: 先把报告内容写入临时文件（避免命令行转义问题）
```
exec({
  command: "powershell -Command \"[System.IO.File]::WriteAllText('C:\\Users\\Administrator\\temp_kb_report.txt', @'\n# 报告标题\n\n报告内容...\n'@.Replace('\\n', \"`n\"), [System.Text.Encoding]::UTF8)\"",
  workdir: "skills\\knowledge-base\\scripts"
})
```

**Step 2**: 调用 write-knowledge.ps1 读取临时文件并保存到 NAS
```
exec({
  command: "powershell -Command \". '.\\write-knowledge.ps1' -Type market -Name 'Flexco' -ContentFile 'C:\\Users\\Administrator\\temp_kb_report.txt' -Overwrite yes\"",
  workdir: "skills\\knowledge-base\\scripts"
})
```

**Step 3**: 清理临时文件
```
exec({
  command: "powershell -Command \"Remove-Item 'C:\\Users\\Administrator\\temp_kb_report.txt' -ErrorAction SilentlyContinue\""
})
```

常用保存示例：

```powershell
# 保存市场调研报告 → Type=market
Type=market, Name="Flexco竞品分析", ContentFile=临时文件路径

# 保存企业档案 → Type=company
Type=company, Name="National Cement Ethiopia", ContentFile=临时文件路径

# 保存开发信记录 → Type=email
Type=email, Name="National Cement - 开发信v1", ContentFile=临时文件路径

# 保存产品知识 → Type=products
Type=products, Name="风冷接头机三代", ContentFile=临时文件路径
```

⚠️ **注意**：
- `-Content` 参数直接接受字符串（短内容可用）
- 长报告（报告正文）一律用 `-ContentFile` 传入临时文件路径，避免命令行转义问题
- `-ContentFile` 会读取文件内容作为报告正文保存
- 执行完保存后，必须告知用户保存结果（含实际路径）

### 2.3 search-knowledge.ps1

```powershell
# 搜索关键词
. .\search-knowledge.ps1 -Query "风冷机 规格"
```

---

## 三、知识库门卫执行流程

### 3.1 产品相关查询（NAS 实时查询）

```
用户问："风冷机三代有什么规格？"
         ↓
首选：kb_search(query="风冷机 三代", type="products")   ← Agent 工具，秒级响应
         ↓
┌─ 找到 → kb_read(type="products", name="风冷接头机-三代")   ← 读完整条目
│         告知："已在知识库找到最新产品信息（NAS 实时数据）"
│
├─ 未找到 → kb_search 换关键词重试（"PA300"、"风冷接头机"）
│
└─ 仍未找到 → 考虑是否需要先录入该产品知识到 NAS
              → 查询 honglong-products 技能获取产品目录参考
              → **录入后调用 kb_write 保存到 NAS**
```

> **产品知识是动态的。** NAS 知识库中产品条目的 `updated` 时间戳反映最新版本。
> 每次产品查询都从 NAS 获取最新数据，不依赖本地缓存。

### 3.2 市场调研查询

```
用户请求："分析东南亚市场"
         ↓
首选：kb_search(query="东南亚", type="market")          ← Agent 工具
      kb_read(type="market", name="东南亚市场")
         ↓
┌─ 存在 → 返回报告摘要 + 关键数据
│         告知："已有调研报告（最后更新: {updated}），是否需要补充？"
│
└─ 不存在 → 执行market-research技能调研
            → 生成六维度报告
            → **调用 kb_write 保存到 NAS**
            → 返回完整报告
```

### 3.3 公司背调查询

```
用户请求："调研ABC公司"
         ↓
首选：kb_search(query="ABC", type="company")           ← Agent 工具
      kb_read(type="company", name="ABC-Corp")
         ↓
┌─ 存在 → 返回档案摘要 + ICP评分
│         告知："该公司已有档案（最后更新: {updated}），是否需要补充？"
│
└─ 不存在 → 执行company-research技能背调
            → 生成背调报告
            → **调用 kb_write 保存到 NAS**
            → 返回完整报告
```

### 3.4 开发信生成查询

```
用户请求："给ABC公司发开发信"
         ↓
并行查询（kb_* Agent 工具）：
  1. kb_read(type="company", name="ABC-Corp")      # 获取公司背景
  2. kb_search(query="风冷机", type="products")     # 获取最新产品信息
  3. kb_read(type="email", name="ABC-Corp")         # 检查是否已发送
         ↓
┌─ 公司档案存在 → 使用公司信息个性化开发信
│
├─ 产品信息来自 NAS → 使用最新产品数据（非本地缓存）
│
└─ 已发送过 → 告知："该公司已在X月X日发送过开发信"
             询问："是否要重新发送？"
```

---

## 四、知识库脚本位置

```
skills/knowledge-base/scripts/
├── read-knowledge.ps1      # 读取知识库
├── write-knowledge.ps1     # 写入知识库
├── search-knowledge.ps1    # 搜索知识库
└── list-knowledge.ps1      # 列出档案
```

### 调用方式（必须通过 exec 工具执行）

```powershell
# 读取知识库（通过 exec 工具）
exec({command: "powershell -Command \". '.\\read-knowledge.ps1' -Type products -Name '风冷机三代'\"", workdir: "skills\\knowledge-base\\scripts"})

# 写入知识库（通过 exec 工具）
exec({command: "powershell -Command \". '.\\write-knowledge.ps1' -Type market -Name '东南亚市场' -ContentFile 'C:\\Users\\Administrator\\temp_report.txt'\"", workdir: "skills\\knowledge-base\\scripts"})
```

⚠️ **禁止**只输出路径不执行！必须调用 exec 工具实际保存。

---

## 五、NAS连接信息

| 项目 | 值 |
|------|-----|
| IP | `192.168.0.98` |
| Agent账号 | `HOLO-AGENT` |
| 共享路径 | `\\192.168.0.98\home` |
| 知识库目录 | `\\192.168.0.98\home\knowledge` |

### 挂载命令

```powershell
net use K: \\192.168.0.98\home /user:${env.NAS_USER} ${env.NAS_PASSWORD}
```

---

## 六、触发词

### 知识库查询触发

- 知识库
- 查一下公司档案
- 这家公司调查过吗
- 企业档案
- 已有的客户资料
- 团队共享情报
- **产品相关** - 风冷机/水冷机/分层机/规格/参数
- **市场相关** - 分析XX市场/XX市场调研
- **公司相关** - 调研XX公司/XX公司背景

### 强制执行场景

| 用户说 | AI必须先做 |
|--------|-----------|
| "分析东南亚市场" | `read-knowledge -Type market -Name "东南亚市场"` |
| "调研ABC公司" | `read-knowledge -Type company -Name "ABC"` |
| "风冷机三代参数" | `read-knowledge -Type products -Name "风冷机三代"` |
| "给ABC发开发信" | 先查公司档案 + 产品信息 |
| "了解HOLO产品" | `read-knowledge -Type products` |

---

## 七、维护

### 定期任务

| 任务 | 频率 | 说明 |
|------|------|------|
| 去重检查 | 每月 | 合并相似档案 |
| 归档旧档 | 每季度 | 归档超过1年无更新的档案 |
| 备份 | 每周 | 备份到本地 |
| 产品知识更新 | **按需（触发式）** | NAS 产品文件变更后同步更新 kb 条目 |

### 产品知识刷新

当 NAS 原始产品资料（PDF/Excel/图片）有更新时：
1. 运行 `refresh-product-index.ps1` 检测变更
2. 对比 `lastScanHash` 判断是否有新文件
3. 如有变更 → 更新对应的 kb products 条目
4. kb_write 覆盖旧条目（`overwrite: true`）

```powershell
# 检测产品目录变更
powershell -File "skills\honglong-products\scripts\refresh-product-index.ps1"

# 如有变更，更新 kb 条目
kb_write(type="products", name="风冷接头机-三代", content="...", overwrite=true)
```

---

## 版本历史

| 版本 | 日期 | 更新内容 |
|------|------|---------|
| v1.3.0 | 2026-06-01 | **NAS 动态查询架构：新增 kb_* Agent 工具为首选接口，PowerShell 脚本降为兜底；NAS IP 统一为 192.168.0.98；产品知识改为实时查询不再依赖本地缓存** |
| v1.2.0 | 2026-04-11 | **新增产品知识库 + 知识库门卫规则** |
| v1.1.0 | 2026-04-10 | 更新NAS账号为HOLO-AGENT |
| v1.0.0 | 2026-04-10 | 初始版本 |
