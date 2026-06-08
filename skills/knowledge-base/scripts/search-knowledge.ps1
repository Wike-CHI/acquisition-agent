# Search Knowledge Base
# 用法: .\search-knowledge.ps1 -Query "cement"

param(
    [Parameter(Mandatory=$true)]
    [string]$Query
)

# NAS配置（凭证从环境变量读取，不要硬编码！）
$NAS_IP = "192.168.0.98"
$NAS_USER = if ($env:NAS_USER) { $env:NAS_USER } else { "HOLO-AGENT" }
$NAS_PASS = if ($env:NAS_PASSWORD) { $env:NAS_PASSWORD } else { "" }
$DriveLetter = "K:"
$basePath = "$DriveLetter\knowledge"

$results = @()
$escapedQuery = [regex]::Escape($Query)

# 搜索企业档案
Get-ChildItem "$basePath\companies\*.md" -ErrorAction SilentlyContinue | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    if ($content -and $content -match $escapedQuery) {
        $results += @{type="company"; slug=$_.BaseName; title=if($content -match '(?s)^#\s+(.+?)$'){$matches[1].Trim()}else{$_.BaseName}; path=$_.FullName; lastModified=$_.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")}
    }
}

# 搜索市场报告
Get-ChildItem "$basePath\market-research\*.md" -Recurse -ErrorAction SilentlyContinue | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    if ($content -and $content -match $escapedQuery) {
        $results += @{type="market"; slug=$_.BaseName; title=if($content -match '(?s)^#\s+(.+?)$'){$matches[1].Trim()}else{$_.BaseName}; path=$_.FullName; lastModified=$_.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")}
    }
}

@{success=$true; query=$Query; count=$results.Count; results=$results} | ConvertTo-Json -Compress
