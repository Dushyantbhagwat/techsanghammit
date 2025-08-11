import { Card } from "@/components/ui/card";
import { getCameraData } from "@/services/camera";
import type { CameraData } from "@/services/camera";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export function CameraMonitoring() {
  const [cameras, setCameras] = useState<CameraData[]>([]);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const searchQuery = searchParams.get('search') || '';
    setCameras(getCameraData(searchQuery));
  }, [searchParams]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Live Camera Monitoring</h2>
      {cameras.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg text-muted-foreground">No cameras found matching your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cameras.map((camera: CameraData) => (
          <Card key={camera.id} className="overflow-hidden">
            <div className="relative">
              <img 
                src={camera.imageUrl}
                alt={`Traffic Camera ${camera.id}`}
                className="w-full h-[200px] object-cover"
                onError={(e) => {
                  console.error(`Failed to load image for camera ${camera.id}:`, camera.imageUrl);
                  // Fallback to a traffic intersection image if the camera feed fails
                  e.currentTarget.src = `https://source.unsplash.com/400x300/?traffic,intersection,signal&random=${camera.id}`;
                }}
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <span className={`px-2 py-1 rounded text-white text-xs font-medium
                  ${camera.trafficDensity === 'high' ? 'bg-red-500' : 
                    camera.trafficDensity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}>
                  {camera.trafficDensity.toUpperCase()}
                </span>
                <span className={`px-2 py-1 rounded text-white text-xs font-medium
                  ${camera.signalStatus === 'red' ? 'bg-red-500' : 
                    camera.signalStatus === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'}`}>
                  {camera.signalStatus.toUpperCase()}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium">{camera.location}</p>
                  <p className="text-xs bg-blue-500 px-2 py-1 rounded">
                    {camera.vehicleCount} vehicles
                  </p>
                </div>
                <div className="space-y-1">
                  {camera.recentDetections.map((detection, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="font-medium">{detection.vehicleNumber}</span>
                      <span className="text-gray-300">{detection.type}</span>
                      <span className="text-gray-300">{detection.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
        </div>
      )}
    </div>
  );
}