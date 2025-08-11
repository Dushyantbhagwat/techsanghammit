#!/usr/bin/env python3
"""
Force Camera 0 Usage
This script configures the system to use camera index 0 as the external webcam.
"""

import json
import cv2
import os
import sys

def test_camera_0():
    """Test camera 0 specifically"""
    print("🎥 Testing Camera 0 (External Webcam)")
    print("=" * 40)
    
    try:
        cap = cv2.VideoCapture(0)
        
        if not cap.isOpened():
            print("❌ Cannot open camera 0")
            return False
        
        # Try to read a frame
        ret, frame = cap.read()
        
        if not ret:
            print("❌ Cannot read frames from camera 0")
            cap.release()
            return False
        
        # Get camera properties
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        
        print(f"✅ Camera 0 working: {width}x{height} @ {fps:.1f}fps")
        print(f"✅ Frame shape: {frame.shape}")
        
        # Test multiple frames
        print("🧪 Testing frame capture...")
        for i in range(5):
            ret, frame = cap.read()
            if ret:
                print(f"  Frame {i+1}: ✅ OK")
            else:
                print(f"  Frame {i+1}: ❌ Failed")
                break
        
        cap.release()
        return True
        
    except Exception as e:
        print(f"❌ Error testing camera 0: {e}")
        return False

def configure_camera_0():
    """Configure the system to use camera 0"""
    print("\n🔧 Configuring system to use camera 0...")
    
    config = {
        "camera_index": 0,
        "width": 1280,
        "height": 720,
        "fps": 30
    }
    
    try:
        with open("camera_config.json", "w") as f:
            json.dump(config, f, indent=2)
        print("✅ Configuration saved to camera_config.json")
        print("✅ System configured to use camera 0 as external webcam")
        return True
    except Exception as e:
        print(f"❌ Failed to save configuration: {e}")
        return False

def set_environment_variable():
    """Set environment variable for camera 0"""
    print("\n🌍 Setting environment variable...")
    
    # For current session
    os.environ['CAMERA_INDEX'] = '0'
    print("✅ CAMERA_INDEX=0 set for current session")
    
    # Show how to set permanently
    print("\n💡 To set permanently:")
    print("  Linux/Mac: echo 'export CAMERA_INDEX=0' >> ~/.bashrc")
    print("  Windows: setx CAMERA_INDEX 0")

def start_server():
    """Start the main server with camera 0"""
    print("\n🚀 Starting server with camera 0...")
    
    try:
        import subprocess
        subprocess.run([sys.executable, "main.py"], check=True)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error starting server: {e}")
    except FileNotFoundError:
        print("❌ main.py not found. Make sure you're in the py_server directory")

def main():
    print("🎯 Force Camera 0 Usage (External Webcam)")
    print("=" * 50)
    
    # Test camera 0 first
    if not test_camera_0():
        print("\n❌ Camera 0 is not working!")
        print("\n🔍 Troubleshooting:")
        print("1. Make sure your external webcam is connected")
        print("2. Check if other applications are using the camera")
        print("3. Try reconnecting the webcam")
        print("4. Run 'python simple_camera_test.py' to see all cameras")
        return
    
    # Configure system
    if not configure_camera_0():
        print("❌ Failed to configure system")
        return
    
    # Set environment variable
    set_environment_variable()
    
    print("\n✅ Camera 0 setup complete!")
    print("\n📋 Summary:")
    print("  - Camera 0 tested and working")
    print("  - Configuration saved")
    print("  - Environment variable set")
    
    # Ask if user wants to start the server
    try:
        choice = input("\n🚀 Start the parking detection server now? (y/n): ").strip().lower()
        if choice == 'y':
            start_server()
        else:
            print("\n💡 To start the server later, run: python main.py")
            print("💡 Camera 0 will be used automatically")
    except KeyboardInterrupt:
        print("\n🛑 Cancelled")

if __name__ == "__main__":
    main()
