# Write Knowledge Base Entry
# 用法: .\write-knowledge.ps1 -Type company -Name "National Cement Ethiopia" -Content $report

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("company", "contact", "market", "email")]
    [string]$Type,

    [Parameter(Mandatory=$true)]
    [string]$Name,

    [Parameter(Mandatory=$true)]
    [string]$Content,

    [string]$SubName = "",  # 用于contact类型

    [string]$Overwrite = "yes"  # yes=覆盖, no=追加
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

# 生成slug
function New-Slug($text) {
    $text.ToLower() -replace '[^a-z0-9]+', '-' -replace '^-|-$', ''
}

$slug = New-Slug $Name
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$basePath = "$DriveLetter\knowledge"

# 获取当前设备信息
$deviceId = "$env:USERNAME@$((Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Ethernet*" -ErrorAction SilentlyContinue | Select-Object -First 1).IPAddress)"

# 根据类型构建路径
switch ($Type) {
    "company" {
        $dirPath = "$basePath\companies"
        $filePath = "$dirPath\$slug.md"
    }
    "contact" {
        $contactSlug = if ($SubName) { New-Slug $SubName } else { "contact" }
        $dirPath = "$basePath\contacts\$slug"
        $filePath = "$dirPath\$contactSlug.md"
    }
    "market" {
        $dirPath = "$basePath\market-research"
        $filePath = "$dirPath\$slug.md"
    }
    "email" {
        $dirPath = "$basePath\emails"
        $filePath = "$dirPath\$slug.md"
    }
}

# 创建目录
try {
    if (!(Test-Path $dirPath)) {
        New-Item -ItemType Directory -Path $dirPath -Force | Out-Null
    }
} catch {
    Write-Output (@{success=$false; error="无法创建目录: $_"} | ConvertTo-Json -Compress)
    exit 1
}

# 检查是否已存在
$isNew = !(Test-Path $filePath)

# 处理公司档案的metadata
if ($Type -eq "company") {
    if ($Overwrite -eq "yes" -or $isNew) {
        # 覆盖模式：添加/更新metadata头
        $metaHeader = @"
---
title: $Name
status: researched
icp_score: 0
icp_grade: C
last_researcher: $deviceId
last_research_time: $timestamp
research_count: 1
created_time: $timestamp
---

"@
        # 如果内容已有frontmatter，替换它
        if ($Content -match '^---[\s\S]*?---') {
            $Content = $Content -replace '(?s)^---[\s\S]*?---', $metaHeader.Trim()
        } else {
            $Content = $metaHeader + $Content
        }
    }
} elseif ($Type -eq "contact") {
    # 联系人档案
    $metaHeader = @"
---
title: $SubName at $Name
company: $Name
type: contact
last_updated: $timestamp
updated_by: $deviceId
created_time: $timestamp
---

"@
    if ($Content -match '^---[\s\S]*?---') {
        $Content = $Content -replace '(?s)^---[\s\S]*?---', $metaHeader.Trim()
    } else {
        $Content = $metaHeader + $Content
    }
}

# 写入文件
try {
    $Content | Out-File -FilePath $filePath -Encoding UTF8 -Force

    # 更新公司档案的research_count
    if ($Type -eq "company" -and !$isNew) {
        $existingContent = Get-Content $filePath -Raw -Encoding UTF8
        if ($existingContent -match 'research_count:\s*(\d+)') {
            $count = [int]$matches[1] + 1
            $existingContent = $existingContent -replace "research_count:\s*\d+", "research_count: $count"
            $existingContent = $existingContent -replace "last_researcher:\s*.+", "last_researcher: $deviceId"
            $existingContent = $existingContent -replace "last_research_time:\s*.+", "last_research_time: $timestamp"
            $existingContent | Out-File -FilePath $filePath -Encoding UTF8 -Force
        }
    }

    Write-Output (@{
        success = $true
        type = $Type
        slug = $slug
        path = $filePath
        isNew = $isNew
        timestamp = $timestamp
    } | ConvertTo-Json -Compress)

} catch {
    Write-Output (@{success=$false; error="写入失败: $_"} | ConvertTo-Json -Compress)
    exit 1
}
