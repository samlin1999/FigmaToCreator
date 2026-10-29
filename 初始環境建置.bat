@echo off
setlocal

cd /d "%~dp0"

echo [1/3] Installing tools/ai-organizer dependencies...
cd tools\ai-organizer
call npm install
if errorlevel 1 goto :error

echo [2/3] Installing tools/figma-plugin dependencies...
cd ..\figma-plugin
call npm install
if errorlevel 1 goto :error

echo [3/3] Installing extensions/figma-importer dependencies...
cd ..\..\extensions\figma-importer
call npm install
if errorlevel 1 goto :error

echo.
echo All dependencies installed successfully.
goto :end

:error
echo.
echo Failed during npm install. Please check error logs above.
exit /b 1

:end
endlocal
