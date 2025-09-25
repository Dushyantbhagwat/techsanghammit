from flask import Flask, jsonify, Response
from flask_cors import CORS
from car_detection import generate_frames, get_parking_status, detect_ambulance
import cv2
import threading
import time
import os
from camera_config import get_camera_index, load_camera_config

# Camera detection and configuration is now handled by camera_config.py

class Camera:
    def __init__(self):
        # Get camera index using the configuration system
        self.camera_index = get_camera_index()

        print(f"🎥 Attempting to open camera at index {self.camera_index}")
        self.cap = cv2.VideoCapture(self.camera_index)

        # Configure camera settings
        if self.cap.isOpened():
            # Load configuration or use defaults
            config = load_camera_config()
            if config:
                width = config.get('width', 1280)
                height = config.get('height', 720)
                fps = config.get('fps', 30)
            else:
                width, height, fps = 1280, 720, 30

            # Set camera properties
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
            self.cap.set(cv2.CAP_PROP_FPS, fps)

            # Get actual settings
            actual_width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            actual_height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            actual_fps = self.cap.get(cv2.CAP_PROP_FPS)

            print(f"✅ Camera initialized: {actual_width}x{actual_height} @ {actual_fps:.1f}fps")

            # Test if camera is working
            ret, test_frame = self.cap.read()
            if ret:
                print(f"✅ Camera test successful - Frame size: {test_frame.shape}")
            else:
                print("❌ Camera test failed - Cannot read frames")
        else:
            print(f"❌ Failed to open camera at index {self.camera_index}")
            print("💡 Try running 'python test_cameras.py' to identify available cameras")
            print("💡 Or run 'python camera_config.py' for interactive setup")

        self.lock = threading.Lock()
        self.frame = None
        self.running = True
        self.thread = threading.Thread(target=self._update, args=())
        self.thread.daemon = True
        self.thread.start()

    def _update(self):
        while self.running:
            ret, frame = self.cap.read()
            if ret:
                with self.lock:
                    self.frame = frame
            else:
                print("Error: Could not read frame from camera")
                self.running = False
            time.sleep(0.03) # 30 fps

    def get_frame(self):
        with self.lock:
            if self.frame is None:
                return None
            return self.frame.copy()

    def release(self):
        self.running = False
        self.thread.join()
        self.cap.release()

app = Flask(__name__)

# Configure CORS with specific origins for security
allowed_origins = [
    'http://localhost:5173',
    'http://localhost:3000', 
    'http://127.0.0.1:5173',
    os.getenv('FRONTEND_URL'),
    f"https://{os.getenv('VERCEL_URL')}" if os.getenv('VERCEL_URL') else None
]

# Filter out None values
allowed_origins = [origin for origin in allowed_origins if origin]

# If no specific origins configured, allow localhost for development
if not allowed_origins:
    allowed_origins = ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173']

CORS(app, 
     origins=allowed_origins,
     allow_headers=['Content-Type', 'Authorization'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

camera = Camera()

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(camera),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/parking_status')
def parking_status():
    frame = camera.get_frame()
    if frame is None:
        return jsonify({'error': 'Could not get frame from camera'}), 500
    
    occupied_spots = get_parking_status(frame)
    return jsonify({'occupied_spots': occupied_spots})

@app.route('/ambulance_detection')
def ambulance_detection():
    frame = camera.get_frame()
    if frame is None:
        return jsonify({'error': 'Could not get frame from camera'}), 500
    
    ambulance_detected = detect_ambulance(frame)
    return jsonify({'ambulance_detected': ambulance_detected})

if __name__ == '__main__':
    try:
        app.run(port=5001, debug=False, threaded=True)
    finally:
        camera.release()