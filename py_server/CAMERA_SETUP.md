# Camera Setup Guide

This guide helps you configure your external webcam for the parking detection system.

## 🎯 Quick Setup

### Method 1: Automatic Detection (Recommended)
The system will automatically detect and prefer external cameras over built-in laptop cameras.

```bash
# Just run the server - it will auto-detect your external camera
python main.py
```

### Method 2: Interactive Setup
Run the interactive camera configuration tool:

```bash
python camera_config.py
```

This will:
- Scan for all available cameras
- Show you their properties (resolution, FPS)
- Let you choose which one to use
- Save your choice for future use

### Method 3: Manual Configuration
Set the camera index using an environment variable:

```bash
# For external camera (usually index 1 or 2)
export CAMERA_INDEX=1
python main.py
```

Or on Windows:
```cmd
set CAMERA_INDEX=1
python main.py
```

## 🔍 Testing Your Cameras

### Test All Available Cameras
```bash
python test_cameras.py
```

This script will:
- Find all working cameras on your system
- Show their properties and likely type (built-in vs external)
- Let you test each camera with a preview window
- Recommend which camera to use for external webcam

### Example Output
```
=== Camera Detection and Testing ===
Testing camera indices from 0 to 10...

Testing camera index 0... ✅ Working - 1280x720 @ 30.0fps
   └─ Built-in laptop camera (likely)

Testing camera index 1... ✅ Working - 1920x1080 @ 30.0fps
   └─ External camera (likely)

Testing camera index 2... ❌ Not available

🎯 Recommended for external camera: Index 1
   (Resolution: 1920x1080)
```

## 🛠️ Troubleshooting

### Camera Not Detected
1. **Check physical connection**: Ensure your external webcam is properly plugged in
2. **Check other applications**: Close any other apps that might be using the camera (Zoom, Skype, etc.)
3. **Try different USB ports**: Some USB ports may have better compatibility
4. **Restart the camera**: Unplug and reconnect your external webcam

### Wrong Camera Being Used
1. **Use environment variable**:
   ```bash
   export CAMERA_INDEX=2  # Try different numbers
   python main.py
   ```

2. **Run interactive setup**:
   ```bash
   python camera_config.py
   ```

3. **Check camera indices**:
   ```bash
   python test_cameras.py
   ```

### Camera Quality Issues
The system automatically tries to set optimal settings:
- Resolution: 1280x720 (or higher if supported)
- FPS: 30 (or camera maximum)

You can modify these in `camera_config.py` if needed.

## 📋 Camera Index Reference

Typically:
- **Index 0**: Built-in laptop camera
- **Index 1**: First external USB camera
- **Index 2**: Second external USB camera
- **Index 3+**: Additional cameras

## 🔧 Advanced Configuration

### Save Custom Settings
```python
from camera_config import save_camera_config

# Save camera 1 with custom resolution
save_camera_config(
    camera_index=1,
    width=1920,
    height=1080,
    fps=30
)
```

### Configuration File
Settings are saved in `camera_config.json`:
```json
{
  "camera_index": 1,
  "width": 1280,
  "height": 720,
  "fps": 30
}
```

## 🚀 Quick Commands

```bash
# Test all cameras and see which ones work
python test_cameras.py

# Interactive camera setup
python camera_config.py

# Use specific camera
export CAMERA_INDEX=1 && python main.py

# Run with automatic detection (default)
python main.py
```

## 💡 Tips

1. **External cameras are preferred**: The system automatically chooses external cameras over built-in ones
2. **Higher resolution is better**: For parking detection, higher resolution cameras work better
3. **Good lighting helps**: Ensure your parking area is well-lit for better detection
4. **Test before deploying**: Always test your camera setup before relying on it

## 🆘 Still Having Issues?

1. Run the test script: `python test_cameras.py`
2. Check the output for available cameras
3. Note which camera index corresponds to your external webcam
4. Use that index with: `export CAMERA_INDEX=X && python main.py`

If you're still having trouble, the output from `test_cameras.py` will help identify the issue.
