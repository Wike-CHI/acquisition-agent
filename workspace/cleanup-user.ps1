# cleanup-user.ps1 — 清理业务员生成的 workspace 配置文件
#
# 使用方式：
#   powershell workspace/cleanup-user.ps1
#   powershell workspace/cleanup-user.ps1 -Force  (跳过确认)

param([switch]$Force)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

$generatedFiles = @(
    "USER.md",
    "IDENTITY.md",
    "AGENTS.md",
    "TOOLS.md",
    "SOUL.md",
    "MEMORY.md",
    "HEARTBEAT.md"
)

$found = @()
foreach ($file in $generatedFiles) {
    $path = Join-Path $ScriptDir $file
    if (Test-Path $path) {
        $found += $path
    }
}

if ($found.Count -eq 0) {
    Write-Host "没有找到已生成的配置文件，无需清理。"
    exit 0
}

Write-Host "将删除以下业务员配置文件："
foreach ($f in $found) {
    Write-Host "  - $(Split-Path $f -Leaf)"
}
Write-Host ""

if (-not $Force) {
    $confirm = Read-Host "确认删除？(y/N)"
    if ($confirm -ne 'y' -and $confirm -ne 'Y') {
        Write-Host "已取消。"
        exit 0
    }
}

foreach ($f in $found) {
    Remove-Item $f -Force
    Write-Host "🗑️  已删除 $(Split-Path $f -Leaf)"
}

Write-Host ""
Write-Host "Done. 已清理 $($found.Count) 个配置文件。"
Write-Host "下次运行 初始化获客系统 时会重新生成。"
