from flask import Flask, jsonify, Response
from flask_cors import CORS
from car_detection import generate_frames, get_parking_status, detect_ambulance
import cv2
import threading
import time

class Camera:
    def __init__(self):
        self.cap = cv2.VideoCapture(0)
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
CORS(app)
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