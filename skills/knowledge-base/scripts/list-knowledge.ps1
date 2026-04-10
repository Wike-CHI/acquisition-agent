# List Knowledge Base Entries
# 用法: .\list-knowledge.ps1 -Type companies

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("companies", "contacts", "market", "emails", "all")]
    [string]$Type = "all",

    [int]$Limit = 50
)

# NAS配置
$NAS_IP = "192.168.0.194"
$NAS_USER = "HOLO"
$NAS_PASS = "Hl88889999"
$DriveLetter = "K:"
$basePath = "$DriveLetter\knowledge"

$results = @{}

# 企业档案
if ($Type -eq "companies" -or $Type -eq "all") {
    $companies = @()
    Get-ChildItem "$basePath\companies\*.md" -ErrorAction SilentlyContinue | Select-Object -First $Limit | ForEach-Object {
        $content = Get-Content $_.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
        $companies += @{
            slug=$_.BaseName
            title=if($content -and $content -match '(?s)^#\s+(.+?)$'){$matches[1].Trim()}else{$_.BaseName}
            icpScore=if($content -and $content -match 'icp_score:\s*(\d+)'){[int]$matches[1]}else{0}
            icpGrade=if($content -and $content -match 'icp_grade:\s*([A-D])'){$matches[1]}else{"?"}
            lastModified=$_.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
        }
    }
    $results.companies = $companies
}

# 联系人
if ($Type -eq "contacts" -or $Type -eq "all") {
    $contacts = @()
    Get-ChildItem "$basePath\contacts\*.md" -Recurse -ErrorAction SilentlyContinue | Select-Object -First $Limit | ForEach-Object {
        $content = Get-Content $_.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
        $contacts += @{
            slug=$_.BaseName
            company=$_.Directory.Name
            title=if($content -and $content -match '(?s)^#\s+(.+?)$'){$matches[1].Trim()}else{$_.BaseName}
            lastModified=$_.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
        }
    }
    $results.contacts = $contacts
}

# 统计
$results.summary = @{
    companiesCount=(Get-ChildItem "$basePath\companies\*.md" -ErrorAction SilentlyContinue).Count
    contactsCount=(Get-ChildItem "$basePath\contacts\*.md" -Recurse -ErrorAction SilentlyContinue).Count
    marketCount=(Get-ChildItem "$basePath\market-research\*.md" -Recurse -ErrorAction SilentlyContinue).Count
}

$results.success = $true
$results.type = $Type

$results | ConvertTo-Json -Compress
