---
name: holo-updater
version: 1.0.0
description: HOLO-AGENT 更新技能 - 从 GitHub 拉取最新版本。一键更新红龙获客系统到最新代码。触发词：更新HOLO-AGENT、更新获客系统、拉取最新版本、git pull、更新系统。
triggers:
  - 更新HOLO-AGENT
  - 更新获客系统
  - 拉取最新版本
  - 更新到最新
  - 从GitHub更新
  - holo-update
  - git pull
  - 更新系统
---

# HOLO-AGENT 更新技能 v1.0

## 功能

从 GitHub 仓库 `Wike-CHI/acquisition-agent` 拉取最新版本，一键更新本地 HOLO-AGENT 技能集群到最新代码。

## 一键更新

```bash
bash ~/.hermes/skills/acquisition/holo-updater/scripts/pull-update.sh
```

## 工作流程

```
1. 预检 → 网络连通性、git配置、GitHub连接
2. 拉取远程仓库最新代码
3. 对比本地 vs 远程 → 显示变更概览
4. 备份当前版本（时间戳目录）
5. 执行更新（rsync覆盖）
6. 验证 → YAML合法性、关键文件存在性
7. 输出更新报告
```

## 触发条件

用户说以下任一命令时触发：

| 命令 | 场景 |
|------|------|
| `更新HOLO-AGENT` | 通用更新 |
| `更新获客系统` | 同上 |
| `拉取最新版本` | 明确要求拉取 |
| `更新到最新` | 同上 |
| `从GitHub更新` | 指定来源 |
| `holo-update` | 快捷命令 |
| `git pull` | 类git语言 |
| `更新系统` | 简短命令 |

## 注意事项

- **会覆盖本地修改**：如果本地有未推送的更改，更新前会提示
- **自动备份**：每次更新前自动备份当前版本到 `.backup/` 目录
- **GitHub认证失败仍可读**：公共仓库无需认证即可拉取
- **离线保护**：如果网络不通，脚本会中止并给出错误信息

## 版本兼容性

- 从 v2.7+ 到最新版本均可使用本脚本更新
- 首次安装请使用 `acquisition-init`

---

_版本: 1.0.0_
_更新: 2026-04-14_
