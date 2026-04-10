# Read Knowledge Base Entry
# 用法: .\read-knowledge.ps1 -Type company -Name "National Cement Ethiopia"

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("company", "contact", "market", "email")]
    [string]$Type,

    [Parameter(Mandatory=$true)]
    [string]$Name,

    [string]$SubName = ""  # 用于contact类型，联系人姓名
)

$ErrorActionPreference = "Stop"

# NAS配置
$NAS_IP = "192.168.0.194"
$NAS_USER = "HOLO"
$NAS_PASS = "Hl88889999"  # 密码由调用者提供，这里用固定值

# 映射驱动器
$DriveLetter = "K:"
$MountPath = "\\$NAS_IP\home"

# 连接NAS
try {
    if (!(Test-Path "$DriveLetter\knowledge")) {
        net use $DriveLetter $MountPath /user:$NAS_USER $NAS_PASS 2>&1 | Out-Null
    }
} catch {
    Write-Output (@{exists=$false; error="无法连接NAS: $_"} | ConvertTo-Json -Compress)
    exit 1
}

# 生成slug
function New-Slug($text) {
    $text.ToLower() -replace '[^a-z0-9]+', '-' -replace '^-|-$', ''
}

$slug = New-Slug $Name
$basePath = "$DriveLetter\knowledge"

# 根据类型构建路径
switch ($Type) {
    "company" {
        $filePath = "$basePath\companies\$slug.md"
    }
    "contact" {
        $contactSlug = if ($SubName) { New-Slug $SubName } else { "contact" }
        $filePath = "$basePath\contacts\$slug\$contactSlug.md"
    }
    "market" {
        $filePath = "$basePath\market-research\$slug.md"
    }
    "email" {
        $filePath = "$basePath\emails\$slug.md"
    }
}

# 检查文件是否存在
if (Test-Path $filePath) {
    $content = Get-Content $filePath -Raw -Encoding UTF8

    # 提取metadata
    $meta = @{
        exists = $true
        type = $Type
        slug = $slug
        path = $filePath
        lastModified = (Get-Item $filePath).LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
    }

    # 如果是公司档案，提取ICP信息
    if ($Type -eq "company" -and $content -match 'icp_score:\s*(\d+)') {
        $meta.icpScore = [int]$matches[1]
    }
    if ($Type -eq "company" -and $content -match 'icp_grade:\s*([A-D])') {
        $meta.icpGrade = $matches[1]
    }
    if ($content -match 'last_researcher:\s*(.+)') {
        $meta.lastResearcher = $matches[1].Trim()
    }
    if ($content -match 'last_research_time:\s*(.+)') {
        $meta.lastResearchTime = $matches[1].Trim()
    }
    if ($content -match 'research_count:\s*(\d+)') {
        $meta.researchCount = [int]$matches[1]
    }

    Write-Output (@{
        exists = $true
        metadata = $meta
        content = $content
    } | ConvertTo-Json -Compress)
} else {
    Write-Output (@{
        exists = $false
        type = $Type
        slug = $slug
        expectedPath = $filePath
    } | ConvertTo-Json -Compress)
}
