@echo off
echo 🚀 Category Migration Script
echo ==========================
echo.

cd /d "%~dp0\.."

echo Starting category migration...
node scripts/migrate-categories.js

echo.
echo ✅ Migration script completed
pause 