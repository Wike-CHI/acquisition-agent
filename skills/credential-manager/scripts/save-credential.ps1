# save-credential.ps1
# 保存平台凭据（对话式/安全输入）
# 用法: .\save-credential.ps1 -Platform teyi -User "your_username"
# 密码将通过安全输入提示

param(
    [Parameter(Mandatory=$true)]
    [string]$Platform,

    [Parameter(Mandatory=$true)]
    [string]$User,

    [Parameter(Mandatory=$false)]
    [string]$Pass  # 仅保留兼容性，已改用 Read-Host -AsSecureString
)

$ErrorActionPreference = "Stop"

# 凭据文件映射
$CREDENTIAL_FILES = @{
    "nas" = "$env:USERPROFILE\.openclaw\.nas_credentials"
    "teyi" = "$env:USERPROFILE\.openclaw\.teyi_credentials"
    "email" = "$env:USERPROFILE\.openclaw\.email_config.json"
}

$Platform = $Platform.ToLower()
if (-not $CREDENTIAL_FILES.ContainsKey($Platform)) {
    Write-Host "❌ 不支持的平台: $Platform" -ForegroundColor Red
    Write-Host "支持的平台: nas, teyi, email" -ForegroundColor Yellow
    exit 1
}

$credFile = $CREDENTIAL_FILES[$Platform]

# 确保目录存在
$dir = Split-Path $credFile -Parent
if (-not (Test-Path $dir)) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
}

# 安全读取密码（不暴露在命令行/PS历史中）
if ([string]::IsNullOrEmpty($Pass)) {
    $securePass = Read-Host "请输入密码" -AsSecureString
} else {
    $securePass = $Pass | ConvertTo-SecureString -AsPlainText -Force
}

# 使用DPAPI加密
$encrypted = @{
    User = $User | ConvertTo-SecureString -AsPlainText -Force | ConvertFrom-SecureString
    Pass = $securePass | ConvertFrom-SecureString
    CreatedAt = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Platform = $Platform
}

# 保存
$encrypted | ConvertTo-Json | Set-Content $credFile -Encoding UTF8

Write-Host "✅ $Platform 凭据已安全保存" -ForegroundColor Green
Write-Host "📌 存储位置: $credFile" -ForegroundColor Gray
Write-Host "🔒 加密方式: Windows DPAPI" -ForegroundColor Gray

# 返回JSON供AI使用
return @{
    success = $true
    platform = $Platform
    file = $credFile
    createdAt = $encrypted.CreatedAt
} | ConvertTo-Json -Compress
