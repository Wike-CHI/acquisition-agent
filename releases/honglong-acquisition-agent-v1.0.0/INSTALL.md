# 安装指南

## 系统要求

- WorkBuddy 2.0+
- PowerShell 5.1+
- Git（可选，用于版本控制）

## 安装步骤

### 方法1: 解压到工作空间

\\\ash
unzip honglong-acquisition-agent-v1.0.0.zip -d ~/.workbuddy/workspace
\\\

### 方法2: 使用安装脚本

\\\powershell
cd honglong-acquisition-agent-v1.0.0\deploy
.\install.ps1
\\\

## 配置

### 1. 编辑核心文件

编辑 \workspace/\ 目录下的文件：

| 文件 | 必须修改 |
|------|----------|
| \IDENTITY.md\ | ✅ 是 |
| \USER.md\ | ✅ 是 |
| \AGENTS.md\ | ⚠️ 可选 |

### 2. 配置渠道

编辑 \workspace/TOOLS.md\ 中的渠道配置。

## 验证安装

\\\
检查获客系统状态
\\\

## 技术支持

- 邮箱: wikeye2025@163.com
- 官网: holobelt.com
