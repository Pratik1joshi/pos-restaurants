@echo off
title Restaurant POS System
color 0A

echo.
echo ========================================
echo    Restaurant POS System
echo    Starting Server...
echo ========================================
echo.

cd /d "%~dp0"

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org
    echo Download the LTS version and install it.
    echo.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies... Please wait...
    call npm install
    echo.
)

REM Check if build exists
if not exist ".next\" (
    echo Building application... Please wait...
    call npm run build
    echo.
)

REM Start the server
echo Starting Restaurant POS System...
echo.
node server.js

pause
