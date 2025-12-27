@echo off
title WhatsApp Automation - Instalador
color 0A

echo ========================================
echo   WhatsApp Automation - Instalador
echo ========================================
echo.

REM Verificar si Node.js esta instalado
echo [1/4] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado!
    echo.
    echo Por favor instala Node.js desde: https://nodejs.org/
    echo Descarga la version LTS recomendada.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js encontrado
node --version
echo.

REM Verificar si npm esta disponible
echo [2/4] Verificando npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm no esta disponible!
    echo.
    pause
    exit /b 1
)

echo [OK] npm encontrado
npm --version
echo.

REM Instalar dependencias
echo [3/4] Instalando dependencias...
echo Esto puede tomar varios minutos...
echo.
call npm install

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Fallo la instalacion de dependencias!
    echo.
    echo Intenta lo siguiente:
    echo 1. Verifica tu conexion a internet
    echo 2. Ejecuta como Administrador
    echo 3. Desactiva temporalmente el antivirus
    echo.
    pause
    exit /b 1
)

echo.
echo [OK] Dependencias instaladas correctamente
echo.

REM Compilar CSS
echo [4/4] Compilando CSS...
call npm run build:css

if %errorlevel% neq 0 (
    echo.
    echo [ADVERTENCIA] Fallo la compilacion de CSS
    echo La aplicacion puede funcionar pero sin estilos
    echo.
)

echo.
echo ========================================
echo   INSTALACION COMPLETADA!
echo ========================================
echo.
echo Para iniciar la aplicacion:
echo   - Haz doble clic en: start.bat
echo   - O ejecuta: npm start
echo.
echo Si tienes problemas, lee: TROUBLESHOOTING.md
echo.
pause
