# 打包结构详解

## 打包目标：整个 workspace

**红龙获客系统的打包源是整个 workspace 根目录**，而不是 `~/.workbuddy/skills/`。

```
~/.workbuddy/workspace/          ← 打包源
├── IDENTITY.md                ← 7层上下文
├── SOUL.md
├── AGENTS.md
├── USER.md
├── HEARTBEAT.md
├── MEMORY.md
├── TOOLS.md
├── BOOTSTRAP.md              ← 启动指南
├── ARCHITECTURE.md            ← 架构文档
├── SYSTEM-INDEX.md            ← AI必读索引
├── EXECUTION-LAYER.md         ← 状态机+规则引擎
├── SETUP.md                  ← 配置指南
├── skills/                   ← 技能集群（~80个技能）
├── scripts/                  ← 自定义 Python 脚本
├── memory/                   ← 历史记忆文件
├── customer-data/            ← 客户数据
├── output/                  ← 输出结果
├── customer-acquisition-skills/  ← 获客技能包
├── nas-knowledge/            ← NAS 知识索引
├── projects/                 ← 项目文件
├── multi-agent/              ← 多Agent配置
├── emails/                  ← 邮件记录
└── deploy/                  ← 安装脚本（打包后生成）
```

## 错误打包 vs 正确打包

| | 错误（v1.0.0） | 正确（workspace-root） |
|--|--|--|
| 打包源 | `~/.workbuddy/skills/` | workspace 根目录 |
| 7层上下文 | ❌ 丢失 | ✅ 完整保留 |
| 架构文档 | ❌ 丢失 | ✅ 完整保留 |
| 自定义脚本 | ❌ 丢失 | ✅ 完整保留 |
| 历史记忆 | ❌ 丢失 | ✅ 完整保留 |
| 技能数量 | 130（混乱计数） | 真实技能数 |
| ZIP 大小 | ~700MB | ~700MB |

---

## 打包后 ZIP 的目录结构

```
honglong-acquisition-agent-v1.0.0/
├── README.md                  ⭐ 项目说明
├── INSTALL.md               ⭐ 安装指南
├── QUICK-START.md           ⭐ 快速开始（5分钟上手）
│
├── *.md                      (7层上下文 + 架构文档)
│   ├── ARCHITECTURE.md
│   ├── SYSTEM-INDEX.md
│   ├── EXECUTION-LAYER.md
│   ├── SETUP.md
│   ├── BOOTSTRAP.md
│   └── QUICK-REFERENCE.md
│
├── skills/                   ⭐ 技能集群（~80个）
│   ├── global-customer-acquisition/
│   ├── acquisition-workflow/
│   ├── acquisition-coordinator/
│   ├── acquisition-evaluator/
│   ├── linkedin/
│   ├── facebook-acquisition/
│   ├── teyi-customs/
│   ├── customer-intelligence/
│   ├── email-sender/
│   ├── delivery-queue/
│   ├── fumamx-crm/
│   ├── honglong-assistant/
│   ├── honglong-products/
│   └── [其他技能...]
│
├── scripts/                  ⭐ 自定义脚本
│   ├── send_batch_emails.py
│   ├── follow_up_emails.py
│   ├── generate_pipeline_excel.py
│   └── europe_emails.py
│
├── memory/                   ⭐ 历史记忆
│   └── 2026-*.md
│
├── customer-data/             ⭐ 客户数据
├── customer-acquisition-skills/ ⭐ 获客技能包
├── deploy/                   ⭐ 安装脚本
│   ├── install.ps1
│   └── setup.ps1
│
└── output/                  ⭐ 输出结果
```

## 各目录用途

| 目录 | 必须打包 | 用途 |
|------|----------|------|
| `skills/` | ✅ 必须 | 技能集群 |
| `memory/` | ✅ 必须 | 历史记忆文件 |
| `customer-data/` | ✅ 必须 | 客户数据 |
| `scripts/` | ✅ 必须 | 自定义 Python 脚本 |
| `customer-acquisition-skills/` | ✅ 推荐 | 获客技能包 |
| `output/` | ✅ 推荐 | 输出结果 |
| `nas-knowledge/` | ✅ 推荐 | NAS 知识索引 |
| `projects/` | ⚠️ 可选 | 项目文件（较大） |
| `multi-agent/` | ⚠️ 可选 | 多Agent配置 |
| `emails/` | ⚠️ 可选 | 邮件记录 |
| `docs/` | ⚠️ 可选 | 临时文档 |

---

## 打包流程

```
1. 确定 workspace 根目录（从 release-manager 位置向上推断）
2. 创建临时目录
3. 生成根文档（README / INSTALL / QUICK-START）
4. 复制根目录 .md 文件（7层上下文 + 架构文档）
5. 复制所有子目录（skills/ scripts/ memory/ 等）
6. 生成 deploy/ 安装脚本
7. Compress-Archive 压缩为 ZIP
8. 更新 .release/state.json
9. 生成/更新 .release/CHANGELOG.md
10. Git 提交 + 标签 + 推送（可选）
```

---

_Version: 2.2.0_
