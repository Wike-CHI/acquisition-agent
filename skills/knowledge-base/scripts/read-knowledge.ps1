# Read Knowledge Base Entry
# 用法: .\read-knowledge.ps1 -Type company -Name "National Cement Ethiopia"
#       .\read-knowledge.ps1 -Type products -Name "风冷机三代"
#       .\read-knowledge.ps1 -Type market -Name "东南亚市场"

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("company", "contact", "market", "email", "products")]
    [string]$Type,

    [Parameter(Mandatory=$true)]
    [string]$Name,

    [string]$SubName = "",

    [string]$DriveLetter = "K:"
)

# 加载共享模块
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
. "$scriptDir\nas-common.ps1"

# 确保NAS已挂载
$mountPath = "\\$NAS_IP\home"
if (-not (Ensure-NasMount -DriveLetter $DriveLetter -SharePath $mountPath)) {
    @{exists=$false; error="NAS mount failed"; drive=$DriveLetter; path=$mountPath} | ConvertTo-Json -Compress
    exit 1
}

$slug = New-Slug $Name
$basePath = "$DriveLetter\knowledge"

# 构建路径
switch ($Type) {
    "company" { $filePath = "$basePath\companies\$slug.md" }
    "contact" { $filePath = "$basePath\contacts\$slug\$(if($SubName){New-Slug $SubName}else{'contact'}).md" }
    "market" { $filePath = "$basePath\market-research\$slug.md" }
    "email" { $filePath = "$basePath\emails\$slug.md" }
    "products" { $filePath = "$basePath\products\$slug.md" }
}

# 读取文件
if (Test-Path $filePath) {
    $content = Get-Content $filePath -Raw -Encoding UTF8
    $meta = @{exists=$true; type=$Type; slug=$slug; path=$filePath; lastModified=(Get-Item $filePath).LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")}

    if ($Type -eq "company") {
        if ($content -match 'icp_score:\s*(\d+)') { $meta.icpScore = [int]$matches[1] }
        if ($content -match 'icp_grade:\s*([A-D])') { $meta.icpGrade = $matches[1] }
        if ($content -match 'last_researcher:\s*(.+)') { $meta.lastResearcher = $matches[1].Trim() }
        if ($content -match 'last_research_time:\s*(.+)') { $meta.lastResearchTime = $matches[1].Trim() }
        if ($content -match 'research_count:\s*(\d+)') { $meta.researchCount = [int]$matches[1] }
    }

    @{exists=$true; metadata=$meta; content=$content} | ConvertTo-Json -Compress
} else {
    @{exists=$false; type=$Type; slug=$slug; expectedPath=$filePath} | ConvertTo-Json -Compress
}
