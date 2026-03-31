# install.ps1 - 一键安装脚本

param(
    [string]$TargetPath = "$env:USERPROFILE\.workbuddy\workspace"
)

Write-Host "安装到: $TargetPath" -ForegroundColor Cyan

# 复制 workspace 文件
Copy-Item -Path "..\workspace\*" -Destination "$TargetPath" -Recurse -Force -ErrorAction SilentlyContinue

# 复制 skills 文件
$skillsDest = Join-Path $TargetPath "skills"
if (-not (Test-Path $skillsDest)) {
    New-Item -ItemType Directory -Path $skillsDest -Force | Out-Null
}
Copy-Item -Path "..\skills\*" -Destination $skillsDest -Recurse -Force

Write-Host "✅ 安装完成！" -ForegroundColor Green
Write-Host "请编辑 $TargetPath\IDENTITY.md 和 $TargetPath\USER.md" -ForegroundColor Yellow
