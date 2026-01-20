@echo off
title Levenstracker - Productie Server
color 0A

echo ================================================
echo  Persoonlijke Levenstracker - Productie Versie
echo ================================================
echo.
echo Server start op: http://localhost:3003
echo.
echo Deze versie is VEEL stabieler!
echo.
echo Druk op Ctrl+C om te stoppen
echo ================================================
echo.

cd /d "%~dp0"
serve -s build -l 3003
