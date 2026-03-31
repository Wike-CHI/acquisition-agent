# 将 pre-commit 示例安装到包含本技能包的 Git 仓库（向上查找 .git）
$ErrorActionPreference = "Stop"
$skillRoot = Split-Path $PSScriptRoot -Parent
$sample = Join-Path $skillRoot "scripts/hooks/pre-commit.sample"
if (-not (Test-Path $sample)) { Write-Error "缺少 scripts/hooks/pre-commit.sample"; exit 1 }

$dir = $skillRoot
$gitDir = $null
while ($dir) {
    $cand = Join-Path $dir ".git"
    if (Test-Path $cand) { $gitDir = $cand; break }
    $parent = Split-Path $dir -Parent
    if ($parent -eq $dir) { break }
    $dir = $parent
}
if (-not $gitDir) {
    Write-Host "自 $skillRoot 向上未找到 .git，跳过安装。"
    exit 0
}

$hooks = Join-Path $gitDir "hooks"
$target = Join-Path $hooks "pre-commit"
New-Item -ItemType Directory -Force -Path $hooks | Out-Null
# 内联写入，避免 pre-commit 需再猜子路径：在钩子里用环境变量或固定相对路径
$hookBody = @"
#!/bin/sh
SKILL_ROOT="$($skillRoot -replace '\\', '/')"
cd "`$SKILL_ROOT" && node scripts/audit-skill-consistency.mjs || exit 1
"@
# Windows Git 常用 bash；若纯 cmd 可改用 pwsh -File
$hookBody | Set-Content -Path $target -Encoding UTF8
Write-Host "已写入: $target（SKILL_ROOT=$skillRoot）"
Write-Host "Git Bash 下建议: chmod +x `"$target`""
