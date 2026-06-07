@echo off
echo.
echo ========================================
echo   BudgetBeacon - Auto Setup Script
echo ========================================
echo.

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install from https://nodejs.org and re-run this script.
    pause
    exit /b
)
echo [OK] Node.js found: 
node --version

:: Check npm
npm --version >nul 2>&1
echo [OK] npm found: 
npm --version

echo.
echo [1/4] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install failed. Check your internet connection.
    pause
    exit /b
)
echo [OK] Dependencies installed!

echo.
echo [2/4] Generating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo [ERROR] Prisma generate failed.
    pause
    exit /b
)
echo [OK] Prisma client generated!

echo.
echo [3/4] Running database migrations...
echo NOTE: Make sure PostgreSQL is running and 'budgetbeacon' database exists!
echo.
call npx prisma migrate dev --name init
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Migration failed!
    echo.
    echo Common fixes:
    echo  1. Open pgAdmin ^> right-click Databases ^> Create ^> budgetbeacon
    echo  2. Check your password in .env file - update DATABASE_URL if needed
    echo  3. Make sure PostgreSQL service is running
    echo.
    pause
    exit /b
)
echo [OK] Database migrated!

echo.
echo [4/4] Starting BudgetBeacon API...
echo.
echo ========================================
echo   Server starting at:
echo   http://localhost:5000
echo   Health: http://localhost:5000/health
echo ========================================
echo.
call npm run dev
