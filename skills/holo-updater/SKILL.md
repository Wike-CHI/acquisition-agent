---
name: holo-updater
description: HOLO-AGENT 更新技能 - 从 GitHub 拉取最新版本到本地。一键更新红龙获客系统到最新代码。触发：更新HOLO-AGENT、更新获客系统、拉取最新版本、更新系统、git pull。
---

# HOLO-AGENT 更新技能

## 快速使用

用户说「更新HOLO-AGENT」等触发词时，Agent自动执行：

```bash
bash ~/.hermes/skills/acquisition/holo-updater/scripts/pull-update.sh
```

## 工作流程

```
1. 预检 → 网络连通性、git 是否安装
2. 获取远程最新 commit，对比本地
3. 显示变更文件预览
4. 备份当前版本到 .backup/{timestamp}/（保留最近5份）
5. rsync 同步 skills/（排除 .git .backup .archive）
6. 验证关键文件存在 + YAML 合法性
7. 输出更新报告
```

## 脚本参数

| 参数 | 作用 |
|------|------|
| (无参数) | 全流程：检查→预览→确认→备份→同步→验证 |
| `--check-only` | 仅检查更新，不执行 |
| `--force` | 跳过确认，直接更新 |

## 环境变量

可自定义默认行为：

```bash
REPO_OWNER=Wike-CHI \
REPO_NAME=acquisition-agent \
BRANCH=main \
SKILLS_DIR=$HOME/.hermes/skills/acquisition \
bash ~/.hermes/skills/acquisition/holo-updater/scripts/pull-update.sh
```

## 已知约束

- **rsync 必需**：Linux/macOS/WSL2 环境需要 rsync（`apt-get install rsync` 或 `brew install rsync`）
- **备份≠回滚**：脚本只做备份，无 restore 功能；如需回滚，从 `.backup/{timestamp}/` 手动恢复
- **.archive 不更新**：归档的技能（`.archive/`）不在同步范围，不会被远程覆盖

## 陷阱记录（维护者必读）

- **RETAINED_SKILLS 漏加**：新增技能必须加入 `release-manager/scripts/sync-to-github.sh` 的 RETAINED_SKILLS 清单
- **patch 误删整块技能**：修改 RETAINED_SKILLS 时，字符串替换容易吞掉整行技能组，修复后必须重新计数验证
- **REPO_DIR 写死 /tmp**：系统 tmpwatch 可能清理，脚本内置保护机制处理此情况
- **--skip-prereq**：GitHub 网络预检常失败但实际 clone/pull 成功，sync-to-github.sh 内置此标志绕过

---

_版本: 1.0.0_
_updated: 2026-04-14_
