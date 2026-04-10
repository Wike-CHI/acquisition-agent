#Requires -Version 5.1
<#
.SYNOPSIS
    HOLO邮件收件检测脚本
.DESCRIPTION
    通过IMAP连接邮箱，检查新邮件并返回结构化数据
.PARAMETER Email
    邮箱地址
.PARAMETER ImapServer
    IMAP服务器地址
.PARAMETER ImapPort
    IMAP端口，默认993
.PARAMETER AuthCode
    邮箱授权码（不是密码）
.PARAMETER Filter
    筛选条件：all/unread/new/reply
.EXAMPLE
    .\check-inbox.ps1 -Email "test@163.com" -ImapServer "imap.163.com" -AuthCode "xxxx"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$Email,

    [Parameter(Mandatory=$true)]
    [string]$ImapServer,

    [Parameter(Mandatory=$false)]
    [int]$ImapPort = 993,

    [Parameter(Mandatory=$true)]
    [string]$AuthCode,

    [Parameter(Mandatory=$false)]
    [ValidateSet("all", "unread", "new", "reply")]
    [string]$Filter = "unread"
)

# ==================== 邮箱服务预设 ====================
$PresetServers = @{
    "imap.163.com" = @{ Port = 993; Name = "网易163" }
    "imap.qq.com"  = @{ Port = 993; Name = "QQ邮箱" }
    "imap.126.com" = @{ Port = 993; Name = "网易126" }
    "imap.gmail.com" = @{ Port = 993; Name = "Gmail" }
    "outlook.office365.com" = @{ Port = 993; Name = "Outlook" }
    "imap.aliyun.com" = @{ Port = 993; Name = "阿里云邮箱" }
    "imap.exmail.qq.com" = @{ Port = 993; Name = "腾讯企业邮箱" }
}

# ==================== 日志函数 ====================
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "DEBUG" { "Gray" }
        "INFO" { "Cyan" }
        "WARN" { "Yellow" }
        "ERROR" { "Red" }
        "SUCCESS" { "Green" }
        default { "White" }
    }
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

# ==================== 核心函数 ====================

function Connect-IMAP {
    param(
        [string]$Server,
        [int]$Port,
        [string]$Email,
        [string]$AuthCode
    )

    try {
        Write-Log "正在连接 $Server`:$Port..."
        
        # 使用TCPClient + SslStream
        Add-Type -AssemblyName System
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $tcpClient.Connect($Server, $Port)
        $sslStream = New-Object System.Net.Security.SslStream($tcpClient.GetStream(), $false, {
            param($sender, $certificate, $chain, $errors) $true
        })
        $sslStream.AuthenticateAsClient($Server)
        
        # 创建读写流（使用ASCII避免BOM问题）
        $reader = New-Object System.IO.StreamReader($sslStream, [System.Text.Encoding]::ASCII)
        $writer = New-Object System.IO.StreamWriter($sslStream, [System.Text.Encoding]::ASCII)
        $writer.AutoFlush = $true
        
        # 读取服务器欢迎信息
        $welcome = $reader.ReadLine()
        Write-Log "服务器响应: $welcome" "DEBUG"
        
        # 发送登录命令（163邮箱需要去掉引号）
        $tag = "A001"
        # 163邮箱格式：LOGIN user@163.com password
        $loginCmd = "$tag LOGIN $Email $AuthCode"
        $writer.WriteLine($loginCmd)
        Write-Log "发送登录命令..." "DEBUG"
        
        $response = $reader.ReadLine()
        Write-Log "登录响应: $response" "DEBUG"
        
        if ($response -match "A001 OK") {
            Write-Log "✅ 登录成功" "SUCCESS"
            return @{
                Success = $true
                Reader = $reader
                Writer = $writer
                SslStream = $sslStream
                TcpClient = $tcpClient
            }
        } else {
            Write-Log "❌ 登录失败: $response" "ERROR"
            return @{ Success = $false; Error = $response }
        }
    }
    catch {
        Write-Log "❌ 连接失败: $_" "ERROR"
        return @{ Success = $false; Error = $_.Exception.Message }
    }
}

function Send-IMAPCommand {
    param([hashtable]$Connection, [string]$Tag, [string]$Command)
    
    $reader = $Connection.Reader
    $writer = $Connection.Writer
    
    $writer.WriteLine("$Tag $Command")
    Write-Log "发送: $Command" "DEBUG"
    
    $responses = @()
    while (($line = $reader.ReadLine()) -and $line -notmatch "^$Tag") {
        $responses += $line
        Write-Log "响应: $line" "DEBUG"
    }
    
    return @{
        Lines = $responses
        FinalLine = if ($responses.Count -gt 0) { $responses[-1] } else { "" }
        Success = $responses[-1] -match "OK"
    }
}

