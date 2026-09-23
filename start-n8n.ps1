# start-n8n.ps1 — Loads .env.local (then .env) and starts n8n locally.
# Usage: powershell -ExecutionPolicy Bypass -File start-n8n.ps1
# Mirrors Docker's .env behavior on Windows.

function Load-EnvFile($path) {
    if (Test-Path $path) {
        Get-Content $path | ForEach-Object {
            $line = $_.Trim()
            if ($line -and -not $line.StartsWith('#')) {
                $parts = $line -split '=', 2
                if ($parts.Length -eq 2) {
                    $key = $parts[0].Trim()
                    $val = $parts[1].Trim()
                    # Only set if not already set (so .env.local wins over .env)
                    if (-not [System.Environment]::GetEnvironmentVariable($key, 'Process')) {
                        [System.Environment]::SetEnvironmentVariable($key, $val, 'Process')
                        Write-Host "  Loaded: $key" -ForegroundColor DarkGray
                    }
                }
            }
        }
        Write-Host "  Loaded $path" -ForegroundColor Green
    }
}

# Load .env.local first (highest priority — secrets), then .env (safe defaults)
Load-EnvFile (Join-Path $PSScriptRoot ".env.local")
Load-EnvFile (Join-Path $PSScriptRoot ".env")

Write-Host "`n  Environment ready. Starting n8n...`n" -ForegroundColor Cyan

# Launch n8n
npx n8n
