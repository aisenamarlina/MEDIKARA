# ============================================================
# auto-push.ps1 - Auto Push to GitHub setiap ada perubahan
# Jalankan: .\scripts\auto-push.ps1
# ============================================================

param(
    [int]$IntervalSeconds = 30,
    [string]$Branch = "main"
)

$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  MEDIKARA - Auto Push to GitHub" -ForegroundColor Cyan
Write-Host "  Repo: aisenamarlina/MEDIKARA" -ForegroundColor Yellow
Write-Host "  Branch: $Branch" -ForegroundColor Yellow
Write-Host "  Cek perubahan setiap: $IntervalSeconds detik" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tekan Ctrl+C untuk berhenti." -ForegroundColor Gray
Write-Host ""

$PushCount = 0

while ($true) {
    $Timestamp = Get-Date -Format "HH:mm:ss"
    $Status = git status --porcelain 2>&1
    
    if ($Status) {
        Write-Host "[$Timestamp] " -NoNewline -ForegroundColor Gray
        Write-Host "Ada perubahan terdeteksi! Memproses..." -ForegroundColor Yellow
        
        $Status | ForEach-Object {
            Write-Host "  -> $_" -ForegroundColor DarkYellow
        }

        git add -A 2>&1 | Out-Null

        $CommitMsg = "Auto update: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        git commit -m $CommitMsg 2>&1 | Out-Null

        $PushResult = git push origin $Branch 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            $PushCount++
            Write-Host "[$Timestamp] " -NoNewline -ForegroundColor Gray
            Write-Host "[OK] Berhasil di-push! (Total push: $PushCount)" -ForegroundColor Green
        } else {
            Write-Host "[$Timestamp] " -NoNewline -ForegroundColor Gray
            Write-Host "[GAGAL] Mencoba pull dulu..." -ForegroundColor Yellow
            git pull --rebase origin $Branch 2>&1 | Out-Null
            git push origin $Branch 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "[OK] Berhasil di-push setelah pull!" -ForegroundColor Green
            }
        }
        Write-Host ""
    } else {
        Write-Host "[$Timestamp] Tidak ada perubahan..." -ForegroundColor DarkGray
    }

    Start-Sleep -Seconds $IntervalSeconds
}
