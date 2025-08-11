#!/usr/bin/env python3
"""
Camera Detection and Testing Script
This script helps you identify which camera index corresponds to your external webcam.
"""

import cv2
import sys

def test_all_cameras():
    """Test all available camera indices and display their properties"""
    print("=== Camera Detection and Testing ===")
    print("Testing camera indices from 0 to 10...")
    print()
    
    working_cameras = []
    
    for camera_index in range(11):
        print(f"Testing camera index {camera_index}...", end=" ")
        
        cap = cv2.VideoCapture(camera_index)
        
        if not cap.isOpened():
            print("❌ Not available")
            continue
            
        # Try to read a frame
        ret, frame = cap.read()
        
        if not ret:
            print("❌ Cannot read frames")
            cap.release()
            continue
            
        # Get camera properties
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        
        # Determine likely camera type
        if camera_index == 0:
            camera_type = "Built-in laptop camera (likely)"
        else:
            camera_type = "External camera (likely)"
            
        print(f"✅ Working - {width}x{height} @ {fps:.1f}fps")
        print(f"   └─ {camera_type}")
        
        working_cameras.append({
            'index': camera_index,
            'width': width,
            'height': height,
            'fps': fps,
            'type': camera_type
        })
        
        cap.release()
        print()
    
    return working_cameras

def test_specific_camera(camera_index):
    """Test a specific camera and show a preview window"""
    print(f"Testing camera {camera_index} with preview window...")

    try:
        cap = cv2.VideoCapture(camera_index)

        if not cap.isOpened():
            print(f"❌ Cannot open camera {camera_index}")
            return False
    except Exception as e:
        print(f"❌ Error opening camera {camera_index}: {e}")
        return False
        
    # Set some properties for better quality
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    cap.set(cv2.CAP_PROP_FPS, 30)
    
    # Get actual properties
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    
    print(f"Camera {camera_index} properties:")
    print(f"  Resolution: {width}x{height}")
    print(f"  FPS: {fps:.1f}")
    print()
    print("Preview window opened. Press 'q' to close and continue, 'ESC' to exit completely.")
    
    window_name = f"Camera {camera_index} Preview - Press 'q' to close"

    # Create window with fallback for different OpenCV versions
    try:
        cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
    except AttributeError:
        try:
            cv2.namedWindow(window_name, cv2.WINDOW_AUTOSIZE)
        except AttributeError:
            cv2.namedWindow(window_name)
    
    frame_count = 0
    try:
        while True:
            ret, frame = cap.read()

            if not ret:
                print("❌ Failed to read frame")
                break

            # Add some info overlay
            frame_count += 1
            try:
                info_text = f"Camera {camera_index} - Frame {frame_count} - {width}x{height}"
                cv2.putText(frame, info_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                cv2.putText(frame, "Press 'q' to close, ESC to exit", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

                cv2.imshow(window_name, frame)
            except Exception as e:
                print(f"⚠️  Display error: {e}")
                # Continue without overlay if there's an issue
                cv2.imshow(window_name, frame)

            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                print("✅ Preview closed")
                break
            elif key == 27:  # ESC key
                print("❌ Exiting...")
                cap.release()
                cv2.destroyAllWindows()
                return False

    except KeyboardInterrupt:
        print("\n⚠️  Interrupted by user")
    except Exception as e:
        print(f"❌ Error during camera preview: {e}")
    
    cap.release()
    cv2.destroyAllWindows()
    return True

def main():
    print("🎥 Camera Detection and Testing Tool")
    print("=" * 50)
    
    # Test all cameras first
    working_cameras = test_all_cameras()
    
    if not working_cameras:
        print("❌ No working cameras found!")
        return
    
    print(f"✅ Found {len(working_cameras)} working camera(s)")
    print()
    
    # Show summary
    print("📋 Summary of available cameras:")
    for cam in working_cameras:
        print(f"  Index {cam['index']}: {cam['width']}x{cam['height']} - {cam['type']}")
    
    print()
    
    # Recommend external camera
    external_cameras = [cam for cam in working_cameras if cam['index'] > 0]
    if external_cameras:
        recommended = external_cameras[0]
        print(f"🎯 Recommended for external camera: Index {recommended['index']}")
        print(f"   (Resolution: {recommended['width']}x{recommended['height']})")
    else:
        print("⚠️  No external cameras detected. Only built-in camera available.")
    
    print()
    
    # Interactive testing
    while True:
        try:
            choice = input("Enter camera index to test (or 'q' to quit): ").strip().lower()
            
            if choice == 'q':
                break
                
            camera_index = int(choice)
            
            if not any(cam['index'] == camera_index for cam in working_cameras):
                print(f"❌ Camera {camera_index} is not available. Available indices: {[cam['index'] for cam in working_cameras]}")
                continue
                
            if not test_specific_camera(camera_index):
                break
                
        except ValueError:
            print("❌ Please enter a valid number or 'q' to quit")
        except KeyboardInterrupt:
            print("\n❌ Interrupted by user")
            break
    
    print()
    print("🏁 Testing complete!")
    print()
    print("💡 To use a specific camera in the parking system:")
    print("   Option 1: Set environment variable: export CAMERA_INDEX=X")
    print("   Option 2: The system will automatically prefer external cameras")

if __name__ == "__main__":
    main()
