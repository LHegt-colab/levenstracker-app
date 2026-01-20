@echo off
title Levenstracker - Productie Build
color 0A

echo ================================================
echo  Persoonlijke Levenstracker - Productie Setup
echo ================================================
echo.

REM Check if serve is installed
where serve >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [STAP 1/3] serve is nog niet geinstalleerd
    echo.
    echo Installeren van serve globaal...
    call npm install -g serve
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo FOUT: Kon serve niet installeren!
        echo Probeer handmatig: npm install -g serve
        pause
        exit /b 1
    )
    echo.
    echo serve succesvol geinstalleerd!
    echo.
) else (
    echo [STAP 1/3] serve is al geinstalleerd - OK
    echo.
)

echo [STAP 2/3] Productie build maken...
echo Dit kan 1-2 minuten duren...
echo.

call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo FOUT: Build is mislukt!
    echo Check de error messages hierboven.
    pause
    exit /b 1
)

echo.
echo Build succesvol gemaakt!
echo.

echo [STAP 3/3] Starten van productie server...
echo.
echo ================================================
echo  Server draait op: http://localhost:3003
echo ================================================
echo.
echo Deze productie server is VEEL stabieler!
echo.
echo Voordelen:
echo  - Geen crashes meer
echo  - Sneller en minder geheugen
echo  - Professionele performance
echo.
echo Druk op Ctrl+C om te stoppen
echo ================================================
echo.

serve -s build -l 3003
