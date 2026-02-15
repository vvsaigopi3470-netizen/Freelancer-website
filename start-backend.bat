@echo off
echo ========================================
echo Starting FreelanceHub Backend Server
echo ========================================
echo.

cd backend

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo Starting Django server on http://localhost:8000
echo Press Ctrl+C to stop the server
echo.

python manage.py runserver
