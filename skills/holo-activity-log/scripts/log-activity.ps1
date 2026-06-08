# Activity Log Writer
# 用法: .\log-activity.ps1 -ActionType search -Customer "Test Corp" -Result success -Score 5
#       .\log-activity.ps1 -ActionType email_send -Customer "Acme Ltd" -Result success -SkillName email-sender

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("search", "email", "research", "icp_score", "email_gen", "email_send", "quote", "report")]
    [string]$ActionType,

    [Parameter(Mandatory=$true)]
    [string]$Result,

    [string]$Customer = "",

    [int]$Score = 0,

    [string]$Notes = "",

    [string]$SkillName = "",

    [string]$DriveLetter = "K:"
)

# 加载共享模块
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
. "$scriptDir\..\knowledge-base\scripts\nas-common.ps1"

# 确保NAS已挂载
$mountPath = "\\$NAS_IP\home"
if (-not (Ensure-NasMount -DriveLetter $DriveLetter -SharePath $mountPath)) {
    # 降级：写入本地
    $logDir = "$env:USERPROFILE\.openclaw\activity"
    if (!(Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir -Force | Out-Null }
    $logFile = "$logDir\$(Get-Date -Format 'yyyy-MM-dd').csv"
} else {
    $logDir = "$DriveLetter\..\AI数据\activity"
    # \\192.168.0.98\home\..\AI数据\activity = \\192.168.0.98\AI数据\activity
    if (!(Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir -Force | Out-Null }
    $logFile = "$logDir\$(Get-Date -Format 'yyyy-MM-dd').csv"
}

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$deviceId = Get-DeviceId

# CSV header
$header = "timestamp,device,action_type,customer,result,score,notes,skill_name"

# 如果文件不存在，创建并写入header
if (!(Test-Path $logFile)) {
    $header | Out-File -FilePath $logFile -Encoding UTF8
}

# 转义CSV特殊字符
$escapedCustomer = if ($Customer) { $Customer -replace '"', '""' } else { "" }
$escapedNotes = if ($Notes) { $Notes -replace '"', '""' } else { "" }
$escapedSkill = if ($SkillName) { $SkillName -replace '"', '""' } else { "" }

# 构建CSV行
$csvLine = """$timestamp"",""$deviceId"",""$ActionType"",""$escapedCustomer"",""$Result"",""$Score"",""$escapedNotes"",""$escapedSkill"""

# 追加写入
$csvLine | Out-File -FilePath $logFile -Encoding UTF8 -Append

@{success=$true; action_type=$ActionType; customer=$Customer; result=$Result; score=$Score; timestamp=$timestamp; device=$deviceId; logFile=$logFile} | ConvertTo-Json -Compress
