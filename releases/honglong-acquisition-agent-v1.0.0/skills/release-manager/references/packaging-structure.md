# 打包结构详解

## B2B SDR Template 清爽结构

打包后 ZIP 的目录结构：

```
project-name-v1.0.0/
├── README.md                  ⭐ 项目说明
├── INSTALL.md                 ⭐ 安装指南
├── QUICK-START.md             ⭐ 快速开始（5分钟上手）
├── SETUP.md                   ⭐ 配置指南（如存在）
├── BOOTSTRAP.md               ⭐ 启动指南（如存在）
│
├── workspace/                 ⭐ 7层上下文系统
│   ├── AGENTS.md
│   ├── HEARTBEAT.md
│   ├── IDENTITY.md
│   ├── MEMORY.md
│   ├── SOUL.md
│   ├── TOOLS.md
│   └── USER.md
│
├── skills/                    ⭐ 所有技能（完整复制）
├── deploy/                    ⭐ 部署脚本
│   ├── install.ps1
│   └── setup.ps1
└── examples/                  ⭐ 示例配置
```

## 各文件用途

### 根目录文档

| 文件 | 用途 |
|------|------|
| README.md | 项目介绍、功能概览、7层上下文说明 |
| INSTALL.md | 系统要求、安装步骤、配置说明 |
| QUICK-START.md | 5分钟上手指南、常用命令速查 |
| SETUP.md | 详细配置文档（可选） |
| BOOTSTRAP.md | 启动和初始化文档（可选） |

### workspace/ 目录

7层上下文系统的核心文件，直接复制自 workspace 根目录。

### skills/ 目录

完整复制所有技能文件，保持原有目录结构。

### deploy/ 目录

| 文件 | 用途 |
|------|------|
| install.ps1 | 一键安装脚本 |
| setup.ps1 | 交互式安装向导（复制自 release-manager） |

### examples/ 目录

存放示例配置文件（如 conveyor-belt/ 示例）。

## 打包流程

```
1. 创建临时目录 temp/project-name-v{version}
2. 生成根目录文档（README.md / INSTALL.md / QUICK-START.md）
3. 复制 workspace/ 文件
4. 复制 skills/ 目录
5. 生成 deploy/ 脚本
6. 创建 examples/ 目录
7. 使用 Compress-Archive 压缩为 ZIP
8. 清理临时目录
9. 更新 .release/state.json
10. 生成/更新 CHANGELOG.md
```

## 动态内容

ZIP 内的以下内容由脚本动态生成：

- **README.md**: 技能总数从 `$changes.currentSkills.Count` 读取
- **INSTALL.md**: 项目名和版本号动态插入
- **CHANGELOG.md**: 根据本次变更自动生成
- **.release/state.json**: 记录版本、技能哈希、日期

---

_Version: 2.1.0_
