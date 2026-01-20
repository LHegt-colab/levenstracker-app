@echo off
title Levenstracker - Production Server (Keep Alive)
echo ================================================
echo   Persoonlijke Levenstracker - Permanente Server
echo ================================================
echo.
echo Deze server blijft automatisch herstarten.
echo Sluit dit venster NIET - minimaliseer het.
echo.
echo Server URL: http://localhost:3000
echo.
echo ================================================
echo.

:start
cd /d "%~dp0"
echo [%date% %time%] Server wordt gestart...
npx serve -s build
echo.
echo [%date% %time%] Server gestopt! Herstarten in 3 seconden...
timeout /t 3 /nobreak >nul
goto start
