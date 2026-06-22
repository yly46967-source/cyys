@echo off
echo Starting TechCraft Development Server...
echo.
echo Server will be available at: http://localhost:8000
echo Press Ctrl+C to stop the server
echo.

REM Try Python 3 first
python --version >/dev/null 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Using Python 3...
    python -m http.server 8000
    goto :end
)

REM Try Python 2
python -c "print 'Hello'" >/dev/null 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Using Python 2...
    python -m SimpleHTTPServer 8000
    goto :end
)

REM Try Python launcher
py --version >/dev/null 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Using Python Launcher...
    py -m http.server 8000
    goto :end
)

echo Error: Python not found. Please install Python or use Node.js:
echo   npm install -g http-server
echo   http-server -p 8000
pause

:end
