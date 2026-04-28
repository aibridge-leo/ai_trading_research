@echo off
REM ============================================================
REM  AI Compete - Dev Server Launcher (portable)
REM  Place this .bat in the project root (next to package.json).
REM  Works from any clone location - no absolute path needed.
REM ============================================================

title AI Compete Dev Server
setlocal

REM %~dp0 = directory containing THIS .bat file (with trailing backslash)
set "URL=http://localhost:3000"

cd /d "%~dp0"
if errorlevel 1 (
    echo.
    echo [ERROR] Cannot enter project folder:
    echo   %~dp0
    echo.
    pause
    exit /b 1
)

REM Sanity check: this should be the AI Compete project root
if not exist "package.json" (
    echo.
    echo [ERROR] package.json not found in:
    echo   %CD%
    echo.
    echo This .bat must be placed in the project root
    echo next to package.json.
    echo.
    pause
    exit /b 1
)

cls
echo.
echo  ============================================
echo    AI Compete - Dev Server Launcher
echo    %URL%
echo  ============================================
echo.

REM Check .env.local exists (API keys required)
if not exist ".env.local" (
    echo  [WARN] .env.local not found.
    echo.
    echo  Setup steps:
    echo    1. Copy .env.local.example to .env.local
    echo    2. Fill in your 3 API keys:
    echo       OPENAI_API_KEY
    echo       GOOGLE_GENERATIVE_AI_API_KEY
    echo       PERPLEXITY_API_KEY
    echo.
    echo  Get keys at:
    echo    OpenAI:     https://platform.openai.com/api-keys
    echo    Google:     https://aistudio.google.com/app/apikey
    echo    Perplexity: https://www.perplexity.ai/settings/api
    echo.
    pause
    exit /b 1
)

REM Install dependencies if missing
if not exist "node_modules" (
    echo  [INFO] node_modules not found. Running npm install...
    echo  This takes 1-2 minutes on first setup.
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo  [ERROR] npm install failed. Is Node.js installed?
        echo  Download from: https://nodejs.org/
        pause
        exit /b 1
    )
    echo.
)

REM If port 3000 already in use, just open browser
netstat -ano | findstr ":3000" | findstr "LISTENING" > nul 2>&1
if not errorlevel 1 (
    echo  [INFO] Dev server is already running on port 3000.
    echo         Opening browser only.
    echo.
    start "" "%URL%"
    echo.
    echo  To restart the server fresh:
    echo    1. Open Task Manager and end the node.exe process
    echo    2. Run this .bat file again
    echo.
    pause
    exit /b 0
)

echo  [INFO] Starting dev server. Browser opens in 6 seconds.
echo  [INFO] Press Ctrl+C in this window to stop the server.
echo.

REM Wait 6 seconds in background, then open browser via explorer
REM (using explorer avoids the nested-quote ambiguity of "start "" URL")
start "" /min cmd /c "ping -n 7 127.0.0.1 >nul & explorer %URL%"

REM Run dev server in foreground
call npm run dev

echo.
echo  [INFO] Dev server stopped.
pause
