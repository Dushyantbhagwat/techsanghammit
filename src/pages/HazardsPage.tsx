import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { fetchDriveImages, type DriveImage } from "@/services/googleDrive";
import { useCity } from "@/contexts/CityContext";

interface HazardImage {
  id: string;
  imageUrl: string;
  location: string;
  timestamp: string;
  description: string;
  status: 'pending' | 'resolved' | 'investigating';
}

const getStatusColor = (status: HazardImage['status']) => {
  switch (status) {
    case 'pending':
      return 'text-amber-500 bg-amber-500/10';
    case 'investigating':
      return 'text-blue-500 bg-blue-500/10';
    case 'resolved':
      return 'text-green-500 bg-green-500/10';
    default:
      return 'text-gray-500 bg-gray-500/10';
  }
};

const generateHazardFromDriveImage = (image: DriveImage): HazardImage => {
  // Set location based on city
  const location = image.city === 'pune' ? 'PVG COET College' : image.name;
  
  return {
    id: image.id,
    imageUrl: image.imageUrl,
    location: location,
    timestamp: image.createdTime,
    description: image.name,
    status: 'pending' // Default status for new hazards
  };
};

const DriveImagePreview = ({ src, alt }: { src: string; alt: string }) => {
  const [loading, setLoading] = useState(true);

  // Convert the URL to an embed URL
  const embedUrl = src.replace('/view', '/preview');

  return (
    <div className="aspect-video bg-gray-800 relative overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      <iframe
        src={embedUrl}
        title={alt}
        className="absolute inset-0 w-full h-full"
        frameBorder="0"
        allowFullScreen
        onLoad={() => setLoading(false)}
      />
    </div>
  );
};

export function HazardsPage() {
  const { selectedCity } = useCity();
  const [hazards, setHazards] = useState<HazardImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadImages = async () => {
      try {
        setLoading(true);
        const driveImages = await fetchDriveImages(selectedCity);
        const hazardImages = driveImages.map(generateHazardFromDriveImage);
        setHazards(hazardImages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load hazard images');
        console.error('Error loading hazard images:', err);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, [selectedCity]); // Reload when selected city changes

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 rounded-lg text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (hazards.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-400 mb-4">No hazards reported in {selectedCity}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Hazard Reports</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Report New Hazard
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hazards.map(hazard => (
          <Card key={hazard.id} className="overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50">
            <DriveImagePreview 
              src={hazard.imageUrl} 
              alt={hazard.description}
            />
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold truncate">{hazard.location}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(hazard.status)}`}>
                  {hazard.status.charAt(0).toUpperCase() + hazard.status.slice(1)}
                </span>
              </div>
              <p className="text-sm text-gray-400">{hazard.description}</p>
              <div className="text-xs text-gray-500">
                Reported: {new Date(hazard.timestamp).toLocaleString()}
              </div>
              <div className="pt-3 flex gap-2">
                <button 
                  onClick={() => window.open(hazard.imageUrl, '_blank')}
                  className="flex-1 px-3 py-1.5 bg-blue-600/10 text-blue-500 rounded hover:bg-blue-600/20 transition-colors text-sm"
                >
                  View Full Image
                </button>
                {hazard.status !== 'resolved' && (
                  <button className="flex-1 px-3 py-1.5 bg-green-600/10 text-green-500 rounded hover:bg-green-600/20 transition-colors text-sm">
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <h2 className="text-xl font-semibold mb-4">Hazard Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="text-2xl font-bold">{hazards.length}</div>
              <div className="text-sm text-gray-400">Total Reports</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-amber-500">
                {hazards.filter(h => h.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-400">Pending Review</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-500">
                {hazards.filter(h => h.status === 'resolved').length}
              </div>
              <div className="text-sm text-gray-400">Resolved</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}