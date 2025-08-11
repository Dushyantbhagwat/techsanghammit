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
    <div className="p-3 sm:p-4">
      <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Live Camera Monitoring</h2>
      {cameras.length === 0 ? (
        <div className="text-center py-6 sm:py-8">
          <p className="text-base sm:text-lg text-muted-foreground">No cameras found matching your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Camera Feeds */}
          {cameras.map((camera: CameraData) => (
            <Card key={camera.id} className="overflow-hidden">
              <div className="relative">
                {camera.location === "Dadar TT" ? (
                  <iframe
                    src="https://www.youtube.com/embed/ByED80IKdIU?autoplay=1&mute=1"
                    className="w-full h-[180px] sm:h-[200px]"
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
                     className={`w-full h-[180px] sm:h-[200px] object-cover ${camera.id % 2 === 0 ? 'night-vision' : ''}`}
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
                <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 flex gap-1 sm:gap-2">
                  <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-white text-[10px] sm:text-xs font-medium
                    ${camera.trafficDensity === 'high' ? 'bg-red-500' :
                      camera.trafficDensity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}>
                    {camera.trafficDensity.toUpperCase()}
                  </span>
                  <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-white text-[10px] sm:text-xs font-medium
                    ${camera.signalStatus === 'red' ? 'bg-red-500' :
                      camera.signalStatus === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'}`}>
                    {camera.signalStatus.toUpperCase()}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-1.5 sm:p-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 mb-1">
                    <p className="text-xs sm:text-sm font-medium">
                      {camera.location}
                      {camera.id % 2 === 0 ? ' (Night Vision)' : ''}
                    </p>
                    <p className="text-[10px] sm:text-xs bg-blue-500 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded w-fit">
                      {camera.vehicleCount} vehicles
                    </p>
                  </div>
                  {camera.isOffline ? (
                    <div className="text-center py-1 sm:py-2">
                      <p className="text-yellow-400 text-xs sm:text-sm">{camera.offlineMessage}</p>
                    </div>
                  ) : (
                    <div className="space-y-0.5 sm:space-y-1">
                      {(camera.location === "Dadar TT" ? camera.recentDetections : plateDetections[camera.id] || [])
                        .slice(0, 3)
                        .map((detection: any, idx) => (
                          <div key={idx} className="flex justify-between text-[10px] sm:text-xs">
                            <span className="font-medium">
                              {detection.plateNumber || detection.vehicleNumber}
                              {detection.confidence && ` (${Math.round(detection.confidence * 100)}%)`}
                            </span>
                            <span className="text-gray-300 hidden sm:inline">{detection.vehicleType || detection.type}</span>
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