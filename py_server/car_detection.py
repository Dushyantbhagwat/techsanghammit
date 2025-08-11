import cv2
import json
import time
import os
import numpy as np

# Configuration constants for consistency
CAMERA_FEED_WIDTH = 900
CAMERA_FEED_HEIGHT = 600
UI_SPOT_WIDTH = 200  # minWidth from UI (320px effective with padding)
UI_SPOT_HEIGHT = 160  # minHeight from UI
DETECTION_SPOT_WIDTH = 140  # width in detection coordinates
DETECTION_SPOT_HEIGHT = 75   # height in detection coordinates

# Calculate scaling factors for proportional consistency
SCALE_FACTOR_X = DETECTION_SPOT_WIDTH / UI_SPOT_WIDTH  # ~0.7
SCALE_FACTOR_Y = DETECTION_SPOT_HEIGHT / UI_SPOT_HEIGHT  # ~0.47

# Grid-aligned parking layout with consistent sizing and accurate detection zones
PARKING_SPOTS = [
  # Section A (Left side - A1 to A5) - Grid-aligned with optimized detection zones
  { "id": 'A1', "x": 110, "y": 190, "width": 140, "height": 75, "section": "A" },
  { "id": 'A2', "x": 110, "y": 275, "width": 140, "height": 75, "section": "A" },
  { "id": 'A3', "x": 110, "y": 360, "width": 140, "height": 75, "section": "A" },
  { "id": 'A4', "x": 110, "y": 445, "width": 140, "height": 75, "section": "A" },
  { "id": 'A5', "x": 110, "y": 530, "width": 140, "height": 75, "section": "A" },
  # Section B (Right side - A6 to A10) - Grid-aligned with optimized detection zones
  { "id": 'A6', "x": 450, "y": 190, "width": 140, "height": 75, "section": "B" },
  { "id": 'A7', "x": 450, "y": 275, "width": 140, "height": 75, "section": "B" },
  { "id": 'A8', "x": 450, "y": 360, "width": 140, "height": 75, "section": "B" },
  { "id": 'A9', "x": 450, "y": 445, "width": 140, "height": 75, "section": "B" },
  { "id": 'A10', "x": 450, "y": 530, "width": 140, "height": 75, "section": "B" }
]

script_dir = os.path.dirname(os.path.abspath(__file__))
car_cascade_path = os.path.join(script_dir, 'cars.xml')
ambulance_cascade_path = os.path.join(script_dir, 'ambulance.xml')

print(f"Loading car cascade from: {car_cascade_path}")
print(f"Car cascade file exists: {os.path.exists(car_cascade_path)}")

car_cascade = cv2.CascadeClassifier(car_cascade_path)
ambulance_cascade = cv2.CascadeClassifier(ambulance_cascade_path)

print(f"Car cascade loaded successfully: {not car_cascade.empty()}")
print(f"Ambulance cascade loaded successfully: {not ambulance_cascade.empty()}")

# Run system verification on module load
if __name__ == "__main__":
    verify_system_consistency()

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
    """Enhanced parking status detection with improved accuracy and consistency"""
    try:
        # Check if cascade is loaded
        if car_cascade.empty():
            print("Error: Car cascade classifier not loaded.")
            return []

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # Apply preprocessing for better detection
        gray = cv2.equalizeHist(gray)  # Improve contrast
        gray = cv2.GaussianBlur(gray, (3, 3), 0)  # Reduce noise

        # Detect cars with optimized parameters
        cars = car_cascade.detectMultiScale(gray, 1.05, 5, minSize=(30, 30), maxSize=(200, 200))

        occupied_spots = []
        detection_confidence = {}

        for spot in PARKING_SPOTS:
            spot_id = spot['id']
            is_occupied = False
            max_iou = 0
            best_detection = None

            # Check all detected cars for this spot
            for (x, y, w, h) in cars:
                car_box = [x, y, x + w, y + h]
                spot_box = [spot['x'], spot['y'], spot['x'] + spot['width'], spot['y'] + spot['height']]
                iou = calculate_iou(car_box, spot_box)

                # Use adaptive threshold based on spot size and position
                threshold = get_adaptive_threshold(spot)

                if iou > threshold and iou > max_iou:
                    max_iou = iou
                    best_detection = (x, y, w, h)
                    is_occupied = True

            if is_occupied:
                occupied_spots.append(spot_id)
                detection_confidence[spot_id] = max_iou

        # Validate detection consistency
        validated_spots = validate_detection_consistency(occupied_spots, detection_confidence)

        return validated_spots

    except Exception as e:
        print(f"Error in get_parking_status: {e}")
        import traceback
        traceback.print_exc()
        return []

