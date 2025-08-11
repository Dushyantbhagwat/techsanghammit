import cv2
import json
import time
import os

PARKING_SPOTS = [
  { "id": 'A1', "x": 100, "y": 200, "width": 100, "height": 150 },
  { "id": 'A2', "x": 220, "y": 200, "width": 100, "height": 150 },
  { "id": 'A3', "x": 340, "y": 200, "width": 100, "height": 150 },
  { "id": 'A4', "x": 460, "y": 200, "width": 100, "height": 150 },
  { "id": 'A5', "x": 580, "y": 200, "width": 100, "height": 150 },
  { "id": 'A6', "x": 100, "y": 370, "width": 100, "height": 150 },
  { "id": 'A7', "x": 220, "y": 370, "width": 100, "height": 150 },
  { "id": 'A8', "x": 340, "y": 370, "width": 100, "height": 150 },
  { "id": 'A9', "x": 460, "y": 370, "width": 100, "height": 150 },
  { "id": 'A10', "x": 580, "y": 370, "width": 100, "height": 150 }
]

script_dir = os.path.dirname(os.path.abspath(__file__))
car_cascade = cv2.CascadeClassifier(os.path.join(script_dir, 'cars.xml'))
ambulance_cascade = cv2.CascadeClassifier(os.path.join(script_dir, 'ambulance.xml'))

def calculate_iou(boxA, boxB):
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2])
    yB = min(boxA[3], boxB[3])

    interArea = max(0, xB - xA) * max(0, yB - yA)
    boxAArea = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1])
    boxBArea = (boxB[2] - boxB[0]) * (boxB[3] - boxB[1])
    iou = interArea / float(boxAArea + boxBArea - interArea) if (boxAArea + boxBArea - interArea) != 0 else 0
    return iou

def get_parking_status(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    cars = car_cascade.detectMultiScale(gray, 1.05, 5)
    
    occupied_spots = []

    for spot in PARKING_SPOTS:
        is_occupied = False
        for (x, y, w, h) in cars:
            car_box = [x, y, x + w, y + h]
            spot_box = [spot['x'], spot['y'], spot['x'] + spot['width'], spot['y'] + spot['height']]
            iou = calculate_iou(car_box, spot_box)
            
            if iou > 0.2:
                is_occupied = True
                break
        
        if is_occupied:
            occupied_spots.append(spot['id'])
    
    return occupied_spots

def detect_ambulance(frame):
    if ambulance_cascade.empty():
        print("Error: Ambulance cascade classifier not loaded.")
        return False
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    ambulances = ambulance_cascade.detectMultiScale(gray, 1.05, 3)
    return len(ambulances) > 0

def generate_frames(camera):
    while True:
        frame = camera.get_frame()
        if frame is None:
            break
        
        occupied_spots = get_parking_status(frame)

        for spot in PARKING_SPOTS:
            if spot['id'] in occupied_spots:
                color = (0, 0, 255) # Red for occupied
            else:
                color = (0, 255, 0) # Green for available
            
            cv2.rectangle(frame, (spot['x'], spot['y']), (spot['x'] + spot['width'], spot['y'] + spot['height']), color, 2)
            cv2.putText(frame, spot['id'], (spot['x'], spot['y'] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

        (flag, encodedImage) = cv2.imencode(".jpg", frame)
        if not flag:
            continue
        
        yield(b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + 
              bytearray(encodedImage) + b'\r\n')
        time.sleep(0.1) # sleep for 100ms