function Get-Emails {
    param(
        [hashtable]$Connection,
        [string]$Filter = "unread"
    )
    
    $reader = $Connection.Reader
    $writer = $Connection.Writer
    
    # 选择收件箱
    Write-Log "选择收件箱..." "INFO"
    $tag = "A002"
    $writer.WriteLine("$tag SELECT INBOX")
    
    $existsCount = 0
    while (($line = $reader.ReadLine()) -and $line -notmatch "^$tag") {
        if ($line -match "^\* (\d+) EXISTS") {
            $existsCount = [int]$Matches[1]
        }
    }
    Write-Log "收件箱邮件总数: $existsCount" "INFO"
    
    # 根据筛选条件搜索
    $searchCmd = switch ($Filter) {
        "unread" { "SEARCH UNSEEN" }
        "new" { "SEARCH NEW" }
        "reply" { 'SEARCH SUBJECT "Re:"' }
        default { "SEARCH ALL" }
    }
    
    Write-Log "搜索邮件: $searchCmd" "INFO"
    $tag = "A003"
    $writer.WriteLine("$tag $searchCmd")
    
    $searchResult = ""
    while (($line = $reader.ReadLine()) -and $line -notmatch "^$tag") {
        $searchResult += $line
    }
    
    # 提取邮件ID列表
    $ids = ($searchResult -replace "$tag SEARCH ", "").Trim() -split "\s+" | Where-Object { $_ }
    
    if (-not $ids) {
        Write-Log "没有找到符合条件的邮件" "INFO"
        return @()
    }
    
    Write-Log "找到 $($ids.Count) 封邮件" "INFO"
    
    # 获取每封邮件的概览
    $emails = @()
    foreach ($id in $ids) {
        $writer.WriteLine("A$id FETCH $id (ENVELOPE)")
        
        $headerContent = ""
        while (($line = $reader.ReadLine()) -and $line -notmatch "^A$id") {
            $headerContent += $line + "`n"
        }
        
        # 解析ENVELOPE
        $emailData = @{
            email_id = $id
            from_address = ""
            from_name = ""
            subject = ""
            date = ""
            is_read = $false
            is_reply = $false
        }
        
        # 简单解析From字段
        if ($headerContent -match "From\s+\(([^)]*)\)\s+<(.+?)>") {
            $emailData.from_name = $Matches[1].Trim()
            $emailData.from_address = $Matches[2].Trim()
        } elseif ($headerContent -match "From\s+<(.+?)>") {
            $emailData.from_address = $Matches[1].Trim()
        }
        
        # 解析Subject
        if ($headerContent -match "Subject\s+\(([^)]*)\)") {
            $emailData.subject = $Matches[1].Trim()
            $emailData.is_reply = $Matches[1] -match "^Re:|^RE:"
        }
        
        # 解析Date
        if ($headerContent -match "Date\s+\(([^)]*)\)") {
            $emailData.date = $Matches[1].Trim()
        }
        
        $emails += $emailData
    }
    
    return $emails
}

function Disconnect-IMAP {
    param([hashtable]$Connection)
    
    try {
        $Connection.Writer.WriteLine("A999 LOGOUT")
        $Connection.Reader.ReadLine() | Out-Null
        $Connection.SslStream.Close()
        $Connection.TcpClient.Close()
        Write-Log "已断开连接" "INFO"
    }
    catch {
        Write-Log "断开连接时出错: $_" "WARN"
    }
}

# ==================== 主程序 ====================

Write-Log "========== HOLO 邮件收件检测 ==========" "INFO"
Write-Log "邮箱: $Email" "INFO"
Write-Log "IMAP: $ImapServer`:$ImapPort" "INFO"
Write-Log "筛选: $Filter" "INFO"

# 连接
$connection = Connect-IMAP -Server $ImapServer -Port $ImapPort -Email $Email -AuthCode $AuthCode

if (-not $connection.Success) {
    $result = @{
        success = $false
        error = $connection.Error
        message = "连接失败"
    }
    $result | ConvertTo-Json -Compress
    exit 1
}

# 获取邮件
$emails = Get-Emails -Connection $connection -Filter $Filter

# 断开连接
Disconnect-IMAP -Connection $connection

# 输出结果
$result = @{
    success = $true
    email = $Email
    imap_server = $ImapServer
    filter = $Filter
    total_found = $emails.Count
    emails = $emails
    checked_at = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
}

Write-Log "========== 检测完成 ==========" "INFO"
Write-Log "找到 $($emails.Count) 封符合条件的邮件" "SUCCESS"

$result | ConvertTo-Json -Depth 5 -Compress
