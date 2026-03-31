# check-updates.ps1
# 检查技能更新并输出变更报告

param(
    [string]$SkillsPath = "",
    [string]$StatePath = "",
    [string]$WorkspacePath = ""
)

# 智能路径解析：从脚本位置向上推断 workspace
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$skillRoot = Split-Path -Parent (Split-Path -Parent $scriptDir)  # skills/release-manager/scripts -> skill root

if ($WorkspacePath -eq "") {
    # 优先从 .release 所在目录推断（workspace 就是 .release 的父目录）
    $potentialWorkspace = Split-Path -Parent $skillRoot
    if (Test-Path (Join-Path $potentialWorkspace ".release")) {
        $WorkspacePath = $potentialWorkspace
    } else {
        # fallback：skill root 本身就是 workspace（如项目级安装）
        $WorkspacePath = $skillRoot
    }
}

if ($SkillsPath -eq "") {
    $SkillsPath = Join-Path $WorkspacePath "skills"
}

if ($StatePath -eq "") {
    $StatePath = Join-Path $WorkspacePath ".release\state.json"
}

Set-Location $WorkspacePath

# 加载上次状态
$lastState = @{
    version = "0.0.0"
    releaseDate = ""
    skills = @{}
}

if (Test-Path $StatePath) {
    try {
        $jsonContent = Get-Content $StatePath -Raw -ErrorAction Stop
        $lastState = $jsonContent | ConvertFrom-Json -ErrorAction Stop
    } catch {
        Write-Host "⚠️  state.json 解析失败，将从头开始扫描" -ForegroundColor Yellow
        $lastState = @{ version = "0.0.0"; releaseDate = ""; skills = @{} }
    }
}

# 扫描当前技能
$currentSkills = @{}

if (Test-Path $SkillsPath) {
    Get-ChildItem $SkillsPath -Directory -ErrorAction SilentlyContinue | ForEach-Object {
        $skillFile = Join-Path $_.FullName "SKILL.md"
        if (Test-Path $skillFile) {
            try {
                $hash = (Get-FileHash $skillFile -Algorithm MD5 -ErrorAction Stop).Hash
                $currentSkills[$_.Name] = @{
                    hash = $hash
                    lastModified = (Get-Item $skillFile -ErrorAction Stop).LastWriteTimeUtc.ToString("o")
                }
            } catch {
                # 跳过无法读取的文件
            }
        }
    }
} else {
    Write-Host "⚠️  skills/ 目录不存在: $SkillsPath" -ForegroundColor Yellow
}

# 对比变更
$added = @()
$modified = @()
$deleted = @()

foreach ($skill in $currentSkills.Keys) {
    if (-not $lastState.skills.$skill) {
        $added += $skill
    } elseif ($lastState.skills.$skill.hash -ne $currentSkills[$skill].hash) {
        $modified += $skill
    }
}

if ($lastState.skills) {
    foreach ($skill in $lastState.skills.PSObject.Properties.Name) {
        if (-not $currentSkills.$skill) {
            $deleted += $skill
        }
    }
}

# 计算建议版本
$lastVersion = $lastState.version
$newVersion = $lastVersion
$changeType = "NONE"

if ($added.Count -gt 0 -or $modified.Count -gt 0 -or $deleted.Count -gt 0) {
    $parts = $lastVersion.Split(".")
    $major = [int]$parts[0]
    $minor = [int]$parts[1]
    $patch = [int]$parts[2]

    if ($deleted.Count -gt 0) {
        $major++; $minor = 0; $patch = 0
        $changeType = "MAJOR"
    } elseif ($added.Count -gt 0) {
        $minor++; $patch = 0
        $changeType = "MINOR"
    } else {
        $patch++
        $changeType = "PATCH"
    }

    $newVersion = "$major.$minor.$patch"
}

# 输出报告
Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          📊 技能变更报告               ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "📅 扫描时间: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
Write-Host "📌 当前版本: $lastVersion"
Write-Host "📂 工作目录: $WorkspacePath"
Write-Host ""

if ($added.Count -gt 0) {
    Write-Host "✅ 新增技能 ($($added.Count) 个):" -ForegroundColor Green
    $added | ForEach-Object { Write-Host "   + $_" -ForegroundColor Green }
    Write-Host ""
}

if ($modified.Count -gt 0) {
    Write-Host "📝 修改技能 ($($modified.Count) 个):" -ForegroundColor Yellow
    $modified | ForEach-Object { Write-Host "   ~ $_" -ForegroundColor Yellow }
    Write-Host ""
}

if ($deleted.Count -gt 0) {
    Write-Host "❌ 删除技能 ($($deleted.Count) 个):" -ForegroundColor Red
    $deleted | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
    Write-Host ""
}

if ($added.Count -eq 0 -and $modified.Count -eq 0 -and $deleted.Count -eq 0) {
    Write-Host "✨ 无变更" -ForegroundColor Gray
} else {
    Write-Host "📊 建议版本: $lastVersion → $newVersion ($changeType)" -ForegroundColor Cyan
}

# 返回 JSON
return @{
    hasChanges       = ($added.Count -gt 0 -or $modified.Count -gt 0 -or $deleted.Count -gt 0)
    currentVersion   = $lastVersion
    suggestedVersion = $newVersion
    changeType       = $changeType
    added            = $added
    modified         = $modified
    deleted          = $deleted
    currentSkills    = $currentSkills
    workspacePath    = $WorkspacePath
    skillsPath       = $SkillsPath
    statePath        = $StatePath
} | ConvertTo-Json -Depth 3
