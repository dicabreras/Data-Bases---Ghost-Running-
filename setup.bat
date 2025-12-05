@echo off
title  Iniciando setup del proyecto GhostRunning
cd /d "%~dp0"

echo ===============================================
echo      Setup automatico del proyecto GhostRunning
echo ===============================================

:: --- 1. Verificar Node.js ---
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo  Node.js no esta instalado. Por favor instalalo y vuelve a ejecutar este script.
    pause
    exit /b
)

:: --- 2. Verificar npm ---
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo  npm no está instalado. Por favor instalalo y vuelve a ejecutar este script.
    pause
    exit /b
)

:: --- 3. Cargar variables del archivo .env (ubicado en la raíz del proyecto) ---
if exist ".env" (
    for /f "usebackq tokens=1,2 delims==" %%A in (`findstr /v "^#" ".env"`) do (
        set %%A=%%B
    )
    echo  Variables de entorno cargadas desde .env
) else (
    echo  No se encontro el archivo .env en la raiz del proyecto
)

:: --- 4. Instalar dependencias de Database ---
echo.
echo  Instalando dependencias de Database...
cd Proyecto\Database || (
    echo  No se encontro la carpeta Proyecto\Database.
    pause
    exit /b
)
call npm install

:: --- 5. Volver al directorio raíz ---
cd ..\..

:: --- 6. Instalar dependencias del Backend ---
echo.
echo  Instalando dependencias del Backend...
cd Proyecto\Backend || (
    echo  No se encontro la carpeta Proyecto\Backend.
    pause
    exit /b
)
call npm install

:: --- 7. Crear la base de datos si no existe ---
echo.
echo  Verificando o creando base de datos...
call npm run setup-db

:: --- 7.1 Ejecutar tests del Backend ---
echo.
echo  Ejecutando tests del Backend...
call npm test || (
    echo  Tests del backend fallaron. Revisa la salida.
    pause
    exit /b
)

:: --- 8. Volver al directorio raíz ---
cd ..\..

::: --- 9. Instalar dependencias del Frontend ---
echo.
echo  Instalando dependencias del Frontend...
cd Proyecto\Frontend || (
    echo  No se encontro la carpeta del frontend.
    pause
    exit /b
)
call npm install

:: --- 10. Instalar expo-speech para anuncios de audio ---
echo.
echo  Instalando expo-speech para anuncios de audio...
call npm install expo-speech

:: --- 11. Crear ghost ficticio de 10km ---
echo.
echo  Creando ghost ficticio de 10km...
cd ..\Database || (
    echo  No se encontro la carpeta Database.
    pause
    exit /b
)
call npx ts-node seed-ghost.ts diegoGo@runner.com

:: --- 12. Levantar el servidor Backend ---
echo  Levantando el servidor Backend...
:: ir al Backend usando la ruta absoluta basada en la ubicación del script
cd /d "%~dp0Proyecto\Backend" || (
    echo  No se encontro la carpeta Proyecto\Backend.
    pause
    exit /b
)
call npm start

echo.
echo ===============================================
echo  Setup completado con exito.
echo ===============================================

pause