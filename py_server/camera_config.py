"""
Camera Configuration Module
Handles camera selection and configuration for the parking system.
"""

import os
import json
import cv2

CONFIG_FILE = "camera_config.json"

def save_camera_config(camera_index, width=1280, height=720, fps=30):
    """Save camera configuration to file"""
    config = {
        "camera_index": camera_index,
        "width": width,
        "height": height,
        "fps": fps
    }
    
    try:
        with open(CONFIG_FILE, 'w') as f:
            json.dump(config, f, indent=2)
        print(f"✅ Camera configuration saved: Camera {camera_index}")
        return True
    except Exception as e:
        print(f"❌ Failed to save camera config: {e}")
        return False

def load_camera_config():
    """Load camera configuration from file"""
    if not os.path.exists(CONFIG_FILE):
        return None
        
    try:
        with open(CONFIG_FILE, 'r') as f:
            config = json.load(f)
        print(f"✅ Loaded camera config: Camera {config['camera_index']}")
        return config
    except Exception as e:
        print(f"❌ Failed to load camera config: {e}")
        return None

def get_camera_index():
    """Get camera index from various sources in order of priority"""
    
    # Priority 1: Environment variable
    env_camera = os.environ.get('CAMERA_INDEX')
    if env_camera is not None:
        try:
            index = int(env_camera)
            print(f"🔧 Using camera index {index} from CAMERA_INDEX environment variable")
            return index
        except ValueError:
            print(f"❌ Invalid CAMERA_INDEX environment variable: {env_camera}")
    
    # Priority 2: Configuration file
    config = load_camera_config()
    if config:
        return config['camera_index']
    
    # Priority 3: Auto-detection
    print("🔍 Auto-detecting cameras...")
    return auto_detect_external_camera()

def auto_detect_external_camera():
    """Automatically detect and return the best camera index (prioritizing index 0 if it's external)"""
    available_cameras = []

    print("Scanning for available cameras...")

    # Test camera indices from 0 to 10
    for camera_index in range(11):
        cap = cv2.VideoCapture(camera_index)
        if cap.isOpened():
            ret, frame = cap.read()
            if ret:
                width = cap.get(cv2.CAP_PROP_FRAME_WIDTH)
                height = cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
                fps = cap.get(cv2.CAP_PROP_FPS)

                available_cameras.append({
                    'index': camera_index,
                    'width': width,
                    'height': height,
                    'fps': fps
                })

                print(f"  📹 Camera {camera_index}: {width}x{height} @ {fps}fps")
            cap.release()

    if not available_cameras:
        print("❌ No cameras found!")
        return 0

    # Check if camera 0 exists and use it (assuming it's your external webcam)
    camera_0_exists = any(cam['index'] == 0 for cam in available_cameras)

    if camera_0_exists:
        camera_0 = next(cam for cam in available_cameras if cam['index'] == 0)
        print(f"✅ Using camera 0 (external webcam): {camera_0['width']}x{camera_0['height']}")
        return 0
    else:
        # Fallback to first available camera
        selected = available_cameras[0]
        print(f"✅ Camera 0 not available, using camera {selected['index']}")
        return selected['index']

def test_camera(camera_index):
    """Test if a camera index works"""
    try:
        cap = cv2.VideoCapture(camera_index)
        if not cap.isOpened():
            return False

        ret, frame = cap.read()
        cap.release()
        return ret
    except Exception as e:
        print(f"Error testing camera {camera_index}: {e}")
        return False

def setup_camera_interactive():
    """Interactive camera setup"""
    print("🎥 Interactive Camera Setup")
    print("=" * 40)
    
    # Scan for cameras
    available_cameras = []
    for i in range(11):
        if test_camera(i):
            cap = cv2.VideoCapture(i)
            width = cap.get(cv2.CAP_PROP_FRAME_WIDTH)
            height = cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
            fps = cap.get(cv2.CAP_PROP_FPS)
            cap.release()
            
            available_cameras.append({
                'index': i,
                'width': width,
                'height': height,
                'fps': fps
            })
    
    if not available_cameras:
        print("❌ No cameras found!")
        return None
    
    print(f"Found {len(available_cameras)} camera(s):")
    for cam in available_cameras:
        camera_type = "Built-in laptop camera" if cam['index'] == 0 else "External camera"
        print(f"  {cam['index']}: {camera_type} - {cam['width']}x{cam['height']} @ {cam['fps']}fps")
    
    print()
    
    while True:
        try:
            choice = input("Enter camera index to use (or 'auto' for automatic): ").strip().lower()
            
            if choice == 'auto':
                camera_index = auto_detect_external_camera()
                break
            
            camera_index = int(choice)
            if any(cam['index'] == camera_index for cam in available_cameras):
                break
            else:
                print(f"❌ Camera {camera_index} not available. Available: {[cam['index'] for cam in available_cameras]}")
                
        except ValueError:
            print("❌ Please enter a valid number or 'auto'")
    
    # Save configuration
    save_camera_config(camera_index)
    print(f"✅ Camera {camera_index} configured and saved!")
    
    return camera_index

if __name__ == "__main__":
    # Run interactive setup
    setup_camera_interactive()
