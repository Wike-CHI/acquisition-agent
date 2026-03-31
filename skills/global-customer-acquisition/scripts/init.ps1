# 红龙获客系统 - 一键初始化脚本
# 版本: v1.0
# 用途: 首次使用时自动检测配置并提供向导，降低上手门槛
# 预期时间: 5分钟

param(
    [switch]$SkipChecks = $false,
    [switch]$Interactive = $true
)

# 颜色输出函数
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# 打印欢迎信息
function Show-Banner {
    Clear-Host
    Write-ColorOutput "╔════════════════════════════════════════════════════════════╗" "Cyan"
    Write-ColorOutput "║     红龙获客系统 - 一键初始化脚本 v1.0                    ║" "Cyan"
    Write-ColorOutput "║     Honglong Customer Acquisition System - Init Script      ║" "Cyan"
    Write-ColorOutput "╚════════════════════════════════════════════════════════════╝" "Cyan"
    Write-Host ""
    Write-ColorOutput "⚡ 预期初始化时间: 5分钟" "Yellow"
    Write-ColorOutput "📋 本脚本将自动检测并引导您完成以下配置:" "White"
    Write-Host "  1. 业务员信息 (user.md)"
    Write-Host "  2. 凭据配置 (SMTP / Exa API / DeepSeek API)"
    Write-Host "  3. 技能依赖检查"
    Write-Host "  4. 系统验证"
    Write-Host ""
}

# 检测技能路径
function Get-SkillPath {
    $skillPath = "$env:USERPROFILE\.workbuddy\skills\global-customer-acquisition"
    
    if (-not (Test-Path $skillPath)) {
        Write-ColorOutput "❌ 错误: 未找到红龙获客系统技能目录" "Red"
        Write-ColorOutput "   路径: $skillPath" "Red"
        Write-ColorOutput "   请先安装技能后再运行此脚本" "Yellow"
        return $null
    }
    
    return $skillPath
}

# 检查 user.md 配置
function Test-UserConfig {
    param([string]$UserPath)
    
    Write-ColorOutput "`n[1/4] 检查业务员信息配置..." "Cyan"
    
    if (-not (Test-Path $UserPath)) {
        Write-ColorOutput "   ❌ 未找到 user.md 文件" "Red"
        return @{
            Status = "Missing"
            Issues = @("文件不存在")
        }
    }
    
    $content = Get-Content $UserPath -Raw -Encoding UTF8
    $issues = @()
    
    # 检查必需字段
    $requiredFields = @{
        "姓名" = "请填写你的姓名"
        "邮箱" = "请填写你的销售邮箱"
        "电话" = "请填写你的联系电话"
        "职位" = "请填写你的职位"
    }
    
    foreach ($field in $requiredFields.Keys) {
        $pattern = $requiredFields[$field]
        if ($content -match [regex]::Escape($pattern)) {
            $issues += "$field 未填写"
        }
    }
    
    if ($issues.Count -eq 0) {
        Write-ColorOutput "   ✅ 业务员信息配置完整" "Green"
        return @{
            Status = "Complete"
            Issues = @()
        }
    } else {
        Write-ColorOutput "   ⚠️  发现以下未填写项:" "Yellow"
        foreach ($issue in $issues) {
            Write-ColorOutput "      - $issue" "Yellow"
        }
        return @{
            Status = "Incomplete"
            Issues = $issues
        }
    }
}

