# 启动所有服务

param(
    [switch]$Background = $true
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "全网获客系统 - 启动服务 v1.2.0" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查端口占用
Write-Host "🔍 检查端口..." -ForegroundColor Yellow

$ports = @{
    "LinkedIn MCP" = 8001
    "抖音 MCP" = 18070
}

foreach ($service in $ports.Keys) {
    $port = $ports[$service]
    $inUse = netstat -ano | Select-String ":$port\s"
    
    if ($inUse) {
        Write-Host "⚠️ $service 端口 $port 已被占用" -ForegroundColor Yellow
    } else {
        Write-Host "✅ $service 端口 $port 可用" -ForegroundColor Green
    }
}

Write-Host ""

# 启动 LinkedIn MCP
Write-Host "🚀 启动 LinkedIn MCP..." -ForegroundColor Yellow

$linkedinProcess = Get-Process python -ErrorAction SilentlyContinue | 
    Where-Object { $_.CommandLine -like "*linkedin*" }

if (-not $linkedinProcess) {
    if ($Background) {
        Start-Process -FilePath "python" -ArgumentList "-m", "linkedin_mcp_server", "--transport", "streamable-http", "--port", "8001" -WindowStyle Hidden
        Write-Host "✅ LinkedIn MCP 已后台启动 (端口 8001)" -ForegroundColor Green
    } else {
        Start-Process -FilePath "python" -ArgumentList "-m", "linkedin_mcp_server", "--transport", "streamable-http", "--port", "8001"
        Write-Host "✅ LinkedIn MCP 已启动 (端口 8001)" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️ LinkedIn MCP 已在运行" -ForegroundColor Yellow
}

Write-Host ""

# 启动抖音 MCP
Write-Host "🚀 启动抖音 MCP..." -ForegroundColor Yellow

$douyinProcess = Get-Process python -ErrorAction SilentlyContinue | 
    Where-Object { $_.CommandLine -like "*douyin*" }

if (-not $douyinProcess) {
    if ($Background) {
        Start-Process -FilePath "python" -ArgumentList "-m", "douyin_mcp_server" -WindowStyle Hidden
        Write-Host "✅ 抖音 MCP 已后台启动 (端口 18070)" -ForegroundColor Green
    } else {
        Start-Process -FilePath "python" -ArgumentList "-m", "douyin_mcp_server"
        Write-Host "✅ 抖音 MCP 已启动 (端口 18070)" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️ 抖音 MCP 已在运行" -ForegroundColor Yellow
}

Write-Host ""

# 等待服务启动
Write-Host "⏳ 等待服务启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 检查服务状态
Write-Host ""
Write-Host "🔍 检查服务状态..." -ForegroundColor Yellow

$linkedinRunning = netstat -ano | Select-String ":8001\s"
$douyinRunning = netstat -ano | Select-String ":18070\s"

if ($linkedinRunning) {
    Write-Host "✅ LinkedIn MCP 运行中" -ForegroundColor Green
} else {
    Write-Host "❌ LinkedIn MCP 未运行" -ForegroundColor Red
}

if ($douyinRunning) {
    Write-Host "✅ 抖音 MCP 运行中" -ForegroundColor Green
} else {
    Write-Host "⚠️ 抖音 MCP 未运行" -ForegroundColor Yellow
}

Write-Host ""

# 检查 mcporter
Write-Host "🔍 检查 mcporter..." -ForegroundColor Yellow

$mcporterList = mcporter list 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ mcporter 可用" -ForegroundColor Green
    Write-Host ""
    Write-Host $mcporterList
} else {
    Write-Host "❌ mcporter 不可用" -ForegroundColor Red
}

Write-Host ""

# 完成提示
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ 服务启动完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "可用渠道:" -ForegroundColor Yellow
Write-Host "  ✅ 微博 (weibo)" -ForegroundColor Green
Write-Host "  ✅ Exa 搜索 (exa)" -ForegroundColor Green

if ($linkedinRunning) {
    Write-Host "  ✅ LinkedIn (linkedin)" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ LinkedIn (linkedin) - 浏览器初始化中" -ForegroundColor Yellow
}

if ($douyinRunning) {
    Write-Host "  ✅ 抖音 (douyin)" -ForegroundColor Green
} else {
    Write-Host "  ❌ 抖音 (douyin) - 未启动" -ForegroundColor Red
}

Write-Host ""
Write-Host "停止服务: .\stop-services.ps1" -ForegroundColor Gray
Write-Host ""
