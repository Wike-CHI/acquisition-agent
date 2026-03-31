# get-credential.ps1
# 读取平台凭据
# 用法: .\get-credential.ps1 -Platform teyi
# 返回: JSON格式 {user, pass, createdAt}

param(
    [Parameter(Mandatory=$true)]
    [string]$Platform
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
    exit 1
}

$credFile = $CREDENTIAL_FILES[$Platform]

# 检查文件是否存在
if (-not (Test-Path $credFile)) {
    $result = @{
        success = $false
        error = "NOT_FOUND"
        message = "$Platform 凭据未配置"
        hint = "请先运行配置命令或对话：配置${Platform}账号"
    }
    Write-Output ($result | ConvertTo-Json -Compress)
    exit 0
}

try {
    $encrypted = Get-Content $credFile -Raw | ConvertFrom-Json
    
    # 解密用户名
    $userSecure = $encrypted.User | ConvertTo-SecureString
    $user = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($userSecure)
    )
    
    # 解密密码
    $passSecure = $encrypted.Pass | ConvertTo-SecureString
    $pass = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($passSecure)
    )
    
    $result = @{
        success = $true
        platform = $Platform
        user = $user
        pass = $pass
        createdAt = $encrypted.CreatedAt
    }
    
    Write-Output ($result | ConvertTo-Json -Compress)
    
} catch {
    $result = @{
        success = $false
        error = "DECRYPT_FAILED"
        message = "凭据解密失败，可能文件损坏或用户变更"
        hint = "请重新配置凭据"
    }
    Write-Output ($result | ConvertTo-Json -Compress)
}
