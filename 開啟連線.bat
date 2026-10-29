@echo off
setlocal

cd /d "%~dp0"
cd tools\ai-organizer

echo Starting FigmaToCreator bridge...
call npm run bridge

if errorlevel 1 (
  echo.
  echo Bridge failed to start. Please check logs above.
  pause
  exit /b 1
)

endlocal