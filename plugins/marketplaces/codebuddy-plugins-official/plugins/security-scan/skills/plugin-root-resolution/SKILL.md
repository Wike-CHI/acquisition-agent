---
name: plugin-root-resolution
description: 插件根目录定位协议。在命令执行前自动触发，确定 resource/、scripts/、references/ 等目录的绝对路径。
---

# 插件根目录定位协议

按以下优先级，命中即停：

| 优先级 | 来源 | 说明 |
|-------|------|------|
| 1 | `YD_CODEBUDDY_PLUGIN_ROOT` | 自定义/内测插件路径，优先使用 |
| 2 | `CODEBUDDY_PLUGIN_ROOT` | 官方插件路径 |
| 3 | 兜底 | `~/.codebuddy/plugins/marketplaces/codebuddy-plugins-official/plugins/security-scan/` |

## 定位步骤

**不要一次性执行多行脚本**（按以下顺序逐条执行单行命令，命中即停：

### 步骤 1：检查 YD_CODEBUDDY_PLUGIN_ROOT

```bash
echo "${YD_CODEBUDDY_PLUGIN_ROOT:-EMPTY}" && [ -d "${YD_CODEBUDDY_PLUGIN_ROOT:-/nonexistent}/resource" ] && echo "OK" || echo "SKIP"
```

- 输出路径 + `OK` → `plugin_root` = 该路径，**停止，不执行后续步骤**
- 输出 `SKIP` → 继续步骤 2

### 步骤 2：检查 CODEBUDDY_PLUGIN_ROOT

```bash
echo "${CODEBUDDY_PLUGIN_ROOT:-EMPTY}" && [ -d "${CODEBUDDY_PLUGIN_ROOT:-/nonexistent}/resource" ] && echo "OK" || echo "SKIP"
```

- 输出路径 + `OK` → `plugin_root` = 该路径，**停止**
- 输出 `SKIP` → 继续步骤 3

### 步骤 3：检查兜底路径

```bash
[ -d "$HOME/.codebuddy/plugins/marketplaces/codebuddy-plugins-official/plugins/security-scan/resource" ] && echo "$HOME/.codebuddy/plugins/marketplaces/codebuddy-plugins-official/plugins/security-scan OK" || echo "SKIP"
```

- 输出路径 + `OK` → `plugin_root` = 该路径
- 输出 `SKIP` → 三级都未命中，以无资源模式继续执行

## 定位结果处理

- **OK** → 记住 `plugin_root`，以下子目录可用：
  - `$plugin_root/resource/` — 规则、配置等 YAML 资源
  - `$plugin_root/scripts/` — 可执行脚本
  - `$plugin_root/references/` — 编排器参考文档（orchestrator-rules、lsp-setup 等）
- **WARN** → 无插件资源可用，跳过所有需要 `plugin_root` 的步骤，继续执行扫描

命令中出现的 `references/xxx.md` 引用，实际路径为 `$plugin_root/references/xxx.md`。

## 隔离规则

`plugin_root` 存在时：

- 所有插件内文件引用**必须**用 `$plugin_root/...` 绝对路径前缀
- **禁止** Glob 搜索插件文件（如 `glob("**/security-scan/...")`）
- 文件缺失时直接跳过，不从其他路径补
