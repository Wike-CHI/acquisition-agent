#!/usr/bin/env pwsh
$basedir = Split-Path $MyInvocation.MyCommand.Definition -Parent
& "$basedir\node_modules\agent-browser\bin\agent-browser-win32-x64.exe" $args
exit $LASTEXITCODE
