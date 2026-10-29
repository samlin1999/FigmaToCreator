@echo off
setlocal

set "TARGET=%~dp0.cursor-sdk-state\agents"

if not exist "%TARGET%" (
  echo [skip] agents folder not found: "%TARGET%"
  exit /b 0
)

echo [info] remove all agent folders
echo [info] target: "%TARGET%"

for /d %%D in ("%TARGET%\*") do rd /s /q "%%~fD"

echo [done] cleanup finished
exit /b 0
