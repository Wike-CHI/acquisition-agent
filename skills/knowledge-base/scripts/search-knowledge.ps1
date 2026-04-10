# Search Knowledge Base
# 用法: .\search-knowledge.ps1 -Query "cement"

param(
    [Parameter(Mandatory=$true)]
    [string]$Query
)

$ErrorActionPreference = "Stop"

# NAS配置
$NAS_IP = "192.168.0.194"
$NAS_USER = "HOLO"
$NAS_PASS = "Hl88889999"

# 映射驱动器
$DriveLetter = "K:"
$MountPath = "\\$NAS_IP\home"

# 连接NAS
try {
    if (!(Test-Path "$DriveLetter\knowledge")) {
        net use $DriveLetter $MountPath /user:$NAS_USER $NAS_PASS 2>&1 | Out-Null
    }
} catch {
    Write-Output (@{success=$false; error="无法连接NAS: $_"} | ConvertTo-Json -Compress)
    exit 1
}

$basePath = "$DriveLetter\knowledge"
$results = @()

# 搜索企业档案
$companyFiles = Get-ChildItem "$basePath\companies\*.md" -ErrorAction SilentlyContinue
foreach ($file in $companyFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    if ($content -match $Query) {
        $slug = $file.BaseName
        $title = if ($content -match '(?s)^#\s+(.+)$') { $matches[1] } else { $slug }

        $results += @{
            type = "company"
            slug = $slug
            title = $title
            path = $file.FullName
            lastModified = $file.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
        }
    }
}

# 搜索市场报告
$marketFiles = Get-ChildItem "$basePath\market-research\*.md" -Recurse -ErrorAction SilentlyContinue
foreach ($file in $marketFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    if ($content -match $Query) {
        $slug = $file.BaseName
        $title = if ($content -match '(?s)^#\s+(.+)$') { $matches[1] } else { $slug }

        $results += @{
            type = "market"
            slug = $slug
            title = $title
            path = $file.FullName
            lastModified = $file.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
        }
    }
}

Write-Output (@{
    success = $true
    query = $Query
    count = $results.Count
    results = $results
} | ConvertTo-Json -Compress)
