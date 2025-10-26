@echo off
echo Iniciando Agenda Hibrida - Sistema para Tatuadores
echo ================================================

echo Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Node.js nao encontrado. Instale o Node.js primeiro.
    pause
    exit /b 1
)

echo Instalando dependencias do backend...
cd /d "%~dp0"
call npm install

echo Instalando dependencias do frontend...
cd /d "%~dp0../agenda-hibrida-frontend"
call npm install

echo Iniciando servidor backend...
cd /d "%~dp0"
start "Backend" cmd /k "npm run dev"

timeout /t 3 /nobreak >nul

echo Iniciando frontend...
cd /d "%~dp0../agenda-hibrida-frontend"
start "Frontend" cmd /k "npm run dev"

echo.
echo Sistema iniciado com sucesso!
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Pressione qualquer tecla para abrir o navegador...
pause >nul

start http://localhost:5173