def get_adaptive_threshold(spot):
    """Get adaptive IoU threshold based on spot characteristics"""
    # Base threshold
    base_threshold = 0.2

    # Adjust based on spot position (edge spots might need lower threshold)
    if spot['id'] in ['A1', 'A5', 'A6', 'A10']:  # Corner spots
        return base_threshold * 0.9
    elif spot['id'] in ['A2', 'A4', 'A7', 'A9']:  # Edge spots
        return base_threshold * 0.95
    else:  # Center spots
        return base_threshold

def validate_detection_consistency(occupied_spots, detection_confidence):
    """Validate detection results for consistency across all spots"""
    validated_spots = []

    for spot_id in occupied_spots:
        confidence = detection_confidence.get(spot_id, 0)

        # Only include spots with sufficient confidence
        if confidence >= 0.15:  # Minimum confidence threshold
            validated_spots.append(spot_id)

    return validated_spots

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

        # Draw enhanced parking overlay with visual improvements
        draw_enhanced_parking_overlay(frame, occupied_spots)

        (flag, encodedImage) = cv2.imencode(".jpg", frame)
        if not flag:
            continue

        yield(b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' +
              bytearray(encodedImage) + b'\r\n')
        time.sleep(0.1) # sleep for 100ms

def draw_enhanced_parking_overlay(frame, occupied_spots):
    """Draw enhanced grid-based parking overlay with structured layout and improved visuals"""

    # Draw background grid structure
    draw_parking_grid_background(frame)

    # Draw section headers with enhanced styling
    draw_section_headers(frame)

    # Draw central driving lane with grid integration
    draw_driving_lane_grid(frame)

    # Draw enhanced parking spots with grid-based layout
    draw_grid_parking_spots(frame, occupied_spots)

def draw_parking_grid_background(frame):
    """Draw the background grid structure for the parking layout"""
    # Grid background for Section A
    cv2.rectangle(frame, (100, 180), (260, 620), (40, 40, 40), 2)  # Section A boundary
    cv2.rectangle(frame, (100, 180), (260, 620), (60, 60, 60), -1)  # Section A fill

    # Grid background for Section B
    cv2.rectangle(frame, (440, 180), (600, 620), (40, 40, 40), 2)  # Section B boundary
    cv2.rectangle(frame, (440, 180), (600, 620), (60, 60, 60), -1)  # Section B fill

    # Draw grid lines for visual structure
    # Horizontal grid lines
    for y in range(200, 620, 85):
        cv2.line(frame, (100, y), (260, y), (80, 80, 80), 1)  # Section A
        cv2.line(frame, (440, y), (600, y), (80, 80, 80), 1)  # Section B

    # Vertical grid lines
    cv2.line(frame, (180, 180), (180, 620), (80, 80, 80), 1)  # Section A center
    cv2.line(frame, (520, 180), (520, 620), (80, 80, 80), 1)  # Section B center

