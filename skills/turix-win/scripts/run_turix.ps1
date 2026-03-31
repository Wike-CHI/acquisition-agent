#!/usr/bin/env pwsh
# TuriX-CUA Helper Script for OpenClaw (Windows)
# Supports dynamic task injection, resume, skills system, and planning

$ErrorActionPreference = "Stop"

# ---------- Configuration ----------
$ProjectDir = "C:\Users\Administrator\TuriX-CUA"
$ConfigFile = Join-Path $ProjectDir "examples\config.json"
$EnvName = "turix_env"
$CondaCmd = "conda"
$RequiredBranch = "multi-agent-windows"
$EnvPython = $null

# Colors (PowerShell host)
function Log-Info([string]$msg) { Write-Host "[INFO] $msg" -ForegroundColor Green }
function Log-Warn([string]$msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Log-Error([string]$msg) { Write-Host "[ERROR] $msg" -ForegroundColor Red }

# ---------- Help ----------
function Show-Help {
@"
Usage: run_turix.ps1 [OPTIONS] [TASK]

OPTIONS:
    -r, --resume ID     Resume task with agent_id
    -c, --config FILE   Use custom config
    -h, --help          Show help
    --no-plan           Disable planning (use_skills also disabled)
    --enable-skills     Enable skills
    --dry-run           Show command without running

EXAMPLES:
    run_turix.ps1 "Open Edge and go to github.com"
    run_turix.ps1 --enable-skills --resume my-task-001 "Continue task"
"@ | Write-Host
}

# ---------- Parse Arguments ----------
$ResumeId = ""
$CustomConfig = ""
$DryRun = $false
$UsePlan = $true
$UseSkills = $true
$TaskParts = New-Object System.Collections.Generic.List[string]

$i = 0
while ($i -lt $args.Count) {
    $arg = [string]$args[$i]
    switch ($arg) {
        "-r" {
            if ($i + 1 -ge $args.Count) { Log-Error "Missing value for $arg"; exit 1 }
            $ResumeId = [string]$args[$i + 1]
            $i += 2
            continue
        }
        "--resume" {
            if ($i + 1 -ge $args.Count) { Log-Error "Missing value for $arg"; exit 1 }
            $ResumeId = [string]$args[$i + 1]
            $i += 2
            continue
        }
        "-c" {
            if ($i + 1 -ge $args.Count) { Log-Error "Missing value for $arg"; exit 1 }
            $CustomConfig = [string]$args[$i + 1]
            $i += 2
            continue
        }
        "--config" {
            if ($i + 1 -ge $args.Count) { Log-Error "Missing value for $arg"; exit 1 }
            $CustomConfig = [string]$args[$i + 1]
            $i += 2
            continue
        }
        "--no-plan" {
            $UsePlan = $false
            $UseSkills = $false
            $i += 1
            continue
        }
        "--enable-skills" {
            $UseSkills = $true
            $i += 1
            continue
        }
        "--dry-run" {
            $DryRun = $true
            $i += 1
            continue
        }
        "-h" {
            Show-Help
            exit 0
        }
        "--help" {
            Show-Help
            exit 0
        }
        default {
            if ($arg.StartsWith("-")) {
                Log-Error "Unknown option: $arg"
                exit 1
            }
            for ($j = $i; $j -lt $args.Count; $j++) {
                [void]$TaskParts.Add([string]$args[$j])
            }
            $i = $args.Count
            continue
        }
    }
}

$Task = ($TaskParts -join " ").Trim()

# ---------- Validation ----------
if ([string]::IsNullOrWhiteSpace($ResumeId) -and [string]::IsNullOrWhiteSpace($Task)) {
    Log-Error "Task or --resume required"
    Show-Help
    exit 1
}

if (-not [string]::IsNullOrWhiteSpace($CustomConfig)) {
    if (-not (Test-Path -LiteralPath $CustomConfig)) {
        Log-Error "Config not found: $CustomConfig"
        exit 1
    }
    $ConfigFile = $CustomConfig
}

if ($ProjectDir -match "^(your_dir|YOUR_DIR)") {
    Log-Error "ProjectDir uses placeholder path. Set it to your real TuriX directory first."
    exit 1
}

if (-not (Test-Path -LiteralPath $ProjectDir)) {
    Log-Error "TuriX project not found: $ProjectDir"
    exit 1
}

# ---------- Update Config (Skills-Compatible) ----------
function Update-Config {
    param([string]$TaskText)

    $cfg = Get-Content -LiteralPath $ConfigFile -Raw | ConvertFrom-Json

    if (-not $cfg.agent) {
        Log-Error "Invalid config, missing 'agent' section: $ConfigFile"
        exit 1
    }

    if (-not [string]::IsNullOrWhiteSpace($TaskText)) {
        $cfg.agent.task = $TaskText
    }

    if (-not [string]::IsNullOrWhiteSpace($ResumeId)) {
        $cfg.agent.resume = $true
        $cfg.agent.agent_id = $ResumeId
    }

    $cfg.agent.use_plan = [bool]$UsePlan
    $cfg.agent.use_skills = [bool]$UseSkills

    if ($cfg.agent.use_skills) {
        $hasSkillsMax = $cfg.agent.PSObject.Properties.Name -contains "skills_max_chars"
        if (-not $hasSkillsMax -or -not $cfg.agent.skills_max_chars) {
            if ($hasSkillsMax) {
                $cfg.agent.skills_max_chars = 4000
            }
            else {
                $cfg.agent | Add-Member -NotePropertyName skills_max_chars -NotePropertyValue 4000
            }
        }
    }

    $json = $cfg | ConvertTo-Json -Depth 20
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($ConfigFile, $json, $utf8NoBom)
}

# ---------- Pre-flight Checks ----------
function Preflight-Checks {
    Log-Info "Running pre-flight checks..."

    $conda = Get-Command $CondaCmd -ErrorAction SilentlyContinue
    if (-not $conda) {
        Log-Error "conda not found in PATH"
        exit 1
    }

    if (-not (Test-Path -LiteralPath $ConfigFile)) {
        Log-Error "Config not found: $ConfigFile"
        exit 1
    }

    $git = Get-Command git -ErrorAction SilentlyContinue
    if ($git) {
        $gitDir = Join-Path $ProjectDir ".git"
        if (Test-Path -LiteralPath $gitDir) {
            $branchRaw = & git -C $ProjectDir branch --show-current 2>$null | Select-Object -First 1
            $currentBranch = if ($null -ne $branchRaw) { ([string]$branchRaw).Trim() } else { "" }
            if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($currentBranch)) {
                Log-Warn "Unable to detect current git branch under '$ProjectDir'"
            }
            elseif ($currentBranch -ne $RequiredBranch) {
                Log-Error "Windows skill requires branch '$RequiredBranch', current branch is '$currentBranch'"
                Log-Error "Run: git -C `"$ProjectDir`" checkout $RequiredBranch"
                exit 1
            }
            else {
                Log-Info "Branch check OK: $currentBranch"
            }
        }
        else {
            Log-Warn "No .git directory detected under '$ProjectDir'; cannot verify branch. Ensure this code comes from '$RequiredBranch'."
        }
    }
    else {
        Log-Warn "git not found in PATH; cannot verify branch '$RequiredBranch'"
    }

    $envList = & $CondaCmd env list 2>$null
    if ($LASTEXITCODE -ne 0) {
        Log-Warn "Unable to inspect conda environments"
    }
    elseif ($envList -notmatch "(^|\s)$([regex]::Escape($EnvName))(\s|$)") {
        Log-Warn "Conda env '$EnvName' not found in 'conda env list' output"
    }

    try {
        $condaBaseRaw = & $CondaCmd info --base 2>$null | Select-Object -First 1
        $condaBase = if ($null -ne $condaBaseRaw) { ([string]$condaBaseRaw).Trim() } else { "" }
        if (-not [string]::IsNullOrWhiteSpace($condaBase)) {
            $candidate = Join-Path $condaBase ("envs\" + $EnvName + "\python.exe")
            if (Test-Path -LiteralPath $candidate) {
                $script:EnvPython = $candidate
                Log-Info "Resolved env python: $candidate"
            }
            else {
                Log-Warn "Env python not found: $candidate"
            }
        }
    }
    catch {
        Log-Warn "Unable to resolve conda base path"
    }

    Log-Info "Pre-flight complete"
}

# ---------- Main ----------
function Main {
    Set-Location -LiteralPath $ProjectDir
    Log-Info "TuriX CUA"
    Log-Info "Project: $ProjectDir"

    if ($DryRun) {
        Log-Info "[DRY RUN]"
        if (-not [string]::IsNullOrWhiteSpace($Task)) {
            Write-Host "  Task: $Task"
        }
        else {
            Write-Host "  Task: (resume) $ResumeId"
        }
        Write-Host "  Plan: $UsePlan"
        Write-Host "  Skills: $UseSkills"
        Write-Host "  Command: $CondaCmd run -n $EnvName python examples/main.py"
        exit 0
    }

    Update-Config -TaskText $Task
    Preflight-Checks

    Log-Info "Starting TuriX..."
    Log-Info "Press Ctrl+Shift+2 to force stop"
    $env:PYTHONUTF8 = "1"
    $env:PYTHONIOENCODING = "utf-8"

    if (-not [string]::IsNullOrWhiteSpace($EnvPython) -and (Test-Path -LiteralPath $EnvPython)) {
        & $EnvPython examples/main.py
    }
    else {
        & $CondaCmd run -n $EnvName python examples/main.py
    }
}

Main
