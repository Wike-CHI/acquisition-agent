# list-credentials.ps1
# 列出所有已配置的平台
# 用法: .\list-credentials.ps1

$ErrorActionPreference = "Stop"

# 凭据文件映射
$CREDENTIAL_FILES = @{
    "nas" = "$env:USERPROFILE\.openclaw\.nas_credentials"
    "teyi" = "$env:USERPROFILE\.openclaw\.teyi_credentials"
    "email" = "$env:USERPROFILE\.openclaw\.email_config.json"
}

$PLATFORM_NAMES = @{
    "nas" = "NAS共享盘"
    "teyi" = "特易海关"
    "email" = "邮箱"
}

$result = @()

foreach ($platform in $CREDENTIAL_FILES.Keys) {
    $credFile = $CREDENTIAL_FILES[$platform]
    
    if (Test-Path $credFile) {
        try {
            $encrypted = Get-Content $credFile -Raw | ConvertFrom-Json
            
            # 解密用户名（用于显示）
            $userSecure = $encrypted.User | ConvertTo-SecureString
            $user = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
                [Runtime.InteropServices.Marshal]::SecureStringToBSTR($userSecure)
            )
            
            $result += @{
                platform = $platform
                name = $PLATFORM_NAMES[$platform]
                configured = $true
                user = $user
                createdAt = $encrypted.CreatedAt
            }
        } catch {
            $result += @{
                platform = $platform
                name = $PLATFORM_NAMES[$platform]
                configured = $false
                error = "凭据文件损坏"
            }
        }
    } else {
        $result += @{
            platform = $platform
            name = $PLATFORM_NAMES[$platform]
            configured = $false
        }
    }
}

# 输出JSON
Write-Output ($result | ConvertTo-Json -Compress)

# 友好显示
Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        已配置的平台凭据                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

foreach ($item in $result) {
    if ($item.configured) {
        Write-Host "✅ $($item.name)" -ForegroundColor Green
        Write-Host "   用户名: $($item.user)" -ForegroundColor Gray
        Write-Host "   配置时间: $($item.createdAt)" -ForegroundColor Gray
    } else {
        Write-Host "❌ $($item.name)" -ForegroundColor Red
        if ($item.error) {
            Write-Host "   错误: $($item.error)" -ForegroundColor Yellow
        } else {
            Write-Host "   状态: 未配置" -ForegroundColor Gray
        }
    }
    Write-Host ""
}
