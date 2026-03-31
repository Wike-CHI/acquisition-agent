#!/usr/bin/env pwsh
# TuriX-CUA Simple Helper Script (No Conda Required)
# Direct Python execution for Windows

$ErrorActionPreference = "Stop"

# ---------- Configuration ----------
$ProjectDir = "C:\Users\Administrator\TuriX-CUA"
$ConfigFile = Join-Path $ProjectDir "examples\config.json"

# Colors
function Log-Info([string]$msg) { Write-Host "[INFO] $msg" -ForegroundColor Green }
function Log-Warn([string]$msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Log-Error([string]$msg) { Write-Host "[ERROR] $msg" -ForegroundColor Red }

# ---------- Parse Arguments ----------
$Task = $args -join " "

if ([string]::IsNullOrWhiteSpace($Task)) {
    Log-Error "Task required"
    Write-Host "Usage: run_turix_simple.ps1 `"Your task description`""
    exit 1
}

# ---------- Update Config ----------
function Update-Config {
    param([string]$TaskText)
    
    $cfg = Get-Content -LiteralPath $ConfigFile -Raw | ConvertFrom-Json
    
    if (-not $cfg.agent) {
        Log-Error "Invalid config, missing 'agent' section"
        exit 1
    }
    
    $cfg.agent.task = $TaskText
    $cfg.agent.use_plan = $true
    $cfg.agent.use_skills = $true
    
    $json = $cfg | ConvertTo-Json -Depth 20
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($ConfigFile, $json, $utf8NoBom)
}

# ---------- Main ----------
function Main {
    Set-Location -LiteralPath $ProjectDir
    Log-Info "TuriX CUA (Simple Mode)"
    Log-Info "Project: $ProjectDir"
    Log-Info "Task: $Task"
    
    Update-Config -TaskText $Task
    
    Log-Info "Starting TuriX..."
    Log-Info "Press Ctrl+Shift+2 to force stop"
    
    $env:PYTHONUTF8 = "1"
    $env:PYTHONIOENCODING = "utf-8"
    
    python examples/main.py
}

Main
