// Parking spot definitions for UI display
// Note: These coordinates are for reference only. The UI uses responsive grid layout.
// Actual detection coordinates are defined in py_server/car_detection.py
// UI spot dimensions: 320×160px effective (200×160px minimum + padding)
// Detection spot dimensions: 140×75px (proportionally consistent)

export const PARKING_SPOTS = [
  // Section A (Left side - A1 to A5)
  { id: 'A1', x: 100, y: 200, width: 100, height: 150, section: 'A' },
  { id: 'A2', x: 220, y: 200, width: 100, height: 150, section: 'A' },
  { id: 'A3', x: 340, y: 200, width: 100, height: 150, section: 'A' },
  { id: 'A4', x: 460, y: 200, width: 100, height: 150, section: 'A' },
  { id: 'A5', x: 580, y: 200, width: 100, height: 150, section: 'A' },
  // Section B (Right side - A6 to A10)
  { id: 'A6', x: 100, y: 370, width: 100, height: 150, section: 'B' },
  { id: 'A7', x: 220, y: 370, width: 100, height: 150, section: 'B' },
  { id: 'A8', x: 340, y: 370, width: 100, height: 150, section: 'B' },
  { id: 'A9', x: 460, y: 370, width: 100, height: 150, section: 'B' },
  { id: 'A10', x: 580, y: 370, width: 100, height: 150, section: 'B' }
];

// System consistency constants
export const SYSTEM_CONFIG = {
  TOTAL_SPOTS: 10,
  SECTIONS: ['A', 'B'],
  SPOTS_PER_SECTION: 5,
  UI_DIMENSIONS: {
    MIN_WIDTH: 200,
    MIN_HEIGHT: 160,
    EFFECTIVE_WIDTH: 320,
    EFFECTIVE_HEIGHT: 160
  },
  DETECTION_DIMENSIONS: {
    WIDTH: 140,
    HEIGHT: 75
  },
  CAMERA_FEED: {
    WIDTH: 900,
    HEIGHT: 600
  }
};