@echo off
echo ========================================================
echo         SIBAKTI - DEPLOY ONLINE KE VERCEL
echo ========================================================
echo.
echo 1. Memeriksa status login Vercel...
call npx vercel whoami >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [PERHATIAN] Sesi login Vercel Anda perlu diperbarui.
    echo Silakan login terlebih dahulu (pilih Email / GitHub)...
    echo.
    call npx vercel login
)

echo.
echo 2. Sedang mengunggah dan memperbarui https://sibakti-nine.vercel.app ...
echo.

call npx vercel --prod --yes

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo   BERHASIL! Website Anda sudah terupdate di Vercel.
    echo   Silakan buka https://sibakti-nine.vercel.app/
    echo   (Tekan Ctrl + Shift + R jika tampilan belum berubah)
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo   [PERIKSA] Ada kendala saat deploy.
    echo   Silakan coba login ulang dengan perintah: npx vercel login
    echo ========================================================
)
pause
