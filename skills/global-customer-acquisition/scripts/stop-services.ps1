# 停止所有服务

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "全网获客系统 - 停止服务 v1.2.0" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 查找并停止 LinkedIn MCP
Write-Host "🛑 停止 LinkedIn MCP..." -ForegroundColor Yellow

$linkedinProcesses = Get-Process python -ErrorAction SilentlyContinue | 
    Where-Object { $_.CommandLine -like "*linkedin*" }

if ($linkedinProcesses) {
    $linkedinProcesses | Stop-Process -Force
    Write-Host "✅ LinkedIn MCP 已停止" -ForegroundColor Green
} else {
    Write-Host "⚠️ LinkedIn MCP 未运行" -ForegroundColor Yellow
}

Write-Host ""

# 查找并停止抖音 MCP
Write-Host "🛑 停止抖音 MCP..." -ForegroundColor Yellow

$douyinProcesses = Get-Process python -ErrorAction SilentlyContinue | 
    Where-Object { $_.CommandLine -like "*douyin*" }

if ($douyinProcesses) {
    $douyinProcesses | Stop-Process -Force
    Write-Host "✅ 抖音 MCP 已停止" -ForegroundColor Green
} else {
    Write-Host "⚠️ 抖音 MCP 未运行" -ForegroundColor Yellow
}

Write-Host ""

# 检查端口是否释放
Write-Host "🔍 检查端口..." -ForegroundColor Yellow

$linkedinPort = netstat -ano | Select-String ":8001\s"
$douyinPort = netstat -ano | Select-String ":18070\s"

if (-not $linkedinPort) {
    Write-Host "✅ 端口 8001 已释放" -ForegroundColor Green
} else {
    Write-Host "⚠️ 端口 8001 仍在使用" -ForegroundColor Yellow
}

if (-not $douyinPort) {
    Write-Host "✅ 端口 18070 已释放" -ForegroundColor Green
} else {
    Write-Host "⚠️ 端口 18070 仍在使用" -ForegroundColor Yellow
}

Write-Host ""

# 完成提示
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ 所有服务已停止！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
