---
name: knowledge-base
version: "1.0.0"
description: 团队共享情报中心与产品知识库。所有获客行为强制先查知识库，减少重复调研、提升效率。
triggers:
  - 知识库
  - 查一下
  - 市场知识
  - 产品知识
  - knowledge-base
---

# Knowledge Base Skill - 红龙知识库管理

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
\\192.168.0.194\home\knowledge\
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

## 二、查询脚本

### 2.1 read-knowledge.ps1

```powershell
# 查询产品知识库
. .\read-knowledge.ps1 -Type products -Name "风冷机三代"

# 查询市场调研
. .\read-knowledge.ps1 -Type market -Name "东南亚市场"

# 查询企业档案
. .\read-knowledge.ps1 -Type company -Name "ABC Corp"

# 查询开发信记录
. .\read-knowledge.ps1 -Type email -Name "ABC Corp"
```

### 2.2 write-knowledge.ps1

```powershell
# 保存产品知识
. .\write-knowledge.ps1 -Type products -Name "风冷机三代" -Content $content

# 保存市场调研
. .\write-knowledge.ps1 -Type market -Name "东南亚市场" -Content $report

# 保存企业档案
. .\write-knowledge.ps1 -Type company -Name "ABC Corp" -Content $report

# 保存开发信
. .\write-knowledge.ps1 -Type email -Name "ABC Corp" -Content $emailContent
```

### 2.3 search-knowledge.ps1

```powershell
# 搜索关键词
. .\search-knowledge.ps1 -Query "风冷机 规格"
```

---

## 三、知识库门卫执行流程

### 3.1 产品相关查询

```
用户问："风冷机三代有什么规格？"
         ↓
执行查询：read-knowledge -Type products -Name "风冷机三代"
         ↓
┌─ 存在 → 返回产品规格上下文
│         告知："已在知识库找到相关产品信息"
│
└─ 不存在 → 查询honglong-products技能获取产品信息
            → 保存到products/目录
            → 返回产品信息
```

### 3.2 市场调研查询

```
用户请求："分析东南亚市场"
         ↓
执行查询：read-knowledge -Type market -Name "东南亚市场"
         ↓
┌─ 存在 → 返回报告摘要 + 关键数据
│         告知："已有2026-04-11调研报告，是否需要更新？"
│         询问："补充最新数据？"
│
└─ 不存在 → 执行market-research技能调研
            → 生成六维度报告
            → 保存到market-research/目录
            → 返回完整报告
```

### 3.3 公司背调查询

```
用户请求："调研ABC公司"
         ↓
执行查询：read-knowledge -Type company -Name "ABC Corp"
         ↓
┌─ 存在 → 返回档案摘要 + ICP评分
│         告知："该公司已在2026-04-10调研过"
│         询问："是否需要补充更新？"
│
└─ 不存在 → 执行company-research技能背调
            → 生成背调报告
            → 保存到companies/目录
            → 返回完整报告
```

### 3.4 开发信生成查询

```
用户请求："给ABC公司发开发信"
         ↓
执行查询：
  1. read-knowledge -Type company -Name "ABC Corp"  # 获取公司背景
  2. read-knowledge -Type products -Name "风冷机"    # 获取产品信息
  3. read-knowledge -Type email -Name "ABC Corp"    # 检查是否已发送
         ↓
┌─ 公司档案存在 → 使用公司信息个性化开发信
│
├─ 产品信息存在 → 使用产品知识
│
└─ 已发送过 → 告知："该公司已在X月X日发送过开发信"
             询问："是否要重新发送？"
```

---

## 四、知识库脚本位置

```
C:\Users\Administrator\.workbuddy\skills\knowledge-base\scripts\
├── read-knowledge.ps1      # 读取知识库
├── write-knowledge.ps1     # 写入知识库
├── search-knowledge.ps1    # 搜索知识库
└── list-knowledge.ps1      # 列出档案
```

### 调用方式

```powershell
# 方式1：cd到脚本目录
cd "C:\Users\Administrator\.workbuddy\skills\knowledge-base\scripts"
. .\read-knowledge.ps1 -Type products -Name "风冷机三代"

# 方式2：绝对路径
. "C:\Users\Administrator\.workbuddy\skills\knowledge-base\scripts\read-knowledge.ps1" -Type products -Name "风冷机三代"
```

---

## 五、NAS连接信息

| 项目 | 值 |
|------|-----|
| IP | `192.168.0.194` |
| Agent账号 | `HOLO-AGENT` |
| Agent密码 | `Hl88889999` |
| 共享路径 | `\\192.168.0.194\home` |
| 知识库目录 | `\\192.168.0.194\home\knowledge` |

### 挂载命令

```powershell
net use K: \\192.168.0.194\home /user:HOLO-AGENT Hl88889999
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
| 产品知识更新 | 按需 | 产品升级后更新 |

---

## 版本历史

| 版本 | 日期 | 更新内容 |
|------|------|---------|
| v1.2.0 | 2026-04-11 | **新增产品知识库 + 知识库门卫规则** |
| v1.1.0 | 2026-04-10 | 更新NAS账号为HOLO-AGENT |
| v1.0.0 | 2026-04-10 | 初始版本 |
