@echo off
echo ===================================================
echo TASK MANAGEMENT SYSTEM - STARTUP SEQUENCE
echo ===================================================
echo.

echo [1/4] Checking Docker Engine Status...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Docker is not running. Starting Docker Desktop...
    start "" "C:\Users\OTS\AppData\Local\Programs\DockerDesktop\Docker Desktop.exe"
    echo Waiting for Docker Engine to initialize (this may take a minute)...
    :waitForDocker
    timeout /t 5 /nobreak >nul
    docker info >nul 2>&1
    if %errorlevel% neq 0 goto waitForDocker
    echo [OK] Docker Engine is now running!
) else (
    echo [OK] Docker Engine is already running.
)
echo.

echo [2/4] Starting Database and Storage Containers...
docker-compose up -d
echo [OK] Containers are up and running!
echo.

echo [3/4] Starting Backend Node.js Server...
start "TMS Backend Server" cmd /c "cd backend && npm run dev"
echo [OK] Backend server launched in a new window.
echo.

echo [4/4] Starting Mobile App (Expo)...
start "TMS Mobile App" cmd /c "cd mobile && npx expo start -c"
echo [OK] Expo Metro Bundler launched in a new window.
echo.

echo ===================================================
echo SYSTEM FULLY OPERATIONAL.
echo You can now scan the QR code in the Expo window.
echo ===================================================
pause
