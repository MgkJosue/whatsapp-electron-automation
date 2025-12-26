@echo off
echo ========================================
echo   WhatsApp Automation - Starting...
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Building CSS...
call npm run build:css
echo.

echo Starting Electron app...
call npm start

pause
