#Requires -Version 5.1
<#
.SYNOPSIS
    HOLO活动日志写入脚本
.DESCRIPTION
    将操作日志写入NAS共享盘的CSV文件
.PARAMETER NasIP
    NAS IP地址，默认192.168.0.194
.PARAMETER NasUser
    NAS用户名，默认HOLO
.PARAMETER NasPass
    NAS密码（通过对话传递，不存储）
.PARAMETER SkillName
    触发的技能名称
.PARAMETER ActionType
    操作类型：search/research/email_gen/email_send/linkedin/facebook/quote/other
.PARAMETER Customer
    目标客户名称（可选）
.PARAMETER Result
    结果状态：success/partial/fail/skip/pending
.PARAMETER Score
    结果评分（可选，0-100）
.PARAMETER DurationSec
    执行耗时秒数（可选）
.PARAMETER Notes
    备注信息（可选）
.EXAMPLE
    .\log-activity.ps1 -SkillName "company-research" -ActionType "research" -Customer "ABC Corp" -Result "success" -Score 85 -Notes "ICP:85"
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$NasIP = "192.168.0.194",

    [Parameter(Mandatory=$false)]
    [string]$NasUser = "HOLO",

    [Parameter(Mandatory=$false)]
    [string]$NasPass = "",

    [Parameter(Mandatory=$true)]
    [string]$SkillName,

    [Parameter(Mandatory=$true)]
    [ValidateSet("search", "research", "email_gen", "email_send", "linkedin", "facebook", "quote", "delivery", "icp_score", "other")]
    [string]$ActionType,

    [Parameter(Mandatory=$false)]
    [string]$Customer = "",

    [Parameter(Mandatory=$true)]
    [ValidateSet("success", "partial", "fail", "skip", "pending")]
    [string]$Result,

    [Parameter(Mandatory=$false)]
    [string]$Score = "",

    [Parameter(Mandatory=$false)]
    [int]$DurationSec = 0,

    [Parameter(Mandatory=$false)]
    [string]$Notes = ""
)

# ==================== 配置 ====================
$SharePath = "\\$NasIP\home\activity"
$DateStr = (Get-Date).ToString("yyyy-MM-dd")
$FileName = "$DateStr.csv"
$FullPath = Join-Path $SharePath $FileName

# CSV表头
$Header = "timestamp|device_id|ip|skill_name|action_type|customer|result|score|duration_sec|notes"

# ==================== 工具函数 ====================

function Get-DeviceInfo {
    <#
    .DESCRIPTION
        获取设备信息：用户名@IP
    #>
    # 获取当前用户名
    $UserName = [System.Environment]::UserName
    if ([string]::IsNullOrEmpty($UserName)) {
        $UserName = $env:USERNAME
    }

    # 获取IP地址（优先有线网络）
    $IP = "unknown"
    try {
        $Adapters = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
            Where-Object { $_.InterfaceAlias -notmatch "VPN|Virtual|Hyper-V|Loopback" -and $_.IPAddress -notmatch "^127|^169.254" }

        if ($Adapters) {
            # 优先选择有线网络
            $Wired = $Adapters | Where-Object { $_.InterfaceAlias -match "Ethernet|LAN|有线" }
            if ($Wired) {
                $IP = $Wired[0].IPAddress
            } else {
                $IP = $Adapters[0].IPAddress
            }
        }
    } catch {
        # 降级方案
        $IP = (Test-Connection -ComputerName $NasIP -Count 1 -ErrorAction SilentlyContinue |
            Select-Object -ExpandProperty IPV4Address -ErrorAction SilentlyContinue) -as [string]
        if ([string]::IsNullOrEmpty($IP)) {
            $IP = "unknown"
        }
    }

    return @{
        UserName = $UserName
        IP = $IP
        DeviceID = "$UserName@$IP"
    }
}

function Connect-NAS {
    <#
    .DESCRIPTION
        连接NAS共享盘
    #>
    param(
        [string]$Server,
        [string]$User,
        [string]$Pass
    )

    # 先尝试检查是否已连接
    $Existing = Get-SmbConnection -ServerName $Server -ErrorAction SilentlyContinue
    if ($Existing) {
        return $true
    }

    # 使用net use连接（不保存凭据）
    $Cmd = "net use `"$SharePath`" /user:$User $Pass /PERSISTENT:NO 2>&1"
    $Output = cmd /c $Cmd

    if ($LASTEXITCODE -eq 0) {
        return $true
    } else {
        Write-Error "NAS连接失败: $Output"
        return $false
    }
}

function Ensure-Directory {
    <#
    .DESCRIPTION
        确保目录存在，不存在则创建
    #>
    param([string]$Path)

    try {
        if (-not (Test-Path $Path -ErrorAction SilentlyContinue)) {
            # 分离UNC路径为驱动器映射
            $Parts = $Path -split '\\', 4
            if ($Parts.Count -ge 4) {
                $ServerPath = "\\$($Parts[2])\$($Parts[3])"
                # 创建远程目录
                $CreateCmd = "cmd /c `"mkdir `"$ServerPath`" 2>nul`""
                Invoke-Expression $CreateCmd
            }
        }
        return $true
    } catch {
        Write-Error "创建目录失败: $_"
        return $false
    }
}

