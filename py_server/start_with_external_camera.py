#!/usr/bin/env python3
"""
Smart Camera Startup Script
Automatically detects and configures external webcam, then starts the parking system.
"""

import os
import sys
import subprocess
from camera_config import get_camera_index, test_camera, auto_detect_external_camera

def main():
    print("🚗 Smart Parking System - Camera Setup")
    print("=" * 50)
    
    # Check if camera is already configured
    camera_index = get_camera_index()
    
    print(f"📹 Selected camera index: {camera_index}")
    
    # Test the selected camera
    print("🔍 Testing camera...")
    if test_camera(camera_index):
        print("✅ Camera test successful!")
        
        # Provide information about the camera
        if camera_index == 0:
            print("⚠️  Using built-in laptop camera")
            print("💡 If you have an external webcam, make sure it's connected")
        else:
            print(f"✅ Using external camera (index {camera_index})")
        
        print()
        print("🚀 Starting parking detection system...")
        print("Press Ctrl+C to stop")
        print()
        
        # Start the main application
        try:
            subprocess.run([sys.executable, "main.py"], check=True)
        except KeyboardInterrupt:
            print("\n🛑 Stopped by user")
        except subprocess.CalledProcessError as e:
            print(f"❌ Error running main.py: {e}")
            
    else:
        print(f"❌ Camera {camera_index} is not working!")
        print()
        print("🔧 Troubleshooting options:")
        print("1. Run camera detection: python test_cameras.py")
        print("2. Interactive setup: python camera_config.py")
        print("3. Check camera connections and try again")
        
        # Offer to run camera detection
        try:
            choice = input("\nRun camera detection now? (y/n): ").strip().lower()
            if choice == 'y':
                subprocess.run([sys.executable, "test_cameras.py"])
        except KeyboardInterrupt:
            print("\n🛑 Cancelled")

if __name__ == "__main__":
    main()
