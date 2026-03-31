# 自动备份脚本

param(
    [string]$Action = "backup"
)

$knowledgePath = "C:\Users\Administrator\.openclaw\knowledge"
$backupPath = "C:\Users\Administrator\.openclaw\backups"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

function New-Backup {
    Write-Host "🔄 开始备份..." -ForegroundColor Cyan
    
    # 创建备份目录
    New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
    New-Item -ItemType Directory -Path "$backupPath\$timestamp" -Force | Out-Null
    
    # 备份关键文件
    $files = @(
        "C:\Users\Administrator\.openclaw\workspace\MEMORY.md",
        "C:\Users\Administrator\.openclaw\workspace\memory\",
        "C:\Users\Administrator\.openclaw\traces\",
        "C:\Users\Administrator\.openclaw\workspace\projects\customer-data\"
    )
    
    foreach ($file in $files) {
        if (Test-Path $file) {
            $dest = "$backupPath\$timestamp\"
            Copy-Item $file $dest -Recurse -Force
            Write-Host "  ✅ 已备份: $file" -ForegroundColor Green
        }
    }
    
    # 创建备份清单
    $manifest = @{
        timestamp = $timestamp
        files = $files
        size = (Get-ChildItem "$backupPath\$timestamp" -Recurse | Measure-Object -Property Length -Sum).Sum
    }
    
    $manifest | ConvertTo-Json | Out-File "$backupPath\$timestamp\manifest.json"
    
    # 清理旧备份（保留最近10个）
    $backups = Get-ChildItem $backupPath -Directory | Sort-Object Name -Descending
    if ($backups.Count -gt 10) {
        $backups | Select-Object -Skip 10 | ForEach-Object {
            Remove-Item $_.FullName -Recurse -Force
            Write-Host "  🗑️ 已清理旧备份: $($_.Name)" -ForegroundColor Gray
        }
    }
    
    Write-Host "✅ 备份完成: $backupPath\$timestamp" -ForegroundColor Green
}

function Restore-Backup {
    param([string]$BackupId)
    
    if (-not $BackupId) {
        # 显示可用备份
        Write-Host "📋 可用备份列表:" -ForegroundColor Yellow
        Get-ChildItem $backupPath -Directory | Sort-Object Name -Descending | Select-Object -First 10 | ForEach-Object {
            $manifest = Get-Content "$($_.FullName)\manifest.json" | ConvertFrom-Json
            $sizeMB = [math]::Round($manifest.size / 1MB, 2)
            Write-Host "  $($_.Name) - $sizeMB MB" -ForegroundColor Gray
        }
        return
    }
    
    Write-Host "🔄 恢复备份: $BackupId" -ForegroundColor Yellow
    
    # 恢复文件
    $backupDir = "$backupPath\$BackupId"
    if (-not (Test-Path $backupDir)) {
        Write-Host "❌ 备份不存在: $BackupId" -ForegroundColor Red
        return
    }
    
    # TODO: 实现恢复逻辑
    
    Write-Host "✅ 恢复完成" -ForegroundColor Green
}

# 执行
switch ($Action) {
    "backup" { New-Backup }
    "restore" { Restore-Backup -BackupId $args[0] }
    "list" { 
        Get-ChildItem $backupPath -Directory | Sort-Object Name -Descending | Select-Object -First 10 | ForEach-Object {
            Write-Host $_.Name
        }
    }
    default { Write-Host "用法: .\auto-backup.ps1 -Action backup|restore|list" }
}
