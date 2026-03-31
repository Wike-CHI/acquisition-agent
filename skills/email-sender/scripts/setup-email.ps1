# 邮件自动发送 - 引导式配置脚本
# 用法: .\setup-email.ps1

param(
    [switch]$Reconfigure = $false
)

# ============================================================
# 配置
# ============================================================

$CONFIG_DIR = "$env:USERPROFILE\.openclaw"
$CONFIG_FILE = "$CONFIG_DIR\.email_config.json"
$LOGS_DIR = "$CONFIG_DIR\email_logs"

# SMTP服务器配置
$SMTP_PROVIDERS = @{
    "QQ" = @{
        Server = "smtp.qq.com"
        Port = 465
        UseSSL = $true
        AuthNote = "需要使用授权码（不是QQ密码）"
        AuthUrl = "https://service.mail.qq.com/detail/0/75"
    }
    "163" = @{
        Server = "smtp.163.com"
        Port = 465
        UseSSL = $true
        AuthNote = "需要使用授权码"
        AuthUrl = "https://mail.163.com/"
    }
    "Gmail" = @{
        Server = "smtp.gmail.com"
        Port = 587
        UseSSL = $false
        AuthNote = "需要使用应用专用密码"
        AuthUrl = "https://myaccount.google.com/apppasswords"
    }
    "Outlook" = @{
        Server = "smtp-mail.outlook.com"
        Port = 587
        UseSSL = $false
        AuthNote = "需要使用应用密码"
        AuthUrl = "https://account.microsoft.com/security"
    }
    "阿里企业邮箱" = @{
        Server = "smtp.qiye.aliyun.com"
        Port = 465
        UseSSL = $true
        AuthNote = "使用邮箱密码"
        AuthUrl = ""
    }
    "腾讯企业邮箱" = @{
        Server = "smtp.exmail.qq.com"
        Port = 465
        UseSSL = $true
        AuthNote = "使用邮箱密码"
        AuthUrl = ""
    }
    "自定义" = @{
        Server = ""
        Port = 465
        UseSSL = $true
        AuthNote = "使用邮箱密码"
        AuthUrl = ""
    }
}

# ============================================================
# 函数
# ============================================================

function Write-Header {
    Clear-Host
    Write-Host @"
╔════════════════════════════════════════════════════════════╗
║            邮件自动发送 - 引导式配置向导                    ║
║                                                            ║
║  🔒 配置信息将加密存储于本地                               ║
╚════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan
    Write-Host ""
}

function Test-SMTPConnection {
    param(
        [string]$Server,
        [int]$Port,
        [string]$Username,
        [string]$Password,
        [bool]$UseSSL
    )
    
    try {
        Write-Host "  测试SMTP连接..." -ForegroundColor Yellow
        
        # 创建邮件对象
        $smtp = New-Object System.Net.Mail.SmtpClient($Server, $Port)
        
        if ($UseSSL) {
            $smtp.EnableSsl = $true
        }
        
        $smtp.Credentials = New-Object System.Net.NetworkCredential($Username, $Password)
        
        # 测试发送
        $from = $Username
        $to = $Username  # 发送给自己测试
        $subject = "[OpenClaw] 邮箱配置测试"
        $body = "这是一封测试邮件，用于验证邮箱配置是否成功。`n`n发送时间: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        
        $message = New-Object System.Net.Mail.MailMessage($from, $to, $subject, $body)
        
        $smtp.Send($message)
        
        Write-Host "  ✅ 连接成功" -ForegroundColor Green
        Write-Host "  ✅ 认证成功" -ForegroundColor Green
        Write-Host "  ✅ 测试邮件已发送到 $Username" -ForegroundColor Green
        
        return $true
    }
    catch {
        Write-Host "  ❌ 连接失败: $_" -ForegroundColor Red
        return $false
    }
}