# 检查凭据配置
function Test-Credentials {
    param([string]$ToolsPath)
    
    Write-ColorOutput "`n[2/4] 检查凭据配置..." "Cyan"
    
    if (-not (Test-Path $ToolsPath)) {
        Write-ColorOutput "   ⚠️  未找到 TOOLS.md 文件（首次使用正常）" "Yellow"
        return @{
            Status = "Missing"
            MissingCredentials = @("SMTP", "Exa API", "DeepSeek API")
        }
    }
    
    $content = Get-Content $ToolsPath -Raw -Encoding UTF8
    $missing = @()
    
    # 检查各凭据配置状态
    $credentials = @{
        "SMTP" = @("{{SMTP_SERVER}}", "{{SMTP_PORT}}", "{{SMTP_USER}}", "{{SMTP_PASSWORD}}")
        "Exa API" = @("{{EXA_API_KEY}}")
        "DeepSeek API" = @("{{DEEPSEEK_API_KEY}}")
    }
    
    foreach ($cred in $credentials.Keys) {
        $patterns = $credentials[$cred]
        $hasPlaceholder = $false
        
        foreach ($pattern in $patterns) {
            if ($content -match [regex]::Escape($pattern)) {
                $hasPlaceholder = $true
                break
            }
        }
        
        if ($hasPlaceholder) {
            $missing += $cred
        }
    }
    
    if ($missing.Count -eq 0) {
        Write-ColorOutput "   ✅ 所有凭据已配置" "Green"
        return @{
            Status = "Complete"
            MissingCredentials = @()
        }
    } else {
        Write-ColorOutput "   ⚠️  以下凭据未配置:" "Yellow"
        foreach ($cred in $missing) {
            $priority = if ($cred -eq "SMTP") { "【必需】" } else { "【可选】" }
            Write-ColorOutput "      - $cred $priority" "Yellow"
        }
        return @{
            Status = "Incomplete"
            MissingCredentials = $missing
        }
    }
}

# 检查技能依赖
function Test-SkillDependencies {
    param([string]$SkillPath)
    
    Write-ColorOutput "`n[3/4] 检查技能依赖..." "Cyan"
    
    $skillsDir = "$SkillPath\skills"
    $dependencies = @(
        @{Name = "chroma-memory"; Required = $true}
        @{Name = "supermemory"; Required = $true}
        @{Name = "honglong-products"; Required = $true}
        @{Name = "honglong-assistant"; Required = $true}
        @{Name = "email-sender"; Required = $false}
        @{Name = "cold-email-generator"; Required = $false}
        @{Name = "company-research"; Required = $false}
        @{Name = "linkedin"; Required = $false}
    )
    
    $missing = @()
    $present = @()
    
    foreach ($dep in $dependencies) {
        $depPath = "$env:USERPROFILE\.workbuddy\skills\$($dep.Name)"
        
        if (Test-Path $depPath) {
            $present += $dep.Name
        } else {
            if ($dep.Required) {
                $missing += "$($dep.Name) 【必需】"
            } else {
                $missing += "$($dep.Name) 【可选】"
            }
        }
    }
    
    if ($present.Count -gt 0) {
        Write-ColorOutput "   ✅ 已安装技能 ($($present.Count)):" "Green"
        foreach ($skill in $present) {
            Write-ColorOutput "      - $skill" "Green"
        }
    }
    
    if ($missing.Count -gt 0) {
        Write-ColorOutput "   ⚠️  缺失技能:" "Yellow"
        foreach ($skill in $missing) {
            Write-ColorOutput "      - $skill" "Yellow"
        }
    }
    
    return @{
        Present = $present
        Missing = $missing
    }
}

