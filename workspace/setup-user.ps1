# setup-user.ps1 — 从环境变量或命令行参数生成所有 workspace 配置文件
#
# 使用方式：
#   方式1: cp .env.example .env → 填写信息 → powershell workspace/setup-user.ps1
#   方式2: powershell workspace/setup-user.ps1 -OwnerName "张三" -Email "xx@163.com" ...
#
# 生成的文件：USER.md, IDENTITY.md, AGENTS.md, TOOLS.md,
#             SOUL.md, MEMORY.md, HEARTBEAT.md

param(
    [string]$OwnerName,
    [string]$DisplayName,
    [string]$CompanyName,
    [string]$CompanyFull,
    [string]$Brand,
    [string]$Email,
    [string]$Phone,
    [string]$Github,
    [string]$FactoryLocation,
    [string]$Timezone,
    [string]$Competitor,
    [string]$PipelinePath
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$EnvFile = Join-Path (Split-Path -Parent $ScriptDir) ".env"

# ── 默认值 ──
$vars = @{
    OWNER_NAME         = if ($OwnerName) { $OwnerName } else { "未设置" }
    OWNER_DISPLAY_NAME = if ($DisplayName) { $DisplayName } else { "未设置" }
    COMPANY_NAME       = if ($CompanyName) { $CompanyName } else { "HOLO Industrial Equipment Mfg Co., Ltd" }
    COMPANY_FULL_NAME  = if ($CompanyFull) { $CompanyFull } else { "温州红龙工业设备制造有限公司（HOLO Industrial Equipment Mfg Co., Ltd）" }
    BRAND_NAME         = if ($Brand) { $Brand } else { "HOLO" }
    OWNER_EMAIL        = if ($Email) { $Email } else { "未设置" }
    OWNER_PHONE        = if ($Phone) { $Phone } else { "未设置" }
    GITHUB_USER        = if ($Github) { $Github } else { "未设置" }
    FACTORY_LOCATION   = if ($FactoryLocation) { $FactoryLocation } else { "中国温州" }
    TIMEZONE           = if ($Timezone) { $Timezone } else { "中国（UTC+8）" }
    COMPETITOR_NAME    = if ($Competitor) { $Competitor } else { "Beltwin" }
    PIPELINE_DATA_PATH = if ($PipelinePath) { $PipelinePath } else { "C:/Users/$env:USERNAME/WorkBuddy/" }
}

# ── 从 .env 文件读取（如存在且无命令行参数）──
$hasParams = $OwnerName -or $DisplayName -or $Email -or $Phone
if (-not $hasParams -and (Test-Path $EnvFile)) {
    Get-Content $EnvFile | ForEach-Object {
        if ($_ -match '^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)$') {
            $key = $Matches[1]
            $val = $Matches[2].Trim()
            if ($vars.ContainsKey($key)) {
                $vars[$key] = $val
            }
        }
    }
}

# ── 每个模板文件使用的变量 ──
$fileVars = @{
    "USER.md"      = @("OWNER_NAME", "COMPANY_NAME", "BRAND_NAME", "OWNER_EMAIL", "OWNER_PHONE", "GITHUB_USER", "TIMEZONE")
    "IDENTITY.md"  = @("OWNER_DISPLAY_NAME", "COMPANY_NAME", "FACTORY_LOCATION", "BRAND_NAME", "COMPANY_FULL_NAME")
    "AGENTS.md"    = @("COMPANY_NAME", "OWNER_DISPLAY_NAME", "OWNER_PHONE", "OWNER_EMAIL")
    "TOOLS.md"     = @("OWNER_EMAIL", "PIPELINE_DATA_PATH")
    "SOUL.md"      = @("OWNER_NAME")
    "MEMORY.md"    = @("OWNER_NAME", "OWNER_DISPLAY_NAME")
    "HEARTBEAT.md" = @("OWNER_EMAIL", "COMPETITOR_NAME")
}

# ── 执行替换 ──
foreach ($file in $fileVars.Keys) {
    $src = Join-Path $ScriptDir ($file -replace '\.md$', '.template.md')
    $dst = Join-Path $ScriptDir $file

    if (-not (Test-Path $src)) {
        Write-Host "⚠️  跳过 $file（模板不存在: $src）"
        continue
    }

    $content = Get-Content $src -Raw -Encoding UTF8

    foreach ($varName in $fileVars[$file]) {
        $val = $vars[$varName]
        $pattern = '\$\{' + $varName + '\}'
        $content = $content -replace $pattern, $val
    }

    [System.IO.File]::WriteAllText($dst, $content, [System.Text.UTF8Encoding]::new($false))
    Write-Host "✅ $file"
}

Write-Host ""
Write-Host "Done. 所有 workspace 配置已生成。"
Write-Host "生成文件数: $($fileVars.Count)"
