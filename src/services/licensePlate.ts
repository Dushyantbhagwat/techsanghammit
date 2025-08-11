interface PlateDetection {
  plateNumber: string;
  confidence: number;
  timestamp: string;
  vehicleType: string;
  location: { x: number; y: number; width: number; height: number };
}

// Simulated AI model for license plate detection
const detectLicensePlates = async (frameData: ImageData): Promise<PlateDetection[]> => {
  // In a real implementation, this would use a machine learning model
  // For demo purposes, we'll generate realistic-looking detections
  const generateRandomPlate = () => {
    const regions = ['MH', 'KA', 'DL', 'TN', 'GJ'];
    const numbers = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    const letters = String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
                   String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const lastNumbers = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${regions[Math.floor(Math.random() * regions.length)]}${numbers}${letters}${lastNumbers}`;
  };

  const vehicleTypes = ['Car', 'Bike', 'Truck', 'Bus'];
  const numDetections = Math.floor(Math.random() * 3) + 1; // 1-3 detections per frame

  return Array.from({ length: numDetections }, () => ({
    plateNumber: generateRandomPlate(),
    confidence: 0.85 + Math.random() * 0.14, // 85-99% confidence
    timestamp: new Date().toISOString(),
    vehicleType: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
    location: {
      x: Math.floor(Math.random() * (frameData.width - 100)),
      y: Math.floor(Math.random() * (frameData.height - 50)),
      width: 100,
      height: 50
    }
  }));
};

// Process video frame for license plate detection
const processVideoFrame = async (videoElement: HTMLVideoElement): Promise<PlateDetection[]> => {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  ctx.drawImage(videoElement, 0, 0);
  const frameData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  return detectLicensePlates(frameData);
};

export { processVideoFrame, type PlateDetection };