# NAS 安全挂载脚本
# 用法: .\mount-nas.ps1 [-Force] [-Setup]
# 
# 首次使用请运行: .\mount-nas.ps1 -Setup

param(
    [switch]$Force = $false,
    [switch]$Setup = $false,
    [switch]$Forget = $false,
    [switch]$Verbose = $false
)

# ============================================================
# 配置区域（只需修改NAS地址，不要存放密码！）
# ============================================================

$NAS_SERVERS = @(
    @{
        Name = "主NAS"
        Host = "192.168.0.194"
        Share = "市场营销"
        Drive = "Y"
        Description = "HOLO公司NAS - 产品资料/图片/视频"
    },
    @{
        Name = "备用NAS"
        Host = "192.168.1.8"
        Share = "HONGLONG"
        Drive = "Y"
        Description = "备用NAS（如主NAS不可用）"
    }
)

$CREDENTIAL_FILE = "$env:USERPROFILE\.openclaw\.nas_credentials"

# ============================================================
# 函数定义
# ============================================================

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "HH:mm:ss"
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "WARN" { "Yellow" }
        "SUCCESS" { "Green" }
        "HEADER" { "Cyan" }
        default { "White" }
    }
    if ($Verbose -or $Level -ne "INFO") {
        Write-Host "[$timestamp] $Message" -ForegroundColor $color
    }
}

function Show-Header {
    Clear-Host
    Write-Host @"
╔════════════════════════════════════════════════════════════╗
║            HOLO NAS 安全挂载工具 v2.0                      ║
║                                                            ║
║  🔒 凭据安全存储于本地，不会上传到云端                       ║
╚════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan
    Write-Host ""
}

function Get-StoredCredential {
    if (-not (Test-Path $CREDENTIAL_FILE)) {
        return $null
    }
    
    try {
        $encrypted = Get-Content $CREDENTIAL_FILE -Raw | ConvertFrom-Json
        $user = $encrypted.User | ConvertTo-SecureString
        $pass = $encrypted.Pass | ConvertTo-SecureString
        
        $cred = New-Object System.Management.Automation.PSCredential(
            ($user | ForEach-Object { [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($_)) }),
            $pass
        )
        
        return $cred
    }
    catch {
        Write-Log "凭据文件损坏，需要重新设置" "WARN"
        return $null
    }
}

function Save-Credential {
    param([string]$User, [string]$Pass)
    
    $dir = Split-Path $CREDENTIAL_FILE -Parent
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    
    # 使用当前用户加密
    $userSecure = ConvertTo-SecureString $User -AsPlainText -Force | ConvertFrom-SecureString
    $passSecure = ConvertTo-SecureString $Pass -AsPlainText -Force | ConvertFrom-SecureString
    
    $encrypted = @{
        User = $userSecure
        Pass = $passSecure
        Created = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
    
    $encrypted | ConvertTo-Json | Out-File $CREDENTIAL_FILE -Encoding UTF8
    
    # 设置文件权限（仅当前用户可访问）
    $acl = Get-Acl $CREDENTIAL_FILE
    $acl.SetAccessRuleProtection($true, $false)
    $rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
        $env:USERNAME, "FullControl", "Allow"
    )
    $acl.SetAccessRule($rule)
    Set-Acl $CREDENTIAL_FILE $acl
    
    Write-Log "凭据已安全保存到: $CREDENTIAL_FILE" "SUCCESS"
}

function Remove-StoredCredential {
    if (Test-Path $CREDENTIAL_FILE) {
        Remove-Item $CREDENTIAL_FILE -Force
        Write-Log "已删除保存的凭据" "SUCCESS"
    }
}

function Request-Credential {
    Show-Header
    
    Write-Host "首次使用需要设置NAS登录凭据" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "提示: NAS用户名和密码请向IT部门获取" -ForegroundColor Gray
    Write-Host ""
    
    # 输入用户名
    Write-Host "请输入NAS用户名: " -NoNewline -ForegroundColor Cyan
    $user = Read-Host
    
    # 输入密码（隐藏显示）
    Write-Host "请输入NAS密码: " -NoNewline -ForegroundColor Cyan
    $pass = Read-Host -AsSecureString
    $passPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($pass)
    )
    
    # 确认保存
    Write-Host ""
    Write-Host "是否保存凭据供下次使用？ (Y/n): " -NoNewline -ForegroundColor Yellow
    $save = Read-Host
    if ($save -ne "n" -and $save -ne "N") {
        Save-Credential -User $user -Pass $passPlain
    }
    
    return New-Object System.Management.Automation.PSCredential($user, $pass)
}

