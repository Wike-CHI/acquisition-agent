# 邮件批量发送脚本
# 用法: .\send-batch-emails.ps1 -CustomersFile "customers.json" -Template "cold-email"

param(
    [string]$CustomersFile,
    [string]$Template = "cold-email",
    [int]$DelaySeconds = 10,
    [switch]$DryRun = $false
)

# ============================================================
# 配置
# ============================================================

$CONFIG_DIR = "$env:USERPROFILE\.openclaw"
$CONFIG_FILE = "$CONFIG_DIR\.email_config.json"
$LOGS_DIR = "$CONFIG_DIR\email_logs"

# 发送限制
$MAX_PER_HOUR = 50
$MAX_PER_DAY = 200

# ============================================================
# 函数
# ============================================================

function Write-Header {
    Write-Host @"
╔════════════════════════════════════════════════════════════╗
║                  邮件批量发送工具                          ║
╚════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan
}

function Get-EmailConfig {
    if (-not (Test-Path $CONFIG_FILE)) {
        return $null
    }
    
    try {
        $config = Get-Content $CONFIG_FILE | ConvertFrom-Json
        $passwordSecure = $config.password_encrypted | ConvertTo-SecureString
        $password = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
            [Runtime.InteropServices.Marshal]::SecureStringToBSTR($passwordSecure)
        )
        
        return @{
            Server = $config.smtp_server
            Port = $config.smtp_port
            Username = $config.username
            Password = $password
            UseSSL = $config.use_ssl
        }
    }
    catch {
        return $null
    }
}

function Get-EmailTemplate {
    param([string]$TemplateName, [object]$Customer)
    
    $templates = @{
        "cold-email" = @{
            Subject = "Industrial Belt Solutions - {company}"
            Body = @"
Hi {name},

I hope this email finds you well.

I'm writing to introduce HOLO (红龙), a leading manufacturer of industrial belt equipment with 20+ years of experience.

Our product line includes:
- Air/Water Cooled Press (Splice Press)
- Finger Puncher
- Belt Slitting Machine
- Ply Separator
- Guide Strip Welding Machine

Website: www.beltsplicepress.com

Would you be interested in discussing potential collaboration?

Best regards,
OpenClaw Team
"@
        }
        "followup-1" = @{
            Subject = "Re: Industrial Belt Solutions - {company}"
            Body = @"
Hi {name},

I wanted to follow up on my previous email. Did you have a chance to review it?

Happy to answer any questions you might have.

Best regards,
OpenClaw Team
"@
        }
        "followup-2" = @{
            Subject = "Re: Industrial Belt Solutions - {company}"
            Body = @"
Hi {name},

Following up again. If timing isn't right, I'm happy to reconnect in a few months.

In the meantime, feel free to visit our website: www.beltsplicepress.com

Best regards,
OpenClaw Team
"@
        }
    }
    
    $template = $templates[$TemplateName]
    if (-not $template) {
        $template = $templates["cold-email"]
    }
    
    # 替换变量
    $subject = $template.Subject
    $body = $template.Body
    
    $subject = $subject -replace "\{company\}", $Customer.company
    $subject = $subject -replace "\{name\}", $Customer.name
    $body = $body -replace "\{company\}", $Customer.company
    $body = $body -replace "\{name\}", $Customer.name
    
    return @{
        Subject = $subject
        Body = $body
    }
}

function Send-EmailWithConfig {
    param(
        [object]$Config,
        [string]$To,
        [string]$Subject,
        [string]$Body
    )
    
    try {
        $smtp = New-Object System.Net.Mail.SmtpClient($Config.Server, $Config.Port)
        
        if ($Config.UseSSL) {
            $smtp.EnableSsl = $true
        }
        
        $smtp.Credentials = New-Object System.Net.NetworkCredential(
            $Config.Username, $Config.Password
        )
        
        $message = New-Object System.Net.Mail.MailMessage
        $message.From = $Config.Username
        $message.To.Add($To)
        $message.Subject = $Subject
        $message.Body = $Body
        $message.IsBodyHtml = $false
        
        $smtp.Send($message)
        
        return $true
    }
    catch {
        Write-Host "  错误: $_" -ForegroundColor Red
        return $false
    }
}

