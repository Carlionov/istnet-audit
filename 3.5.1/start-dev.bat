@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

echo ========================================
echo          MISTNET 2.5.3 — DEV START
echo ========================================

where node >nul 2>nul
if errorlevel 1 (
  echo [ОШИБКА] Node.js не найден. Установи Node.js 22 и перезапусти этот файл.
  echo https://nodejs.org/
  pause
  exit /b 1
)

for /f "tokens=1 delims=v" %%v in ('node -v') do set NODE_VERSION=%%v

echo Node.js: %NODE_VERSION%
node -e "const [major,minor]=process.versions.node.split('.').map(Number);process.exit(major>20||(major===20&&minor>=9)?0:1)"
if errorlevel 1 (
  echo [ОШИБКА] Требуется Node.js 20.9 или новее. Рекомендуется Node.js 22.
  echo https://nodejs.org/
  pause
  exit /b 1
)
if not exist "node_modules\next\package.json" (
  echo.
  echo Устанавливаю зависимости проекта...
  call npm ci
  if errorlevel 1 (
    echo.
    echo [ОШИБКА] Не удалось установить зависимости. Проверь интернет и повтори npm ci.
    pause
    exit /b 1
  )
)

echo.
echo Запускаю MISTNET...
call npm run dev
pause