function Test-NASConnection {
    param([string]$NasHost)
    
    Write-Log "测试连接 $NasHost ..." "INFO"
    
    # Ping测试
    $ping = Test-Connection -ComputerName $NasHost -Count 2 -Quiet -ErrorAction SilentlyContinue
    if (-not $ping) {
        Write-Log "  Ping失败" "WARN"
        return $false
    }
    
    # SMB端口测试
    $tcp = New-Object System.Net.Sockets.TcpClient
    try {
        $connect = $tcp.BeginConnect($NasHost, 445, $null, $null)
        $wait = $connect.AsyncWaitHandle.WaitOne(3000, $false)
        if (-not $wait) {
            Write-Log "  SMB端口(445)超时" "WARN"
            return $false
        }
        $tcp.EndConnect($connect)
        $tcp.Close()
        Write-Log "  连接成功" "SUCCESS"
        return $true
    }
    catch {
        Write-Log "  连接失败: $_" "WARN"
        return $false
    }
}

function Dismount-NAS {
    param([string]$Drive)
    
    $driveLetter = $Drive + ":"
    
    $existing = net use 2>&1 | Select-String "$driveLetter\s"
    if ($existing) {
        Write-Log "卸载 $driveLetter ..." "INFO"
        net use $driveLetter /delete /y 2>&1 | Out-Null
        Start-Sleep -Seconds 1
    }
}

function Mount-NAS {
    param(
        [string]$Host,
        [string]$Share,
        [string]$Drive,
        [System.Management.Automation.PSCredential]$Credential
    )
    
    $driveLetter = $Drive + ":"
    $uncPath = "\\$Host\$Share"
    
    Write-Log "挂载 $uncPath -> $driveLetter" "INFO"
    
    # 构建命令
    $user = $Credential.UserName
    $pass = $Credential.GetNetworkCredential().Password
    
    $result = net use $driveLetter $uncPath /user:$user $pass /persistent:yes 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Log "挂载成功!" "SUCCESS"
        
        # 验证
        Start-Sleep -Seconds 1
        if (Test-Path $driveLetter) {
            $folders = (Get-ChildItem $driveLetter -ErrorAction SilentlyContinue | Measure-Object).Count
            Write-Log "验证成功: 发现 $folders 个文件夹" "SUCCESS"
            return $true
        }
        else {
            Write-Log "验证失败: 无法访问 $driveLetter" "ERROR"
            return $false
        }
    }
    else {
        Write-Log "挂载失败: $result" "ERROR"
        return $false
    }
}

function Show-Status {
    Write-Log "当前NAS挂载状态:" "HEADER"
    net use 2>&1 | Where-Object { $_ -match "^[A-Z]:" } | ForEach-Object {
        Write-Log "  $_" "INFO"
    }
}

# ============================================================
# 主流程
# ============================================================

Show-Header

# 处理 -Forget 参数
if ($Forget) {
    Remove-StoredCredential
    exit 0
}

# 处理 -Setup 参数
if ($Setup) {
    $credential = Request-Credential
    if ($credential) {
        Write-Log "凭据设置完成！" "SUCCESS"
    }
    exit 0
}

# 获取凭据
$credential = Get-StoredCredential

if (-not $credential) {
    Write-Log "未找到保存的凭据" "WARN"
    $credential = Request-Credential
}

# 如果指定强制，先卸载
if ($Force) {
    Dismount-NAS -Drive "Y"
}

# 显示状态
Show-Status

# 尝试挂载
$mounted = $false

foreach ($nas in $NAS_SERVERS) {
    Write-Log "`n尝试 $($nas.Name) ($($nas.Host))..." "HEADER"
    
    if (Test-NASConnection -NasHost $nas.Host) {
        $success = Mount-NAS -NasHost $nas.Host -Share $nas.Share `
            -Drive $nas.Drive -Credential $credential
        
        if ($success) {
            $mounted = $true
            Write-Log "`n✅ 挂载完成！" "SUCCESS"
            break
        }
    }
}

if (-not $mounted) {
    Write-Log "`n❌ 所有NAS挂载失败" "ERROR"
    Write-Log "`n可能原因:" "WARN"
    Write-Log "  1. NAS服务器未开机" "WARN"
    Write-Log "  2. 网络连接问题" "WARN"
    Write-Log "  3. 用户名或密码错误（运行 -Setup 重新设置）" "WARN"
    Write-Log "  4. 共享文件夹不存在" "WARN"
    Write-Log "`n提示: 运行 .\mount-nas.ps1 -Setup 重新设置凭据" "INFO"
    exit 1
}

exit 0
