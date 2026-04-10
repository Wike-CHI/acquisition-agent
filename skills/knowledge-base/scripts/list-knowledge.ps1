# List Knowledge Base Entries
# 用法: .\list-knowledge.ps1 -Type companies

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("companies", "contacts", "market", "emails", "all")]
    [string]$Type = "all",

    [int]$Limit = 50
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
$results = @{}

# 企业档案
if ($Type -eq "companies" -or $Type -eq "all") {
    $companies = @()
    $companyFiles = Get-ChildItem "$basePath\companies\*.md" -ErrorAction SilentlyContinue | Select-Object -First $Limit
    foreach ($file in $companyFiles) {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        $title = if ($content -match '(?s)^#\s+(.+)$') { $matches[1].Trim() } else { $file.BaseName }
        $icpScore = if ($content -match 'icp_score:\s*(\d+)') { [int]$matches[1] } else { 0 }
        $icpGrade = if ($content -match 'icp_grade:\s*([A-D])') { $matches[1] } else { "?" }

        $companies += @{
            slug = $file.BaseName
            title = $title
            icpScore = $icpScore
            icpGrade = $icpGrade
            lastModified = $file.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
        }
    }
    $results.companies = $companies
}

# 联系人
if ($Type -eq "contacts" -or $Type -eq "all") {
    $contacts = @()
    $contactFiles = Get-ChildItem "$basePath\contacts\*.md" -Recurse -ErrorAction SilentlyContinue | Select-Object -First $Limit
    foreach ($file in $contactFiles) {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        $title = if ($content -match '(?s)^#\s+(.+)$') { $matches[1].Trim() } else { $file.BaseName }

        $contacts += @{
            slug = $file.BaseName
            company = $file.Directory.Name
            title = $title
            lastModified = $file.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
        }
    }
    $results.contacts = $contacts
}

# 市场报告
if ($Type -eq "market" -or $Type -eq "all") {
    $marketFiles = Get-ChildItem "$basePath\market-research\*.md" -Recurse -ErrorAction SilentlyContinue | Select-Object -First $Limit
    $results.market = @($marketFiles | ForEach-Object {
        @{
            slug = $_.BaseName
            title = $_.BaseName
            path = $_.FullName.Replace("$DriveLetter\knowledge\", "")
            lastModified = $_.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
        }
    })
}

# 统计
$results.summary = @{
    companiesCount = (Get-ChildItem "$basePath\companies\*.md" -ErrorAction SilentlyContinue).Count
    contactsCount = (Get-ChildItem "$basePath\contacts\*.md" -Recurse -ErrorAction SilentlyContinue).Count
    marketCount = (Get-ChildItem "$basePath\market-research\*.md" -Recurse -ErrorAction SilentlyContinue).Count
}

$results.success = $true
$results.type = $Type

Write-Output ($results | ConvertTo-Json -Compress)
