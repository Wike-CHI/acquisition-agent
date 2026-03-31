# 测试脚本

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "全网获客系统 - 测试 v1.2.0" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 测试1: 检查渠道
Write-Host "测试 1/4: 检查渠道状态" -ForegroundColor Yellow
Write-Host ""

$mcporterList = mcporter list 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ mcporter 可用" -ForegroundColor Green
    
    # 检查各渠道
    $channels = @("weibo", "exa", "linkedin", "douyin")
    foreach ($channel in $channels) {
        if ($mcporterList -match $channel) {
            Write-Host "  ✅ $channel" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $channel" -ForegroundColor Red
        }
    }
} else {
    Write-Host "❌ mcporter 不可用" -ForegroundColor Red
}

Write-Host ""

# 测试2: 微博搜索
Write-Host "测试 2/4: 微博搜索" -ForegroundColor Yellow
Write-Host ""

try {
    $result = mcporter call "weibo.search_users(keyword: '输送带', limit: 3)" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 微博搜索成功" -ForegroundColor Green
        Write-Host $result
    } else {
        Write-Host "❌ 微博搜索失败" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 微博搜索出错: $_" -ForegroundColor Red
}

Write-Host ""

# 测试3: Exa搜索
Write-Host "测试 3/4: Exa 搜索" -ForegroundColor Yellow
Write-Host ""

try {
    $result = mcporter call "exa.web_search_exa(query: 'conveyor belt manufacturer', numResults: 3)" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Exa 搜索成功" -ForegroundColor Green
    } else {
        Write-Host "❌ Exa 搜索失败" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Exa 搜索出错: $_" -ForegroundColor Red
}

Write-Host ""

# 测试4: Jina Reader
Write-Host "测试 4/4: Jina Reader" -ForegroundColor Yellow
Write-Host ""

try {
    $result = curl.exe -s "https://r.jina.ai/https://www.example.com" 2>&1
    if ($result -match "Example") {
        Write-Host "✅ Jina Reader 可用" -ForegroundColor Green
    } else {
        Write-Host "❌ Jina Reader 不可用" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Jina Reader 出错: $_" -ForegroundColor Red
}

Write-Host ""

# 完成提示
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ 测试完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "如果所有测试通过，系统已准备就绪！" -ForegroundColor Yellow
Write-Host ""
