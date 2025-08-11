@echo off
REM Start Parking Detection with Camera 0 (External Webcam)
echo 🎥 Starting Parking Detection with Camera 0 (External Webcam)
echo ==================================================

REM Set environment variable to force camera 0
set CAMERA_INDEX=0

REM Start the server
echo 🚀 Starting server with camera 0...
python main.py

pause
