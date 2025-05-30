@echo off
REM Run the Link Analyzer test script

echo Running Link Analyzer test script...
cd backend
call venv\Scripts\activate
python test_link_analyzer.py
pause
