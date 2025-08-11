import { Card } from "@/components/ui/card";
import { getCameraData } from "@/services/camera";
import type { CameraData } from "@/services/camera";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import trafficVideo from "@/assets/traffic-cameras/trafficvid.mp4";
import { processVideoFrame, type PlateDetection } from "@/services/licensePlate";
export function CameraMonitoring() {
  const [cameras, setCameras] = useState<CameraData[]>([]);
  const [searchParams] = useSearchParams();
  const [plateDetections, setPlateDetections] = useState<Record<number, PlateDetection[]>>({});
  const videoRefs = useRef<Record<number, HTMLVideoElement>>({});

  // Process video frames for license plate detection
  useEffect(() => {
    const processInterval = setInterval(async () => {
      for (const camera of cameras) {
        const videoElement = videoRefs.current[camera.id];
        if (videoElement && videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
          try {
            const detections = await processVideoFrame(videoElement);
            setPlateDetections(prev => ({
              ...prev,
              [camera.id]: detections
            }));
          } catch (error) {
            console.error(`Error processing video frame for camera ${camera.id}:`, error);
          }
        }
      }
    }, 2000); // Process frames every 2 seconds

    return () => clearInterval(processInterval);
  }, [cameras]);


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
          {/* Camera Feeds */}
          {cameras.map((camera: CameraData) => (
            <Card key={camera.id} className="overflow-hidden">
              <div className="relative">
                {camera.location === "Dadar TT" ? (
                  <iframe
                    src="https://www.youtube.com/embed/ByED80IKdIU?autoplay=1&mute=1"
                    className="w-full h-[200px]"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="relative">
                    <video
                     ref={el => el && (videoRefs.current[camera.id] = el)}
                     src={trafficVideo}
                     autoPlay
                     loop
                     muted
                     playsInline
                     className={`w-full h-[200px] object-cover ${camera.id % 2 === 0 ? 'night-vision' : ''}`}
                     style={camera.id % 2 === 0 ? {
                       filter: "brightness(130%) contrast(150%) hue-rotate(100deg) saturate(80%)",
                     } : undefined}
                    />
                    {plateDetections[camera.id]?.map((detection, idx) => (
                      <div
                        key={idx}
                        className="absolute border-2 border-[#FF4560]"
                        style={{
                          left: `${(detection.location.x / 900) * 100}%`,
                          top: `${(detection.location.y / 600) * 100}%`,
                          width: `${(detection.location.width / 900) * 100}%`,
                          height: `${(detection.location.height / 600) * 100}%`,
                        }}
                      >
                        <div className="absolute -top-6 left-0 bg-[#FF4560] text-white text-xs px-2 py-1 rounded">
                          {detection.plateNumber} ({Math.round(detection.confidence * 100)}%)
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                    <p className="text-sm font-medium">
                      {camera.location}
                      {camera.id % 2 === 0 ? ' (Night Vision)' : ''}
                    </p>
                    <p className="text-xs bg-blue-500 px-2 py-1 rounded">
                      {camera.vehicleCount} vehicles
                    </p>
                  </div>
                  {camera.isOffline ? (
                    <div className="text-center py-2">
                      <p className="text-yellow-400 text-sm">{camera.offlineMessage}</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {(camera.location === "Dadar TT" ? camera.recentDetections : plateDetections[camera.id] || [])
                        .slice(0, 3)
                        .map((detection: any, idx) => (
                          <div key={idx} className="flex justify-between text-xs">
                            <span className="font-medium">
                              {detection.plateNumber || detection.vehicleNumber}
                              {detection.confidence && ` (${Math.round(detection.confidence * 100)}%)`}
                            </span>
                            <span className="text-gray-300">{detection.vehicleType || detection.type}</span>
                            <span className="text-gray-300">
                              {new Date(detection.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}