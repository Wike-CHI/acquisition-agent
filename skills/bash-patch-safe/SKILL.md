---
name: bash-patch-safe
description: Bash 脚本安全 patch 指南。当需要修改 bash 脚本时（通过 patch 工具或文本替换），防止常见误伤：函数定义重复、函数调用丢失、参数解析缺失。适用于所有 bash 脚本维护工作。
triggers:
  - patch bash 脚本
  - 修改 bash 脚本
  - bash 函数丢失
  - patch 后脚本报错
---

# Bash 脚本安全 Patch 指南

## 三大常见误伤

### 1. 函数定义了，但永远没被调用

**症状**：脚本跑起来行为不对，但 `bash -n` 语法检查通过。

**根因**：`patch` 替换整块时，如果旧字符串和新字符串都在文件里，patch 工具的报告说"Found N matches"但实际只替换了第一个——旧定义可能残留在文件里，或者 `parse_args "$@"` 这种调用行根本没在新位置出现。

**防御**：

```bash
# patch 后必须执行这两步：

# 步骤A：检查重复函数定义
grep -n "^[a-zA-Z_][a-zA-Z0-9_]*() {" script.sh

# 步骤B（关键）：验证 --help 立即退出
script.sh --help
# 期望：立即输出帮助并 exit 0，不应有网络检测、git 操作等前置行为
```

### 2. patch 吞掉整行技能组

**症状**：修改 RETAINED_SKILLS 数组时，patch 替换后少了一整块技能。

**根因**：`old_string` 匹配了多行时，如果用默认 `replace_all=false`，只替换第一个匹配。剩余的"看起来匹配"的行留在文件里。

**防御**：

```bash
# patch 后必须执行计数验证
python3 -c "
import re
with open('script.sh') as f:
    skills = re.findall(r'\"([a-zA-Z0-9_/-]+)\"', open('script.sh').read().read())
print(f'Count: {len(skills)}')
"
```

### 3. 函数定义顺序不对

**症状**：`bash -n` 通过，但运行时说 "command not found"。

**根因**：bash 函数必须在调用前定义。常见于把函数定义移到文件底部做"代码整理"时。

**防御**：函数定义永远放在文件上半部，调用点放在下半部。逻辑顺序：

```
#!/bin/bash
全局变量/常量
函数定义A
函数定义B
函数定义C
parse_args "$@"          ← 最优先解析全局选项（--help 等）
main()                   ← 主流程函数
main "$@"                ← 最后调用
```

## Patch 后必做清单

```bash
# 1. 语法检查
bash -n script.sh

# 2. 重复函数检查
grep -c "^[a-zA-Z_][a-zA-Z0-9_]*() {" script.sh
# 期望：无重复或所有重复都是合法的

# 3. --help 立即退出（最快发现函数调用丢失）
script.sh --help
# 期望：立即输出，exit 0

# 4. 实际运行一个简单路径
script.sh --check-only
# 期望：运行到网络检测后正常退出

# 5. 关键行存在性检查
grep -n 'parse_args "\$@"' script.sh   # 参数解析调用
grep -n 'main "\$@"' script.sh          # 主入口调用
```

## 常见危险模式

| 模式 | 风险 | 安全做法 |
|------|------|---------|
| `patch` 替换整块函数 | 旧定义残留或新调用缺失 | patch 后 grep 函数名全文件 |
| 替换 `fi`/`done` 结尾的块 | 多行块匹配到第一个而非目标 | 包含唯一注释行作为锚点 |
| 用 `old_string` 含 `\n` | CRLF 行尾导致 count 失准 | 用 `execute_code` 的 `rb` 模式字节替换 |
| 函数定义在调用点之后 | 运行时报 command not found | 遵循"定义在上、调用在下"顺序 |

---

_版本: 1.0.0_
_updated: 2026-04-14_
