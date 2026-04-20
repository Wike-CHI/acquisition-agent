# NAS Common Module - 共享凭据读取、挂载、slug生成
# 被 write-knowledge.ps1 / read-knowledge.ps1 / log-activity.ps1 dot-source

$CREDENTIAL_FILE = "$env:USERPROFILE\.openclaw\.nas_credentials"
$NAS_IP = "192.168.0.194"

function Get-NasCredential {
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
        return $null
    }
}

function Ensure-NasMount {
    param(
        [Parameter(Mandatory=$true)]
        [string]$DriveLetter,
        [Parameter(Mandatory=$true)]
        [string]$SharePath
    )

    $drive = "$DriveLetter\"
    if (Test-Path $drive) {
        return $true
    }

    $cred = Get-NasCredential
    if (-not $cred) {
        return $false
    }

    $user = $cred.UserName
    $pass = $cred.GetNetworkCredential().Password
    net use $drive $SharePath /user:$user $pass /persistent:yes 2>&1 | Out-Null

    Start-Sleep -Milliseconds 500
    return (Test-Path $drive)
}

function New-Slug {
    param([string]$text)
    if ($text -match '^[\w]+$') {
        return $text.ToLower()
    }
    $result = ""
    $chars = $text.ToCharArray()
    foreach ($c in $chars) {
        if ([int]$c -gt 127) {
            $result += "-"
        } else {
            $result += $c
        }
    }
    $result = $result -replace '-+', '-' -replace '^-|-$', ''
    if ([string]::IsNullOrEmpty($result)) {
        return (Get-Date -Format "yyyyMMddHHmmss")
    }
    return $result.ToLower()
}

function Get-DeviceId {
    $localIP = $env:COMPUTERNAME
    try {
        $netIP = Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Ethernet*" -ErrorAction Stop | Select-Object -First 1
        if ($netIP.IPAddress) { $localIP = $netIP.IPAddress }
    } catch {}
    return "$env:USERNAME@$localIP"
}