function Write-LogEntry {
    <#
    .DESCRIPTION
        构造并写入日志行
    #>
    param(
        [hashtable]$DeviceInfo,
        [string]$SkillName,
        [string]$ActionType,
        [string]$Customer,
        [string]$Result,
        [string]$Score,
        [int]$DurationSec,
        [string]$Notes
    )

    # 获取时间戳（带毫秒）
    $Timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss.fff")

    # 清理内容
    $Customer = $Customer.Trim() -replace '\r?\n', ' '
    $Notes = $Notes.Trim() -replace '\r?\n', ' '

    # 截断超长备注
    if ($Notes.Length -gt 500) {
        $Notes = $Notes.Substring(0, 497) + "..."
    }

    # 替换分隔符
    $Customer = $Customer -replace '\|', '·'
    $Notes = $Notes -replace '\|', '·'

    # 构造CSV行
    $Fields = @(
        $Timestamp,
        $DeviceInfo.DeviceID,
        $DeviceInfo.IP,
        $SkillName,
        $ActionType,
        $Customer,
        $Result,
        $(if ($Score) { $Score } else { "" }),
        $(if ($DurationSec -gt 0) { $DurationSec } else { "" }),
        $Notes
    )

    $Line = $Fields -join '|'
    return $Line
}

function Append-ToCSV {
    <#
    .DESCRIPTION
        追加写入CSV文件
    #>
    param(
        [string]$FilePath,
        [string]$Content
    )

    try {
        # 检查文件是否存在
        $FileExists = Test-Path $FilePath -ErrorAction SilentlyContinue

        if (-not $FileExists) {
            # 创建新文件，写入表头
            $ContentToWrite = "$Header`r`n$Content"
        } else {
            # 追加内容
            $ContentToWrite = $Content
        }

        # 追加写入（UTF-8 with BOM）
        $Encoding = New-Object System.Text.UTF8Encoding $true
        [System.IO.File]::AppendAllText($FilePath, "$ContentToWrite`r`n", $Encoding)

        return $true
    } catch {
        Write-Error "写入文件失败: $_"
        return $false
    }
}

# ==================== 主流程 ====================

function Write-HoloActivityLog {
    <#
    .DESCRIPTION
        写入HOLO活动日志的主函数
    #>

    # 1. 检查NAS密码
    if ([string]::IsNullOrEmpty($NasPass)) {
        Write-Warning "NAS密码未提供，尝试使用已保存的连接..."
        # 继续尝试写入，不强制要求密码
    }

    # 2. 获取设备信息
    $DeviceInfo = Get-DeviceInfo

    # 3. 连接NAS
    if ($NasPass) {
        $Connected = Connect-NAS -Server $NasIP -User $NasUser -Pass $NasPass
        if (-not $Connected) {
            Write-Warning "NAS连接失败，尝试继续..."
        }
    } else {
        # 无密码时检查是否已连接
        $Existing = Get-SmbConnection -ServerName $NasIP -ErrorAction SilentlyContinue
        if (-not $Existing) {
            Write-Warning "NAS未连接且未提供密码，请先运行: net use `"$SharePath`" /user:HOLO <密码>"
        }
    }

    # 4. 确保目录存在
    $DirReady = Ensure-Directory -Path $SharePath

    # 5. 构造日志行
    $LogLine = Write-LogEntry -DeviceInfo $DeviceInfo -SkillName $SkillName `
        -ActionType $ActionType -Customer $Customer -Result $Result `
        -Score $Score -DurationSec $DurationSec -Notes $Notes

    # 6. 写入文件
    $Written = Append-ToCSV -FilePath $FullPath -Content $LogLine

    # 7. 返回结果
    if ($Written) {
        $Result = @{
            Success = $true
            Message = "日志写入成功"
            FilePath = $FullPath
            LogLine = $LogLine
            DeviceID = $DeviceInfo.DeviceID
        }
    } else {
        $Result = @{
            Success = $false
            Message = "日志写入失败"
            FilePath = $FullPath
            LogLine = $LogLine
            DeviceID = $DeviceInfo.DeviceID
        }
    }

    return $Result
}

# 执行并输出JSON结果
$Output = Write-HoloActivityLog
$Output | ConvertTo-Json -Compress
exit $(if ($Output.Success) { 0 } else { 1 })