# 交互式配置向导
function Start-ConfigurationWizard {
    param(
        [string]$UserPath,
        [string]$ToolsPath,
        [hashtable]$UserStatus,
        [hashtable]$CredentialStatus
    )
    
    Write-ColorOutput "`n════════════════════════════════════════════════════════════" "Cyan"
    Write-ColorOutput "📝 交互式配置向导" "Cyan"
    Write-ColorOutput "════════════════════════════════════════════════════════════`n" "Cyan"
    
    # 配置业务员信息
    if ($UserStatus.Status -eq "Incomplete") {
        Write-ColorOutput "📋 配置业务员信息" "Yellow"
        Write-ColorOutput "────────────────────────────────────────────────────────────`n" "Yellow"
        
        $userConfig = @{
            Name = Read-Host "请输入你的姓名"
            Email = Read-Host "请输入你的销售邮箱"
            Phone = Read-Host "请输入你的联系电话"
            Position = Read-Host "请输入你的职位"
        }
        
        # 验证邮箱格式
        if ($userConfig.Email -notmatch "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$") {
            Write-ColorOutput "   ⚠️  邮箱格式可能不正确，但已保存" "Yellow"
        }
        
        # 更新 user.md
        Update-UserConfig -Path $UserPath -Config $userConfig
        Write-ColorOutput "   ✅ 业务员信息已更新`n" "Green"
    }
    
    # 配置凭据
    if ($CredentialStatus.Status -eq "Incomplete" -and $Interactive) {
        Write-ColorOutput "🔐 配置凭据信息" "Yellow"
        Write-ColorOutput "────────────────────────────────────────────────────────────`n" "Yellow"
        Write-ColorOutput "💡 提示: 也可以在配置凭据技能中单独设置，这里提供快速指南`n" "Green"
        
        foreach ($cred in $CredentialStatus.MissingCredentials) {
            $isRequired = $cred -eq "SMTP"
            
            if ($isRequired -or (Confirm-Question "是否配置 $cred 凭据？")) {
                Write-ColorOutput "`n配置 $cred :" "Cyan"
                
                switch ($cred) {
                    "SMTP" {
                        Write-Host "   SMTP 服务器 (如 smtp.gmail.com):"
                        $smtpServer = Read-Host "   > "
                        Write-Host "   SMTP 端口 (如 587):"
                        $smtpPort = Read-Host "   > "
                        Write-Host "   SMTP 用户名:"
                        $smtpUser = Read-Host "   > "
                        Write-Host "   SMTP 密码 (或应用专用密码):"
                        $smtpPassword = Read-Host "   > " -AsSecureString
                        
                        Write-ColorOutput "`n   💡 要配置邮箱，请运行: '配置邮箱' 命令`n" "Green"
                    }
                    "Exa API" {
                        Write-Host "   Exa API Key:"
                        $exaKey = Read-Host "   > "
                        Write-ColorOutput "`n   💡 要配置 Exa，请运行: '配置 Exa' 命令`n" "Green"
                    }
                    "DeepSeek API" {
                        Write-Host "   DeepSeek API Key:"
                        $deepseekKey = Read-Host "   > "
                        Write-ColorOutput "`n   💡 要配置 DeepSeek，请运行: '配置 DeepSeek' 命令`n" "Green"
                    }
                }
            }
        }
    }
}

# 更新 user.md
function Update-UserConfig {
    param(
        [string]$Path,
        [hashtable]$Config
    )
    
    $content = Get-Content $Path -Raw -Encoding UTF8
    
    # 替换占位符
    $content = $content -replace "请填写你的姓名", $Config.Name
    $content = $content -replace "请填写你的销售邮箱", $Config.Email
    $content = $content -replace "请填写你的联系电话", $Config.Phone
    $content = $content -replace "请填写你的职位", $Config.Position
    
    Set-Content -Path $Path -Value $content -Encoding UTF8 -NoNewline
}

# 确认问题
function Confirm-Question {
    param([string]$Question)
    
    $response = Read-Host "$Question (Y/N)"
    return $response -eq "Y" -or $response -eq "y"
}

# 生成配置报告
function Generate-Report {
    param(
        [hashtable]$UserStatus,
        [hashtable]$CredentialStatus,
        [hashtable]$DependencyStatus
    )
    
    Write-ColorOutput "`n════════════════════════════════════════════════════════════" "Cyan"
    Write-ColorOutput "📊 初始化报告" "Cyan"
    Write-ColorOutput "════════════════════════════════════════════════════════════`n" "Cyan"
    
    # 业务员信息
    $userStatusIcon = if ($UserStatus.Status -eq "Complete") { "✅" } else { "⚠️" }
    $userColor = if ($UserStatus.Status -eq "Complete") { "Green" } else { "Yellow" }
    Write-ColorOutput "$userStatusIcon 业务员信息: $($UserStatus.Status)" $userColor

    # 凭据配置
    $credStatusIcon = if ($CredentialStatus.Status -eq "Complete") { "✅" } else { "⚠️" }
    $credColor = if ($CredentialStatus.Status -eq "Complete") { "Green" } else { "Yellow" }
    Write-ColorOutput "$credStatusIcon 凭据配置: $($CredentialStatus.Status)" $credColor

    # 技能依赖
    $depStatusText = if ($DependencyStatus.Missing -notmatch "必需") { "✅ 基本完整" } else { "⚠️  缺失必需技能" }
    $depColor = if ($DependencyStatus.Missing -notmatch "必需") { "Green" } else { "Yellow" }
    Write-ColorOutput "✅ 已安装技能: $($DependencyStatus.Present.Count)" "Green"
    Write-ColorOutput "$depStatusText 缺失技能: $($DependencyStatus.Missing.Count)" $depColor

    Write-Host ""

    # 健康度评分
    $score = 100
    if ($UserStatus.Status -ne "Complete") { $score -= 20 }
    if ($CredentialStatus.Status -ne "Complete") { $score -= 15 }
    if ($DependencyStatus.Missing -match "必需") { $score -= 25 }
    if ($score -lt 0) { $score = 0 }

    $scoreColor = if ($score -ge 80) { "Green" } elseif ($score -ge 60) { "Yellow" } else { "Red" }
    Write-ColorOutput "════════════════════════════════════════════════════════════" $scoreColor
    Write-ColorOutput "📈 系统健康度: $score% / 100%" $scoreColor
    Write-ColorOutput "════════════════════════════════════════════════════════════`n" $scoreColor
}

