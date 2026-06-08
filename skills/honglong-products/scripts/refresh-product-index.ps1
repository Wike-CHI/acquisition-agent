# refresh-product-index.ps1 — 扫描 NAS 产品目录，生成轻量索引 JSON
# 用途：技能加载前先检查索引，判断 NAS 产品文件是否有更新
# 输出：skills/honglong-products/references/.product-index.json

param(
  [string]$NasPath = "\\192.168.0.98\home\knowledge\products",
  [string]$OutputFile = $null
)

$ErrorActionPreference = "Stop"

if (-not $OutputFile) {
  $OutputFile = Join-Path $PSScriptRoot "..\references\.product-index.json"
}

$index = @{
  generatedAt  = (Get-Date -Format "yyyy-MM-ddTHH:mm:sszzz")
  nasPath      = $NasPath
  totalFiles   = 0
  totalSize    = 0
  categories   = @{}
  lastScanHash = ""
}

if (-not (Test-Path $NasPath)) {
  Write-Warning "NAS 产品知识库不可访问: $NasPath"
  $index.error = "NAS_UNAVAILABLE"
  $index | ConvertTo-Json -Depth 4 | Set-Content $OutputFile -Encoding UTF8
  Write-Output "索引已生成 (离线模式): $OutputFile"
  exit 0
}

$allFiles = @()
Get-ChildItem $NasPath -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object {
  $allFiles += @{
    relativePath = $_.FullName.Substring($NasPath.Length + 1)
    size         = $_.Length
    lastModified = $_.LastWriteTime.ToString("yyyy-MM-ddTHH:mm:sszzz")
  }
}

# 按目录分类
$dirs = Get-ChildItem $NasPath -Directory -ErrorAction SilentlyContinue
foreach ($dir in $dirs) {
  $catFiles = @()
  Get-ChildItem $dir.FullName -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object {
    $catFiles += @{
      name         = $_.Name
      relativePath = $_.FullName.Substring($NasPath.Length + 1)
      size         = $_.Length
      lastModified = $_.LastWriteTime.ToString("yyyy-MM-ddTHH:mm:sszzz")
    }
  }
  $index.categories[$dir.Name] = @{
    fileCount = $catFiles.Count
    files     = $catFiles
  }
}

$index.totalFiles = $allFiles.Count
$index.totalSize = ($allFiles | Measure-Object -Property size -Sum).Sum

# 生成内容哈希用于变更检测
$hashInput = ($allFiles | Sort-Object relativePath | ForEach-Object { "$($_.relativePath)|$($_.lastModified)" }) -join "`n"
$index.lastScanHash = [System.BitConverter]::ToString(
  [System.Security.Cryptography.SHA256]::Create().ComputeHash(
    [System.Text.Encoding]::UTF8.GetBytes($hashInput)
  )
).Replace("-", "").ToLower()

$index | ConvertTo-Json -Depth 6 | Set-Content $OutputFile -Encoding UTF8
Write-Output "索引已生成: $OutputFile"
Write-Output "  分类数: $($dirs.Count)"
Write-Output "  文件数: $($index.totalFiles)"
Write-Output "  总大小: $([math]::Round($index.totalSize / 1MB, 2)) MB"
Write-Output "  哈希值: $($index.lastScanHash)"
