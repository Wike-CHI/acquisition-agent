# Write Knowledge Base Entry
# 用法: .\write-knowledge.ps1 -Type company -Name "National Cement Ethiopia" -Content $report

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("company", "contact", "market", "email", "products")]
    [string]$Type,

    [Parameter(Mandatory=$true)]
    [string]$Name,

    [Parameter(Mandatory=$true)]
    [string]$Content,

    [string]$SubName = "",

    [string]$Overwrite = "yes",

    [string]$DriveLetter = "K:"
)

# 加载共享模块
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
. "$scriptDir\nas-common.ps1"

# 确保NAS已挂载
$mountPath = "\\$NAS_IP\home"
if (-not (Ensure-NasMount -DriveLetter $DriveLetter -SharePath $mountPath)) {
    @{success=$false; error="NAS mount failed"; drive=$DriveLetter; path=$mountPath} | ConvertTo-Json -Compress
    exit 1
}

$slug = New-Slug $Name
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$basePath = "$DriveLetter\knowledge"
$deviceId = Get-DeviceId

# 构建路径
switch ($Type) {
    "company" { $dirPath = "$basePath\companies"; $filePath = "$dirPath\$slug.md" }
    "contact" { $dirSlug = New-Slug $Name; $dirPath = "$basePath\contacts\$dirSlug"; $filePath = "$dirPath\$(if($SubName){New-Slug $SubName}else{'contact'}).md" }
    "market" { $dirPath = "$basePath\market-research"; $filePath = "$dirPath\$slug.md" }
    "email" { $dirPath = "$basePath\emails"; $filePath = "$dirPath\$slug.md" }
    "products" { $dirPath = "$basePath\products"; $filePath = "$dirPath\$slug.md" }
}

# 创建目录
if (!(Test-Path $dirPath)) { New-Item -ItemType Directory -Path $dirPath -Force | Out-Null }

# 检查是否已存在
$isNew = !(Test-Path $filePath)

# 处理metadata
if ($Type -eq "company") {
    if ($Overwrite -eq "yes" -or $isNew) {
        $icpScore = if ($Content -match 'icp_score:\s*(\d+)') { [int]$matches[1] } else { 0 }
        $icpGrade = if ($Content -match 'icp_grade:\s*([A-D])') { $matches[1] } else { "C" }

        $metaHeader = "---`ntitle: $Name`nstatus: researched`nicp_score: $icpScore`nicp_grade: $icpGrade`nlast_researcher: $deviceId`nlast_research_time: $timestamp`nresearch_count: 1`ncreated_time: $timestamp`n---`n`n"

        if ($Content -match '(?s)^---.*?---') {
            $Content = $Content -replace '(?s)^---.*?---', $metaHeader.Trim()
        } else {
            $Content = $metaHeader + $Content
        }
    }
}

# 写入
$Content | Out-File -FilePath $filePath -Encoding UTF8 -Force

# 更新research_count
if ($Type -eq "company" -and !$isNew) {
    $existingContent = Get-Content $filePath -Raw -Encoding UTF8
    if ($existingContent -match 'research_count:\s*(\d+)') {
        $count = [int]$matches[1] + 1
        $existingContent = $existingContent -replace 'research_count:\s*\d+', "research_count: $count"
        $existingContent = $existingContent -replace 'last_researcher:\s*.+', "last_researcher: $deviceId"
        $existingContent = $existingContent -replace 'last_research_time:\s*.+', "last_research_time: $timestamp"
        $existingContent | Out-File -FilePath $filePath -Encoding UTF8 -Force
    }
}

# 输出结果
$finalCount = 1
$finalContent = Get-Content $filePath -Raw -Encoding UTF8
if ($finalContent -match 'research_count:\s*(\d+)') { $finalCount = [int]$matches[1] }

@{success=$true; type=$Type; slug=$slug; path=$filePath; isNew=$isNew; researchCount=$finalCount; timestamp=$timestamp} | ConvertTo-Json -Compress