# 显示下一步建议
function Show-NextSteps {
    param([int]$HealthScore)
    
    Write-ColorOutput "🚀 下一步建议" "Cyan"
    Write-ColorOutput "────────────────────────────────────────────────────────────" "White"
    
    if ($HealthScore -ge 80) {
        Write-ColorOutput "✨ 系统配置良好，可以开始使用！" "Green"
        Write-Host "   试试这些指令:"
        Write-Host "   - '帮我找美国传送带客户'"
        Write-Host "   - '给这家公司发开发信'"
        Write-Host "   - '查看Pipeline'"
    }
    elseif ($HealthScore -ge 60) {
        Write-ColorOutput "⚠️  基本配置完成，建议补充以下内容:" "Yellow"
        Write-Host "   - 配置邮箱凭据: 运行 '配置邮箱'"
        Write-Host "   - 配置 Exa API: 运行 '配置 Exa'"
    }
    else {
        Write-ColorOutput "❌ 系统配置不完整，请先完成:" "Red"
        Write-Host "   1. 填写业务员信息 (context/user.md)"
        Write-Host "   2. 配置邮箱凭据"
        Write-Host "   3. 安装必需技能"
    }
    
    Write-Host ""
    Write-ColorOutput "📚 更多帮助" "Cyan"
    Write-Host "   - 完整文档: skills/global-customer-acquisition/references/"
    Write-Host "   - 故障排查: skills/global-customer-acquisition/TROUBLESHOOT.md"
    Write-Host ""
}

# 主流程
function Main {
    Show-Banner
    
    # 检测技能路径
    $skillPath = Get-SkillPath
    if (-not $skillPath) {
        exit 1
    }
    
    Write-ColorOutput "✅ 找到技能目录: $skillPath" "Green"
    
    # 定义路径
    $userPath = "$skillPath\context\user.md"
    $toolsPath = "$skillPath\TOOLS.md"
    
    # 检查配置
    $userStatus = Test-UserConfig -UserPath $userPath
    $credentialStatus = Test-Credentials -ToolsPath $toolsPath
    $dependencyStatus = Test-SkillDependencies -SkillPath $skillPath
    
    # 交互式配置
    if ($Interactive -and ($userStatus.Status -eq "Incomplete" -or $credentialStatus.Status -eq "Incomplete")) {
        if (Confirm-Question "`n是否开始交互式配置向导？") {
            Start-ConfigurationWizard -UserPath $userPath -ToolsPath $toolsPath `
                                       -UserStatus $userStatus -CredentialStatus $credentialStatus
            
            # 重新检查
            $userStatus = Test-UserConfig -UserPath $userPath
            $credentialStatus = Test-Credentials -ToolsPath $toolsPath
        }
    }
    
    # 生成报告
    Generate-Report -UserStatus $userStatus -CredentialStatus $credentialStatus `
                    -DependencyStatus $dependencyStatus
    
    # 计算健康度
    $healthScore = 100
    if ($userStatus.Status -ne "Complete") { $healthScore -= 20 }
    if ($credentialStatus.Status -ne "Complete") { $healthScore -= 15 }
    if ($dependencyStatus.Missing -match "必需") { $healthScore -= 25 }
    if ($healthScore -lt 0) { $healthScore = 0 }
    
    # 显示下一步建议
    Show-NextSteps -HealthScore $healthScore
    
    # 退出码
    if ($healthScore -ge 60) {
        exit 0
    } else {
        exit 1
    }
}

# 执行主流程
Main
