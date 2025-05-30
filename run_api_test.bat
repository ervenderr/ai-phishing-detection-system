@echo off
REM Run the API test script

echo Running API test script...
cd backend
call venv\Scripts\activate
python test_api.py
pause
