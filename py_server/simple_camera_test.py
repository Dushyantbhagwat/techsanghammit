#!/usr/bin/env python3
"""
Simple Camera Test Script
A more robust camera testing tool that works with different OpenCV versions.
"""

import cv2
import sys
import time

def test_camera_basic(camera_index):
    """Basic camera test without preview window"""
    print(f"Testing camera {camera_index}...", end=" ")
    
    try:
        cap = cv2.VideoCapture(camera_index)
        
        if not cap.isOpened():
            print("❌ Cannot open")
            return False
            
        # Try to read a frame
        ret, frame = cap.read()
        
        if not ret:
            print("❌ Cannot read frames")
            cap.release()
            return False
            
        # Get camera properties
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        
        print(f"✅ Working - {width}x{height} @ {fps:.1f}fps")
        
        cap.release()
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_camera_with_preview(camera_index, duration=5):
    """Test camera with a simple preview (no window constants)"""
    print(f"\n🎥 Testing camera {camera_index} with {duration}-second preview...")
    
    try:
        cap = cv2.VideoCapture(camera_index)
        
        if not cap.isOpened():
            print("❌ Cannot open camera")
            return False
            
        # Set some basic properties
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
        
        # Get actual properties
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        
        print(f"Camera properties: {width}x{height} @ {fps:.1f}fps")
        print("Opening preview window... (close window or wait for auto-close)")
        
        # Create window (simple version)
        window_name = f"Camera {camera_index} Test"
        cv2.namedWindow(window_name)
        
        start_time = time.time()
        frame_count = 0
        
        while True:
            ret, frame = cap.read()
            
            if not ret:
                print("❌ Failed to read frame")
                break
                
            frame_count += 1
            elapsed = time.time() - start_time
            
            # Add simple text overlay
            text = f"Camera {camera_index} - Frame {frame_count}"
            cv2.putText(frame, text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            
            text2 = f"Time: {elapsed:.1f}s - Press any key to close"
            cv2.putText(frame, text2, (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            
            cv2.imshow(window_name, frame)
            
            # Check for key press or timeout
            key = cv2.waitKey(1) & 0xFF
            if key != 255:  # Any key pressed
                print("✅ Preview closed by user")
                break
                
            if elapsed >= duration:
                print(f"✅ Preview completed ({duration}s)")
                break
        
        cap.release()
        cv2.destroyAllWindows()
        return True
        
    except Exception as e:
        print(f"❌ Error during preview: {e}")
        try:
            cap.release()
            cv2.destroyAllWindows()
        except:
            pass
        return False

def find_all_cameras():
    """Find all working cameras"""
    print("🔍 Scanning for cameras...")
    print("=" * 40)
    
    working_cameras = []
    
    for i in range(11):
        if test_camera_basic(i):
            working_cameras.append(i)
    
    print()
    
    if not working_cameras:
        print("❌ No working cameras found!")
        return []
    
    print(f"✅ Found {len(working_cameras)} working camera(s): {working_cameras}")
    
    # Identify likely external cameras
    external_cameras = [i for i in working_cameras if i > 0]
    if external_cameras:
        print(f"🎯 External camera(s) detected: {external_cameras}")
        print(f"💡 Recommended for external webcam: Camera {external_cameras[0]}")
    else:
        print("⚠️  Only built-in camera (index 0) detected")
    
    return working_cameras

def main():
    print("🎥 Simple Camera Test Tool")
    print("=" * 50)
    
    # Find all cameras first
    working_cameras = find_all_cameras()
    
    if not working_cameras:
        print("\n💡 Troubleshooting tips:")
        print("1. Make sure your external camera is connected")
        print("2. Close other applications using the camera")
        print("3. Try reconnecting the camera")
        return
    
    print()
    
    # Interactive testing
    while True:
        try:
            print("Options:")
            print("  Enter camera index to test with preview")
            print("  'r' to rescan cameras")
            print("  'q' to quit")
            
            choice = input("\nYour choice: ").strip().lower()
            
            if choice == 'q':
                break
            elif choice == 'r':
                working_cameras = find_all_cameras()
                continue
            
            try:
                camera_index = int(choice)
                
                if camera_index not in working_cameras:
                    print(f"❌ Camera {camera_index} not available. Working cameras: {working_cameras}")
                    continue
                
                # Test with preview
                test_camera_with_preview(camera_index)
                
            except ValueError:
                print("❌ Please enter a valid number, 'r', or 'q'")
                
        except KeyboardInterrupt:
            print("\n❌ Interrupted by user")
            break
    
    print("\n🏁 Camera testing complete!")
    
    # Final recommendation
    external_cameras = [i for i in working_cameras if i > 0]
    if external_cameras:
        print(f"\n💡 To use your external camera, run:")
        print(f"   export CAMERA_INDEX={external_cameras[0]}")
        print(f"   python main.py")
    else:
        print(f"\n💡 To use the built-in camera, run:")
        print(f"   python main.py")

if __name__ == "__main__":
    main()
