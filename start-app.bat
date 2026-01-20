@echo off
title Levenstracker App
echo ================================================
echo  Persoonlijke Levenstracker
echo ================================================
echo.
echo De applicatie start op: http://localhost:3003
echo.
echo Druk op Ctrl+C om te stoppen
echo ================================================
echo.

:start
echo [%TIME%] Starting application...
set PORT=3003
npm start
echo.
echo [%TIME%] Application stopped. Restarting in 5 seconds...
echo Press Ctrl+C to exit or wait to restart...
timeout /t 5
goto start
