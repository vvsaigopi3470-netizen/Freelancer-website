@echo off
echo ========================================
echo Starting FreelanceHub Frontend Server
echo ========================================
echo.
echo Starting HTTP server on http://localhost:5500
echo Press Ctrl+C to stop the server
echo.

python -m http.server 5500
