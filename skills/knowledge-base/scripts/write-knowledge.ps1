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

    [string]$Overwrite = "yes"
)

# NAS配置
$NAS_IP = "192.168.0.194"
$NAS_USER = "HOLO-AGENT"
$NAS_PASS = "Hl88889999"
$DriveLetter = "K:"
$MountPath = "\\$NAS_IP\home"

# 生成slug - 支持中英文
function New-Slug($text) {
    if ($text -match '^[\w]+$') {
        # 纯英文/数字，直接小写
        return $text.ToLower()
    }
    # 中文或其他语言：用URL编码的前4位 + 拼音首字母缩写
    $result = ""
    # 提取所有汉字拼音首字母（简单实现）
    $chars = $text.ToCharArray()
    foreach ($c in $chars) {
        if ([int]$c -gt 127) {
            # 非ASCII字符用短横线替代
            $result += "-"
        } else {
            $result += $c
        }
    }
    # 清理
    $result = $result -replace '-+', '-' -replace '^-|-$', ''
    if ([string]::IsNullOrEmpty($result)) {
        # 兜底：用时间戳
        return (Get-Date -Format "yyyyMMddHHmmss")
    }
    return $result
}

$slug = New-Slug $Name
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$basePath = "$DriveLetter\knowledge"

# 获取当前设备信息
$localIP = $env:COMPUTERNAME
try {
    $netIP = Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Ethernet*" -ErrorAction Stop | Select-Object -First 1
    if ($netIP.IPAddress) { $localIP = $netIP.IPAddress }
} catch {}
$deviceId = "$env:USERNAME@$localIP"

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

        $metaHeader = "---\ntitle: $Name\nstatus: researched\nicp_score: $icpScore\nicp_grade: $icpGrade\nlast_researcher: $deviceId\nlast_research_time: $timestamp\nresearch_count: 1\ncreated_time: $timestamp\n---\n\n"

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
