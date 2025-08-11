import { trafficImages } from "@/assets/traffic-cameras";

interface VehicleDetection {
  vehicleNumber: string;
  timestamp: string;
  type: string;
}

interface CameraData {
  id: number;
  location: string;
  signalStatus: 'red' | 'yellow' | 'green';
  vehicleCount: number;
  trafficDensity: 'low' | 'medium' | 'high';
  recentDetections: VehicleDetection[];
  imageUrl: string;
}

// Mock traffic camera data
const trafficCameras: CameraData[] = [
  {
    id: 1,
    location: "Borivali Junction",
    signalStatus: 'red',
    vehicleCount: 45,
    trafficDensity: 'high',
    imageUrl: trafficImages.borivaliJunction,
    recentDetections: [
      { vehicleNumber: "MH02AB1234", timestamp: "09:20:15", type: "Car" },
      { vehicleNumber: "MH02CD5678", timestamp: "09:20:10", type: "Bike" },
    ]
  },
  {
    id: 2,
    location: "Thane West Signal",
    signalStatus: 'green',
    vehicleCount: 23,
    trafficDensity: 'medium',
    imageUrl: trafficImages.thaneJunction,
    recentDetections: [
      { vehicleNumber: "MH04EF9012", timestamp: "09:20:05", type: "Truck" },
      { vehicleNumber: "MH04GH3456", timestamp: "09:20:00", type: "Car" },
    ]
  },
  {
    id: 3,
    location: "Kalyan Circle",
    signalStatus: 'yellow',
    vehicleCount: 12,
    trafficDensity: 'low',
    imageUrl: trafficImages.kalyanCircle,
    recentDetections: [
      { vehicleNumber: "MH05IJ7890", timestamp: "09:19:55", type: "Bus" },
      { vehicleNumber: "MH05KL1234", timestamp: "09:19:50", type: "Car" },
    ]
  },
  {
    id: 4,
    location: "Andheri Metro",
    signalStatus: 'red',
    vehicleCount: 56,
    trafficDensity: 'high',
    imageUrl: trafficImages.andheriMetro,
    recentDetections: [
      { vehicleNumber: "MH03MN5678", timestamp: "09:19:45", type: "Car" },
      { vehicleNumber: "MH03OP9012", timestamp: "09:19:40", type: "Bike" },
    ]
  },
  {
    id: 5,
    location: "Dadar TT",
    signalStatus: 'green',
    vehicleCount: 34,
    trafficDensity: 'medium',
    imageUrl: trafficImages.dadarTT,
    recentDetections: [
      { vehicleNumber: "MH01QR3456", timestamp: "09:19:35", type: "Car" },
      { vehicleNumber: "MH01ST7890", timestamp: "09:19:30", type: "Truck" },
    ]
  },
  {
    id: 6,
    location: "Kurla Signal",
    signalStatus: 'red',
    vehicleCount: 67,
    trafficDensity: 'high',
    imageUrl: trafficImages.kurlaSignal,
    recentDetections: [
      { vehicleNumber: "MH06UV1234", timestamp: "09:19:25", type: "Bus" },
      { vehicleNumber: "MH06WX5678", timestamp: "09:19:20", type: "Car" },
    ]
  }
];

export const getCameraData = () => {
  return trafficCameras;
};

export const getCameraById = (id: number) => {
  return trafficCameras.find(camera => camera.id === id);
};

// Function to update vehicle detections (to be implemented with real data)
export const updateVehicleDetections = async (cameraId: number) => {
  // This would connect to a real vehicle detection system
  console.log(`Updating vehicle detections for camera ${cameraId}`);
};

// Function to update traffic density (to be implemented with real data)
export const updateTrafficDensity = async (cameraId: number) => {
  // This would connect to a real traffic monitoring system
  console.log(`Updating traffic density for camera ${cameraId}`);
};

export type { CameraData, VehicleDetection };