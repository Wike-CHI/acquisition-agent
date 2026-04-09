# Browser-Use CLI 安装指南

安装脚本会自动完成以下工作：检测 Python 版本、安装 `uv` 包管理器、创建虚拟环境、安装 `browser-use` 包、安装 Playwright 及 Chromium 浏览器引擎，并配置 PATH。

**不需要**手动安装 Playwright 或 Selenium——安装脚本已包含。

---

## macOS

### 前置要求

- macOS 10.15+
- Python 3.11、3.12 或 3.13（**不支持 3.14+**）

```bash
# 检查 Python 版本
python3 --version

# 如未安装 Python，用 Homebrew 安装
brew install python@3.13
```

### 安装

```bash
curl -fsSL https://browser-use.com/cli/install.sh | bash
```

### 验证

```bash
# 重启终端后
browser-use doctor
```

---

## Linux

### 前置要求

- Python 3.11、3.12 或 3.13
- `curl`、`bash`

```bash
# Ubuntu / Debian
sudo apt update
sudo apt install -y python3.13 python3.13-venv curl

# Fedora / RHEL
sudo dnf install -y python3.13 curl
```

### 安装

```bash
curl -fsSL https://browser-use.com/cli/install.sh | bash
```

Playwright 安装 Chromium 时会自动拉取系统级依赖（`--with-deps`），无需额外操作。

### 验证

```bash
source ~/.bashrc   # 或 source ~/.zshrc
browser-use doctor
```

---

## Windows

### 前置要求

1. **Git Bash**（安装脚本基于 bash，Windows CMD/PowerShell 无法直接运行）

   ```powershell
   winget install Git.Git
   ```

2. **Python 3.11 / 3.12 / 3.13**（不支持 3.14+；ARM64 设备需安装 x64 版本）

   ```powershell
   # 标准 x64 机器
   winget install Python.Python.3.13

   # Surface Pro X 等 ARM64 设备
   winget install Python.Python.3.13 --architecture x64
   ```

### 安装

打开 **Git Bash**（不是 CMD 或 PowerShell）：

```bash
curl -fsSL https://browser-use.com/cli/install.sh | bash
```

或从 PowerShell 调用：

```powershell
& "C:\Program Files\Git\bin\bash.exe" -c 'curl -fsSL https://browser-use.com/cli/install.sh | bash'
```

### 验证

**重启终端**后运行：

```bash
browser-use doctor
```

### Windows 常见问题

| 问题 | 解决方案 |
|------|---------|
| `browser-use: command not found` | 重启 PowerShell（脚本已写入注册表 PATH，需新开窗口生效） |
| `Failed to start session server` | 杀死僵尸进程：`taskkill /IM python.exe /F` |
| ARM64 运行报错 | 卸载 ARM64 Python，改装 x64 版：`winget install Python.Python.3.13 --architecture x64` |
| 多个 Python 版本冲突 | 设置 `PY_PYTHON=3.13` 环境变量 |
| 虚拟环境损坏 | 删除旧环境重装：`Remove-Item -Recurse -Force "$env:USERPROFILE\.browser-use-env"` 后重新运行安装命令 |

---

## 安装后验证

```bash
browser-use doctor
```

输出示例：
```
✓ Python 3.13.x
✓ browser-use x.x.x
✓ Playwright installed
✓ Chromium installed
✓ PATH configured
```

所有项目显示 ✓ 即安装成功，随后即可使用 `browser-use open https://example.com`。