function Save-EmailConfig {
    param(
        [string]$Provider,
        [string]$Server,
        [int]$Port,
        [string]$Username,
        [string]$Password,
        [bool]$UseSSL
    )
    
    # 创建配置目录
    if (-not (Test-Path $CONFIG_DIR)) {
        New-Item -ItemType Directory -Path $CONFIG_DIR -Force | Out-Null
    }
    
    # 加密密码
    $passwordSecure = ConvertTo-SecureString $Password -AsPlainText -Force
    $passwordEncrypted = ConvertFrom-SecureString $passwordSecure
    
    # 保存配置
    $config = @{
        provider = $Provider
        smtp_server = $Server
        smtp_port = $Port
        username = $Username
        password_encrypted = $passwordEncrypted
        use_ssl = $UseSSL
        created_at = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        last_used = $null
    }
    
    $config | ConvertTo-Json | Out-File $CONFIG_FILE -Encoding UTF8
    
    # 设置文件权限
    $acl = Get-Acl $CONFIG_FILE
    $acl.SetAccessRuleProtection($true, $false)
    $rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
        $env:USERNAME, "FullControl", "Allow"
    )
    $acl.SetAccessRule($rule)
    Set-Acl $CONFIG_FILE $acl
    
    Write-Host "`n✅ 配置已保存到: $CONFIG_FILE" -ForegroundColor Green
}

function Get-EmailConfig {
    if (-not (Test-Path $CONFIG_FILE)) {
        return $null
    }
    
    try {
        $config = Get-Content $CONFIG_FILE | ConvertFrom-Json
        
        # 解密密码
        $passwordSecure = $config.password_encrypted | ConvertTo-SecureString
        $password = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
            [Runtime.InteropServices.Marshal]::SecureStringToBSTR($passwordSecure)
        )
        
        return @{
            Provider = $config.provider
            Server = $config.smtp_server
            Port = $config.smtp_port
            Username = $config.username
            Password = $password
            UseSSL = $config.use_ssl
        }
    }
    catch {
        Write-Host "配置文件损坏，需要重新配置" -ForegroundColor Red
        return $null
    }
}

function Send-Email {
    param(
        [string]$To,
        [string]$Subject,
        [string]$Body,
        [string]$FromName = ""
    )
    
    # 加载配置
    $config = Get-EmailConfig
    if (-not $config) {
        Write-Host "❌ 未找到邮箱配置，请先运行配置向导" -ForegroundColor Red
        return $false
    }
    
    try {
        $smtp = New-Object System.Net.Mail.SmtpClient($config.Server, $config.Port)
        
        if ($config.UseSSL) {
            $smtp.EnableSsl = $true
        }
        
        $smtp.Credentials = New-Object System.Net.NetworkCredential(
            $config.Username, $config.Password
        )
        
        # 创建邮件
        $message = New-Object System.Net.Mail.MailMessage
        $message.From = $config.Username
        $message.To.Add($To)
        $message.Subject = $Subject
        $message.Body = $Body
        $message.IsBodyHtml = $false
        
        # 发送
        $smtp.Send($message)
        
        # 记录日志
        $logFile = "$LOGS_DIR\$(Get-Date -Format 'yyyyMMdd').json"
        if (-not (Test-Path $LOGS_DIR)) {
            New-Item -ItemType Directory -Path $LOGS_DIR -Force | Out-Null
        }
        
        $log = @{
            timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            to = $To
            subject = $Subject
            status = "sent"
        }
        
        $log | ConvertTo-Json -Compress | Out-File $logFile -Encoding UTF8 -Append
        
        Write-Host "✅ 邮件发送成功: $To" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ 发送失败: $_" -ForegroundColor Red
        return $false
    }
}

# ============================================================
# 主流程
# ============================================================

Write-Header