def draw_section_headers(frame):
    """Draw enhanced section headers with grid styling"""
    # Section A header with background
    cv2.rectangle(frame, (100, 150), (260, 180), (100, 100, 100), -1)
    cv2.rectangle(frame, (100, 150), (260, 180), (150, 150, 150), 2)
    cv2.putText(frame, "SECTION A", (130, 170), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

    # Section B header with background
    cv2.rectangle(frame, (440, 150), (600, 180), (100, 100, 100), -1)
    cv2.rectangle(frame, (440, 150), (600, 180), (150, 150, 150), 2)
    cv2.putText(frame, "SECTION B", (470, 170), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

def draw_driving_lane_grid(frame):
    """Draw central driving lane with grid integration"""
    # Main driving lane with grid pattern
    cv2.rectangle(frame, (270, 320), (430, 420), (80, 80, 80), -1)  # Lane background
    cv2.rectangle(frame, (270, 320), (430, 420), (120, 120, 120), 3)  # Lane border

    # Grid pattern in driving lane
    for x in range(280, 420, 30):
        cv2.line(frame, (x, 320), (x, 420), (100, 100, 100), 1)
    for y in range(330, 410, 20):
        cv2.line(frame, (270, y), (430, y), (100, 100, 100), 1)

    # Enhanced lane markings
    for i in range(285, 415, 25):
        cv2.line(frame, (i, 365), (i + 15, 365), (255, 255, 255), 3)

    # Directional arrows with enhanced styling
    arrow_points = [
        [(315, 360), (335, 370), (315, 380), (325, 370)],
        [(375, 360), (395, 370), (375, 380), (385, 370)]
    ]
    for arrow in arrow_points:
        pts = np.array(arrow, np.int32)
        cv2.fillPoly(frame, [pts], (255, 255, 255))
        cv2.polylines(frame, [pts], True, (200, 200, 200), 2)

def draw_grid_parking_spots(frame, occupied_spots):
    """Draw parking spots with grid-based enhanced visualization"""
    for spot in PARKING_SPOTS:
        x, y, w, h = spot['x'], spot['y'], spot['width'], spot['height']
        spot_id = spot['id']

        # Determine spot colors and styling
        if spot_id in occupied_spots:
            # Occupied spot - red with grid styling
            primary_color = (0, 0, 255)  # Red
            fill_color = (0, 0, 180)     # Darker red
            accent_color = (0, 0, 220)   # Medium red
            status_text = "OCCUPIED"
        else:
            # Available spot - green with grid styling
            primary_color = (0, 255, 0)  # Green
            fill_color = (0, 180, 0)     # Darker green
            accent_color = (0, 220, 0)   # Medium green
            status_text = "AVAILABLE"

        # Draw grid-style spot background
        cv2.rectangle(frame, (x, y), (x + w, y + h), fill_color, -1)  # Fill

        # Draw grid pattern within spot
        grid_spacing = 15
        for gx in range(x + grid_spacing, x + w, grid_spacing):
            cv2.line(frame, (gx, y), (gx, y + h), accent_color, 1)
        for gy in range(y + grid_spacing, y + h, grid_spacing):
            cv2.line(frame, (x, gy), (x + w, gy), accent_color, 1)

        # Draw spot border with enhanced styling
        cv2.rectangle(frame, (x, y), (x + w, y + h), primary_color, 3)
        cv2.rectangle(frame, (x-1, y-1), (x + w + 1, y + h + 1), (255, 255, 255), 1)  # White outline

        # Draw spot ID with background
        id_bg_x1, id_bg_y1 = x + 2, y + 2
        id_bg_x2, id_bg_y2 = x + 35, y + 20
        cv2.rectangle(frame, (id_bg_x1, id_bg_y1), (id_bg_x2, id_bg_y2), (0, 0, 0), -1)
        cv2.rectangle(frame, (id_bg_x1, id_bg_y1), (id_bg_x2, id_bg_y2), primary_color, 2)
        cv2.putText(frame, spot_id, (x + 5, y + 16), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)

        # Draw enhanced status indicators
        if spot_id in occupied_spots:
            # Draw car icon with grid styling
            car_center_x = x + w // 2
            car_center_y = y + h // 2

            # Car body
            cv2.ellipse(frame, (car_center_x, car_center_y), (30, 15), 0, 0, 360, (255, 255, 255), -1)
            cv2.ellipse(frame, (car_center_x, car_center_y), (30, 15), 0, 0, 360, primary_color, 2)

            # Car details
            cv2.ellipse(frame, (car_center_x - 10, car_center_y), (8, 6), 0, 0, 360, (200, 200, 200), -1)
            cv2.ellipse(frame, (car_center_x + 10, car_center_y), (8, 6), 0, 0, 360, (200, 200, 200), -1)

            # Occupied indicator
            cv2.circle(frame, (x + w - 10, y + 10), 5, (255, 0, 0), -1)
            cv2.circle(frame, (x + w - 10, y + 10), 5, (255, 255, 255), 2)
        else:
            # Available indicator with grid pattern
            cv2.circle(frame, (x + w - 10, y + 10), 5, (0, 255, 0), -1)
            cv2.circle(frame, (x + w - 10, y + 10), 5, (255, 255, 255), 2)

            # Draw parking lines
            line_y = y + h - 15
            cv2.line(frame, (x + 10, line_y), (x + w - 10, line_y), (255, 255, 255), 2)

        # Draw status text with background
        text_size = cv2.getTextSize(status_text, cv2.FONT_HERSHEY_SIMPLEX, 0.4, 1)[0]
        text_x = x + (w - text_size[0]) // 2
        text_y = y + h - 5

        # Text background
        cv2.rectangle(frame, (text_x - 2, text_y - 12), (text_x + text_size[0] + 2, text_y + 2), (0, 0, 0), -1)
        cv2.putText(frame, status_text, (text_x, text_y), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)

def verify_system_consistency():
    """Verify consistency between detection zones, UI dimensions, and camera feed"""
    print("=== Parking System Consistency Verification ===")

    # Check detection zone consistency
    print(f"Detection zones: {len(PARKING_SPOTS)} spots configured")
    for spot in PARKING_SPOTS:
        print(f"  {spot['id']}: ({spot['x']}, {spot['y']}) - {spot['width']}x{spot['height']}")

    # Check proportional consistency
    print(f"\nProportional Analysis:")
    print(f"  Camera Feed: {CAMERA_FEED_WIDTH}x{CAMERA_FEED_HEIGHT}")
    print(f"  UI Spot Size: {UI_SPOT_WIDTH}x{UI_SPOT_HEIGHT}")
    print(f"  Detection Spot Size: {DETECTION_SPOT_WIDTH}x{DETECTION_SPOT_HEIGHT}")
    print(f"  Scale Factors: X={SCALE_FACTOR_X:.2f}, Y={SCALE_FACTOR_Y:.2f}")

    # Verify grid alignment
    section_a_spots = [s for s in PARKING_SPOTS if s['section'] == 'A']
    section_b_spots = [s for s in PARKING_SPOTS if s['section'] == 'B']

    print(f"\nGrid Alignment:")
    print(f"  Section A: {len(section_a_spots)} spots")
    print(f"  Section B: {len(section_b_spots)} spots")

    # Check spacing consistency
    if len(section_a_spots) > 1:
        spacing = section_a_spots[1]['y'] - section_a_spots[0]['y']
        print(f"  Vertical spacing: {spacing}px")

    print("=== Verification Complete ===\n")

def test_detection_accuracy(frame, test_spots=None):
    """Test detection accuracy for specified spots or all spots"""
    if test_spots is None:
        test_spots = [spot['id'] for spot in PARKING_SPOTS]

    occupied_spots = get_parking_status(frame)

    print(f"Detection Test Results:")
    for spot_id in test_spots:
        status = "OCCUPIED" if spot_id in occupied_spots else "AVAILABLE"
        print(f"  {spot_id}: {status}")

    return occupied_spots