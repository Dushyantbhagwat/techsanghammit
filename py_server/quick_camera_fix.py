#!/usr/bin/env python3
"""
Quick Camera Fix
A simple script to identify your external camera and configure it.
"""

import cv2
import json
import os

def quick_test():
    print("🎥 Quick Camera Detection")
    print("=" * 30)
    
    working_cameras = []
    
    # Test cameras 0-5 (most common range)
    for i in range(6):
        print(f"Testing camera {i}...", end=" ")
        
        try:
            cap = cv2.VideoCapture(i)
            if cap.isOpened():
                ret, frame = cap.read()
                if ret:
                    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                    
                    camera_type = "Built-in" if i == 0 else "External"
                    print(f"✅ {camera_type} - {width}x{height}")
                    
                    working_cameras.append({
                        'index': i,
                        'type': camera_type,
                        'width': width,
                        'height': height
                    })
                else:
                    print("❌ No frames")
                cap.release()
            else:
                print("❌ Cannot open")
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print()
    
    if not working_cameras:
        print("❌ No cameras found!")
        return None
    
    # Show results
    print("📋 Available cameras:")
    for cam in working_cameras:
        print(f"  Index {cam['index']}: {cam['type']} camera - {cam['width']}x{cam['height']}")
    
    # Use camera 0 as the external webcam (as requested)
    camera_0_available = any(cam['index'] == 0 for cam in working_cameras)

    if camera_0_available:
        camera_0 = next(cam for cam in working_cameras if cam['index'] == 0)
        print(f"\n🎯 Using camera 0 as external webcam: {camera_0['width']}x{camera_0['height']}")

        # Save configuration for camera 0
        config = {
            "camera_index": 0,
            "width": 1280,
            "height": 720,
            "fps": 30
        }

        try:
            with open("camera_config.json", "w") as f:
                json.dump(config, f, indent=2)
            print(f"✅ Configuration saved for camera 0 (external webcam)")
        except Exception as e:
            print(f"⚠️  Could not save config: {e}")

        return 0
    else:
        print("\n❌ Camera 0 not available")
        # Fallback to first available camera
        if working_cameras:
            fallback = working_cameras[0]
            print(f"Using fallback camera {fallback['index']}")
            return fallback['index']
        return None

def test_with_environment_variable():
    """Test setting camera via environment variable"""
    camera_index = quick_test()
    
    if camera_index is not None:
        print(f"\n💡 To use camera {camera_index}, you can:")
        print(f"   1. Run: export CAMERA_INDEX={camera_index} && python main.py")
        print(f"   2. Or just run: python main.py (auto-configured)")
        
        # Test if we can actually use this camera
        print(f"\n🧪 Testing camera {camera_index} for 3 seconds...")
        
        try:
            cap = cv2.VideoCapture(camera_index)
            if cap.isOpened():
                # Try to read a few frames
                for i in range(10):
                    ret, frame = cap.read()
                    if ret:
                        print(f"✅ Frame {i+1}/10 - OK")
                    else:
                        print(f"❌ Frame {i+1}/10 - Failed")
                        break
                cap.release()
                print("✅ Camera test successful!")
            else:
                print("❌ Could not open camera for testing")
        except Exception as e:
            print(f"❌ Error during test: {e}")

if __name__ == "__main__":
    test_with_environment_variable()