# 检查是否已有配置
if ((Test-Path $CONFIG_FILE) -and -not $Reconfigure) {
    Write-Host "发现已有邮箱配置" -ForegroundColor Yellow
    Write-Host "重新配置请运行: .\setup-email.ps1 -Reconfigure" -ForegroundColor Gray
    Write-Host ""
    
    $config = Get-EmailConfig
    if ($config) {
        Write-Host "当前配置:" -ForegroundColor Cyan
        Write-Host "  邮箱: $($config.Username)" -ForegroundColor White
        Write-Host "  服务商: $($config.Provider)" -ForegroundColor White
        Write-Host "  SMTP: $($config.Server):$($config.Port)" -ForegroundColor White
    }
    
    Write-Host "`n使用方式:" -ForegroundColor Yellow
    Write-Host "  发送邮件: Send-Email -To 'user@example.com' -Subject '主题' -Body '内容'" -ForegroundColor White
    return
}

# Step 1: 选择邮箱服务商
Write-Host "Step 1: 选择邮箱服务商" -ForegroundColor Cyan
Write-Host ""

$providers = @($SMTP_PROVIDERS.Keys | Sort-Object)
for ($i = 0; $i -lt $providers.Count; $i++) {
    $provider = $providers[$i]
    $info = $SMTP_PROVIDERS[$provider]
    Write-Host "  [$($i+1)] $provider" -ForegroundColor White
}

Write-Host ""
$choice = Read-Host "请选择 (1-$($providers.Count))"

if ($choice -lt 1 -or $choice -gt $providers.Count) {
    Write-Host "无效选择" -ForegroundColor Red
    return
}

$selectedProvider = $providers[$choice - 1]
$providerInfo = $SMTP_PROVIDERS[$selectedProvider]

Write-Host "`n已选择: $selectedProvider" -ForegroundColor Green

# 显示认证说明
if ($providerInfo.AuthUrl) {
    Write-Host "`n📝 注意: $($providerInfo.AuthNote)" -ForegroundColor Yellow
    Write-Host "获取授权码: $($providerInfo.AuthUrl)" -ForegroundColor Cyan
    Write-Host ""
}

# Step 2: 输入邮箱信息
Write-Host "Step 2: 输入邮箱信息" -ForegroundColor Cyan
Write-Host ""

$email = Read-Host "请输入邮箱地址"
$password = Read-Host "请输入密码（或授权码）" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
)

# 如果是自定义，需要输入SMTP服务器
if ($selectedProvider -eq "自定义") {
    $smtpServer = Read-Host "请输入SMTP服务器地址"
    $smtpPort = Read-Host "请输入SMTP端口 (默认465)"
    if (-not $smtpPort) { $smtpPort = 465 }
    $useSSL = Read-Host "使用SSL? (Y/n)"
    $useSSLBool = ($useSSL -ne "n" -and $useSSL -ne "N")
} else {
    $smtpServer = $providerInfo.Server
    $smtpPort = $providerInfo.Port
    $useSSLBool = $providerInfo.UseSSL
}

# Step 3: 测试连接
Write-Host "`nStep 3: 测试SMTP连接" -ForegroundColor Cyan
Write-Host ""

$success = Test-SMTPConnection -Server $smtpServer -Port $smtpPort `
    -Username $email -Password $passwordPlain -UseSSL $useSSLBool

if (-not $success) {
    Write-Host "`n❌ 配置失败，请检查邮箱地址和密码" -ForegroundColor Red
    Write-Host "提示: $($providerInfo.AuthNote)" -ForegroundColor Yellow
    return
}

# Step 4: 保存配置
Write-Host "`nStep 4: 保存配置" -ForegroundColor Cyan
Write-Host ""

Save-EmailConfig -Provider $selectedProvider -Server $smtpServer -Port $smtpPort `
    -Username $email -Password $passwordPlain -UseSSL $useSSLBool

# 完成
Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                  ✅ 邮箱配置完成！                         ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`n使用方式:" -ForegroundColor Yellow
Write-Host "  发送单封邮件:" -ForegroundColor White
Write-Host "    Send-Email -To 'user@example.com' -Subject '主题' -Body '内容'" -ForegroundColor Gray
Write-Host ""
Write-Host "  查看配置:" -ForegroundColor White
Write-Host "    .\setup-email.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "  重新配置:" -ForegroundColor White
Write-Host "    .\setup-email.ps1 -Reconfigure" -ForegroundColor Gray
