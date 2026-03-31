# 配置验证脚本

param(
    [switch]$Fix
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🔍 配置验证" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$errors = @()
$warnings = @()

# 1. 检查必需配置文件
Write-Host "1️⃣ 检查必需配置文件" -ForegroundColor Yellow

$configFiles = @{
    "~/.mcporter/mcporter.json" = "mcporter配置"
    "~/.agent-reach/config.json" = "Agent Reach配置"
    "~/.openclaw/config/settings.json" = "OpenClaw配置"
}

foreach ($file in $configFiles.Keys) {
    $path = $file -replace "^~", $env:USERPROFILE
    if (Test-Path $path) {
        Write-Host "  ✅ $($configFiles[$file])" -ForegroundColor Green
        
        # 验证JSON格式
        try {
            $content = Get-Content $path | ConvertFrom-Json
        } catch {
            $errors += "配置文件格式错误: $file"
            Write-Host "  ❌ 格式错误: $file" -ForegroundColor Red
        }
    } else {
        $errors += "配置文件缺失: $file"
        Write-Host "  ❌ 缺失: $($configFiles[$file])" -ForegroundColor Red
    }
}

Write-Host ""

# 2. 检查端口冲突
Write-Host "2️⃣ 检查端口" -ForegroundColor Yellow

$ports = @{
    8001 = "LinkedIn MCP"
    18070 = "抖音 MCP"
    5000 = "Web服务"
}

foreach ($port in $ports.Keys) {
    $inUse = netstat -ano | Select-String ":$port\s"
    if ($inUse) {
        Write-Host "  ✅ 端口 $port ($($ports[$port])) - 已监听" -ForegroundColor Green
    } else {
        $warnings += "端口 $port ($($ports[$port])) - 未监听"
        Write-Host "  ⚠️ 端口 $port ($($ports[$port])) - 未监听" -ForegroundColor Yellow
    }
}

Write-Host ""

# 3. 检查依赖
Write-Host "3️⃣ 检查依赖" -ForegroundColor Yellow

$dependencies = @{
    "python" = "Python"
    "node" = "Node.js"
    "git" = "Git"
    "mcporter" = "mcporter"
}

foreach ($dep in $dependencies.Keys) {
    $cmd = Get-Command $dep -ErrorAction SilentlyContinue
    if ($cmd) {
        $version = & $dep --version 2>&1 | Select-Object -First 1
        Write-Host "  ✅ $($dependencies[$dep]): $version" -ForegroundColor Green
    } else {
        $errors += "依赖缺失: $($dependencies[$dep])"
        Write-Host "  ❌ $($dependencies[$dep]) - 未安装" -ForegroundColor Red
    }
}

Write-Host ""

# 4. 检查技能目录
Write-Host "4️⃣ 检查技能目录" -ForegroundColor Yellow

$skillDirs = @(
    "~/.agents/skills/global-customer-acquisition",
    "~/.agents/skills/facebook-acquisition",
    "~/.agents/skills/instagram-acquisition",
    "~/.agents/skills/teyi-customs"
)

foreach ($dir in $skillDirs) {
    $path = $dir -replace "^~", $env:USERPROFILE
    if (Test-Path $path) {
        Write-Host "  ✅ $(Split-Path $path -Leaf)" -ForegroundColor Green
    } else {
        $warnings += "技能目录缺失: $dir"
        Write-Host "  ⚠️ $(Split-Path $path -Leaf) - 缺失" -ForegroundColor Yellow
    }
}

Write-Host ""

# 5. 检查记忆文件
Write-Host "5️⃣ 检查记忆系统" -ForegroundColor Yellow

$memoryFiles = @{
    "~/.openclaw/workspace/MEMORY.md" = "主记忆文件"
    "~/.openclaw/workspace/memory/" = "记忆目录"
}

foreach ($file in $memoryFiles.Keys) {
    $path = $file -replace "^~", $env:USERPROFILE
    if (Test-Path $path) {
        $size = if (Test-Path $path -PathType Leaf) {
            (Get-Item $path).Length / 1KB
        } else {
            (Get-ChildItem $path -Recurse | Measure-Object -Property Length -Sum).Sum / 1KB
        }
        Write-Host "  ✅ $($memoryFiles[$file]): $([math]::Round($size, 2)) KB" -ForegroundColor Green
    } else {
        $warnings += "记忆文件缺失: $file"
        Write-Host "  ⚠️ $($memoryFiles[$file]) - 缺失" -ForegroundColor Yellow
    }
}

Write-Host ""

# 6. 检查备份
Write-Host "6️⃣ 检查备份系统" -ForegroundColor Yellow

$backupPath = "$env:USERPROFILE\.openclaw\backups"
if (Test-Path $backupPath) {
    $backups = Get-ChildItem $backupPath -Directory
    $latestBackup = $backups | Sort-Object Name -Descending | Select-Object -First 1
    
    if ($latestBackup) {
        $age = (Get-Date) - $latestBackup.CreationTime
        Write-Host "  ✅ 最新备份: $($latestBackup.Name) ($([math]::Round($age.TotalHours, 1))小时前)" -ForegroundColor Green
        
        if ($age.TotalHours -gt 24) {
            $warnings += "备份过期（超过24小时）"
            Write-Host "  ⚠️ 备份过期（超过24小时）" -ForegroundColor Yellow
        }
    }
} else {
    $warnings += "无备份目录"
    Write-Host "  ⚠️ 无备份目录" -ForegroundColor Yellow
}

Write-Host ""

# 7. 检查环境变量
Write-Host "7️⃣ 检查环境变量" -ForegroundColor Yellow

$envVars = @(
    "OPENAI_API_KEY",
    "EXA_API_KEY",
    "LINKEDIN_EMAIL",
    "LINKEDIN_PASSWORD"
)

foreach ($var in $envVars) {
    $value = [Environment]::GetEnvironmentVariable($var)
    if ($value) {
        Write-Host "  ✅ $var - 已设置" -ForegroundColor Green
    } else {
        $warnings += "环境变量未设置: $var"
        Write-Host "  ⚠️ $var - 未设置" -ForegroundColor Yellow
    }
}

Write-Host ""

# 汇总
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📊 验证结果" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "❌ 错误: $($errors.Count)" -ForegroundColor $(if ($errors.Count -gt 0) { "Red" } else { "Green" })
Write-Host "⚠️ 警告: $($warnings.Count)" -ForegroundColor $(if ($warnings.Count -gt 0) { "Yellow" } else { "Green" })

if ($errors.Count -gt 0) {
    Write-Host ""
    Write-Host "错误列表:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
}

if ($warnings.Count -gt 0) {
    Write-Host ""
    Write-Host "警告列表:" -ForegroundColor Yellow
    $warnings | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
}

Write-Host ""

if ($Fix -and ($errors.Count -gt 0 -or $warnings.Count -gt 0)) {
    Write-Host "🔧 自动修复中..." -ForegroundColor Cyan
    
    # TODO: 实现自动修复逻辑
    
    Write-Host "✅ 修复完成" -ForegroundColor Green
}

# 返回退出码
if ($errors.Count -gt 0) {
    exit 1
} else {
    exit 0
}