function Log-SendResult {
    param(
        [string]$To,
        [string]$Subject,
        [string]$Status,
        [string]$Error = ""
    )
    
    if (-not (Test-Path $LOGS_DIR)) {
        New-Item -ItemType Directory -Path $LOGS_DIR -Force | Out-Null
    }
    
    $logFile = "$LOGS_DIR\$(Get-Date -Format 'yyyyMMdd').json"
    
    $log = @{
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        to = $To
        subject = $Subject
        status = $Status
        error = $Error
    }
    
    $log | ConvertTo-Json -Compress | Out-File $logFile -Encoding UTF8 -Append
}

# ============================================================
# 主流程
# ============================================================

Write-Header

# 检查配置
$config = Get-EmailConfig
if (-not $config) {
    Write-Host "❌ 未找到邮箱配置" -ForegroundColor Red
    Write-Host "请先运行: .\setup-email.ps1" -ForegroundColor Yellow
    return
}

Write-Host "邮箱: $($config.Username)" -ForegroundColor Gray
Write-Host ""

# 检查客户文件
if (-not $CustomersFile) {
    Write-Host "用法: .\send-batch-emails.ps1 -CustomersFile 'customers.json'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "客户文件格式 (JSON):" -ForegroundColor Cyan
    Write-Host @"
[
  {
    "name": "John Doe",
    "email": "john@company.com",
    "company": "ABC Industrial"
  },
  ...
]
"@ -ForegroundColor Gray
    return
}

if (-not (Test-Path $CustomersFile)) {
    Write-Host "❌ 客户文件不存在: $CustomersFile" -ForegroundColor Red
    return
}

# 加载客户列表
$customers = Get-Content $CustomersFile | ConvertFrom-Json

Write-Host "加载客户: $($customers.Count) 个" -ForegroundColor Green
Write-Host "邮件模板: $Template" -ForegroundColor Gray
Write-Host "发送间隔: $DelaySeconds 秒" -ForegroundColor Gray

if ($DryRun) {
    Write-Host "`n[DRY RUN] 不会实际发送邮件" -ForegroundColor Yellow
}

Write-Host ""

# 确认发送
if (-not $DryRun) {
    $confirm = Read-Host "确认发送? (y/N)"
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Write-Host "已取消" -ForegroundColor Yellow
        return
    }
}

# 发送邮件
$successCount = 0
$failCount = 0

Write-Host "`n开始发送..." -ForegroundColor Cyan
Write-Host ""

foreach ($customer in $customers) {
    $template = Get-EmailTemplate -TemplateName $Template -Customer $customer
    
    Write-Host "[$($successCount + $failCount + 1)/$($customers.Count)] $($customer.email)" -ForegroundColor White
    
    if ($DryRun) {
        Write-Host "  [DRY RUN] 主题: $($template.Subject)" -ForegroundColor Gray
        $successCount++
    } else {
        $success = Send-EmailWithConfig -Config $config -To $customer.email `
            -Subject $template.Subject -Body $template.Body
        
        if ($success) {
            Write-Host "  ✅ 发送成功" -ForegroundColor Green
            Log-SendResult -To $customer.email -Subject $template.Subject -Status "sent"
            $successCount++
        } else {
            Write-Host "  ❌ 发送失败" -ForegroundColor Red
            Log-SendResult -To $customer.email -Subject $template.Subject -Status "failed"
            $failCount++
        }
        
        # 延迟
        if ($successCount + $failCount -lt $customers.Count) {
            Start-Sleep -Seconds $DelaySeconds
        }
    }
}

# 汇总
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                     发送完成                               ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host ""
Write-Host "统计:" -ForegroundColor Yellow
Write-Host "  总数: $($customers.Count)" -ForegroundColor White
Write-Host "  成功: $successCount" -ForegroundColor Green
Write-Host "  失败: $failCount" -ForegroundColor Red
Write-Host "  成功率: $([math]::Round($successCount / $customers.Count * 100, 1))%" -ForegroundColor White

if (-not $DryRun) {
    Write-Host "`n日志文件: $LOGS_DIR\$(Get-Date -Format 'yyyyMMdd').json" -ForegroundColor Gray
}
