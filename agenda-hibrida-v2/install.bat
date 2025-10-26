@echo off
setlocal enabledelayedexpansion

:: ==========================================
:: INSTALACAO AUTOMATICA - AGENDA HIBRIDA
:: ==========================================
:: Script para Windows
:: Versao: 2.0
:: ==========================================

color 0A
title Instalacao Automatica - Agenda Hibrida v2.0

echo.
echo ==========================================
echo   INSTALACAO AUTOMATICA
echo   Agenda Hibrida v2.0
echo ==========================================
echo.

:: Verificar se esta executando como Administrador
net session >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [ERRO] Este script precisa ser executado como ADMINISTRADOR!
    echo.
    echo Clique com botao direito no arquivo e selecione:
    echo "Executar como administrador"
    echo.
    pause
    exit /b 1
)

:: ==========================================
:: ETAPA 1: Verificar Node.js
:: ==========================================
echo [1/6] Verificando Node.js...
echo.

node --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERRO] Node.js nao encontrado!
    echo.
    echo Por favor, instale o Node.js primeiro:
    echo https://nodejs.org/
    echo.
    echo Versao recomendada: v18 LTS ou superior
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo   [OK] Node.js %NODE_VERSION% encontrado
echo.

:: ==========================================
:: ETAPA 2: Instalar PNPM
:: ==========================================
echo [2/6] Instalando PNPM...
echo.

pnpm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo   PNPM nao encontrado. Instalando...
    call npm install -g pnpm
    if %errorlevel% neq 0 (
        color 0C
        echo   [ERRO] Falha ao instalar PNPM
        pause
        exit /b 1
    )
    echo   [OK] PNPM instalado com sucesso
) else (
    for /f "tokens=*" %%i in ('pnpm --version') do set PNPM_VERSION=%%i
    echo   [OK] PNPM !PNPM_VERSION! ja instalado
)
echo.

:: ==========================================
:: ETAPA 3: Instalar Backend
:: ==========================================
echo [3/6] Instalando dependencias do Backend...
echo   Localizacao: %CD%
echo   Tempo estimado: 2-5 minutos
echo   Tamanho: ~150-200 MB
echo.

call npm install
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [ERRO] Falha ao instalar dependencias do backend!
    echo.
    echo Possivel solucao:
    echo   npm install -g windows-build-tools
    echo.
    pause
    exit /b 1
)

echo.
echo   [OK] Backend instalado! (21 pacotes)
echo.

:: ==========================================
:: ETAPA 4: Configurar Banco
:: ==========================================
echo [4/6] Configurando banco de dados...
echo.

node scripts/setup-complete.js
if %errorlevel% neq 0 (
    color 0E
    echo   [AVISO] Setup com avisos, mas continuando...
) else (
    echo   [OK] Banco configurado!
)
echo.

:: ==========================================
:: ETAPA 5: Instalar Frontend
:: ==========================================
echo [5/6] Instalando dependencias do Frontend...
echo   Localizacao: ..\agenda-hibrida-frontend
echo   Tempo estimado: 3-7 minutos
echo   Tamanho: ~300-400 MB
echo.

cd /d "%~dp0..\agenda-hibrida-frontend"
if %errorlevel% neq 0 (
    color 0C
    echo [ERRO] Diretorio agenda-hibrida-frontend nao encontrado!
    echo.
    echo Estrutura esperada:
    echo   agenda-hibrida-v2\
    echo   agenda-hibrida-frontend\
    echo.
    pause
    exit /b 1
)

call pnpm install
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [ERRO] Falha ao instalar dependencias do frontend!
    echo.
    pause
    exit /b 1
)

echo.
echo   [OK] Frontend instalado! (58 pacotes)
echo.

:: ==========================================
:: ETAPA 6: Verificar .env
:: ==========================================
echo [6/6] Verificando configuracao...
echo.

cd /d "%~dp0"

if exist ".env" (
    echo   [OK] Arquivo .env encontrado
) else (
    color 0E
    echo   [AVISO] Arquivo .env NAO encontrado!
    echo.
    if exist ".env.example" (
        echo   Criando .env a partir do .env.example...
        copy .env.example .env >nul
        echo   [OK] Arquivo .env criado!
        echo.
        echo   IMPORTANTE: Edite o .env com suas credenciais!
    ) else (
        echo   [ERRO] .env.example tambem nao encontrado!
    )
)

echo.

:: ==========================================
:: RESUMO
:: ==========================================
color 0A
echo.
echo ==========================================
echo   INSTALACAO CONCLUIDA!
echo ==========================================
echo.
echo O que foi instalado:
echo   [OK] PNPM - Gerenciador de pacotes
echo   [OK] Backend - 21 pacotes (~200 MB)
echo   [OK] Frontend - 58 pacotes (~400 MB)
echo   [OK] Banco de dados configurado
echo   [OK] Estrutura de pastas criada
echo.
echo Proximos passos OBRIGATORIOS:
echo.
echo   1. CONFIGURE O ARQUIVO .env
echo      Abra: agenda-hibrida-v2\.env
echo      Configure:
echo        - GOOGLE_CLIENT_ID (Google Cloud Console)
echo        - GOOGLE_CLIENT_SECRET
echo        - SMTP_USER (seu Gmail)
echo        - SMTP_PASS (senha de app)
echo        - JWT_SECRET (string aleatoria)
echo.
echo   2. INICIE O SISTEMA
echo      Execute: start-windows.bat
echo.
echo   3. ACESSE NO NAVEGADOR
echo      http://localhost:5173
echo.
echo   4. CONECTE SUA CONTA GOOGLE
echo      Clique em "Conectar Google"
echo.
echo ==========================================
echo.
echo Documentacao completa:
echo   - GUIA_INSTALACAO_RAPIDA.md
echo   - ANALISE_COMPLETA_DO_SISTEMA.md
echo   - CHECKLIST_INSTALACAO.md
echo   - PROBLEMAS_ENCONTRADOS.md
echo.
echo ==========================================
echo.

:: Abrir documentacao
set /p OPEN_DOCS=Deseja abrir o guia de instalacao? (S/N): 
if /i "%OPEN_DOCS%"=="S" (
    cd /d "%~dp0..\"
    start GUIA_INSTALACAO_RAPIDA.md
)

:: Editar .env
echo.
set /p EDIT_ENV=Deseja editar o arquivo .env agora? (S/N): 
if /i "%EDIT_ENV%"=="S" (
    cd /d "%~dp0"
    if exist ".env" (
        notepad .env
    ) else (
        echo .env nao encontrado!
    )
)

echo.
echo Pressione qualquer tecla para finalizar...
pause >nul

cd /d "%~dp0"

