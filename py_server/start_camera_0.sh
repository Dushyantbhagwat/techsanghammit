#!/bin/bash

# Start Parking Detection with Camera 0 (External Webcam)
echo "🎥 Starting Parking Detection with Camera 0 (External Webcam)"
echo "=================================================="

# Set environment variable to force camera 0
export CAMERA_INDEX=0

# Start the server
echo "🚀 Starting server with camera 0..."
python main.py
