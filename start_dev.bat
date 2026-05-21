@echo off
cd /d "C:\Users\OMALE DANJUMA OGALE\Downloads\E-WIN APPLICATIONS IN DEVELOPMENT\ANTIGRAVITY + DEPLOYMENT DEV STAGE\CollegeCBT"
start "collegecbt-dev" /min cmd /c "npm run dev -- --host 0.0.0.0 --port 5173"
echo Dev server starting on http://localhost:5173
echo Waiting for server to be ready...
:loop
timeout /t 2 /nobreak >nul
curl -s --connect-timeout 2 http://127.0.0.1:5173 >nul 2>&1
if errorlevel 1 goto loop
echo Server is ready!
echo.
echo Local URL: http://localhost:5173
echo Network URL: http://0.0.0.0:5173
