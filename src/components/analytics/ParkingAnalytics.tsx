import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from "@nivo/bar";
import { useCity } from "@/contexts/CityContext";
import { fetchParkingData, type LocationParkingData } from "@/services/parking";

const chartTheme = {
  textColor: "#ffffff",
  axis: {
    domain: { line: { stroke: "#ffffff" } },
    ticks: {
      line: { stroke: "#ffffff" },
      text: { fill: "#ffffff", fontSize: 12, fontWeight: 600 }
    },
    legend: {
      text: { fill: "#ffffff", fontSize: 14, fontWeight: 600 }
    }
  },
  grid: {
    line: { stroke: "#ffffff", strokeOpacity: 0.1 }
  },
  legends: {
    text: { fill: "#ffffff", fontSize: 12 }
  }
};

export function ParkingAnalytics() {
  const [parkingData, setParkingData] = useState<LocationParkingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedCity } = useCity();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!selectedCity) {
          setError("Please select a city to view parking data");
          return;
        }

        const data = await fetchParkingData(selectedCity);
        setParkingData(Array.isArray(data) ? data[0] : data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch parking data');
        console.error('Error fetching parking data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, [selectedCity]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" role="status" aria-label="Loading parking data">
        <div className="space-y-6 w-full max-w-3xl">
          {[1, 2, 3].map((i) => (
            <div key={i} className="parking-status-card animate-shimmer bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4" role="alert">
          <div className="text-red-500 text-xl font-medium">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            aria-label="Retry loading parking data"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!parkingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center text-gray-500" role="alert">
          No parking data available for {selectedCity}
        </div>
      </div>
    );
  }

  const getOccupancyStatus = (rate: number) => {
    if (rate <= 50) return { text: "Low Occupancy", color: "text-green-500", bgColor: "bg-green-100", indicator: "low" };
    if (rate <= 80) return { text: "Moderate", color: "text-amber-500", bgColor: "bg-amber-100", indicator: "moderate" };
    return { text: "High Occupancy", color: "text-red-500", bgColor: "bg-red-100", indicator: "high" };
  };

  const currentStatus = getOccupancyStatus(parkingData.current.occupancyRate);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={`parking-status-card p-6 border-l-4 border-blue-500 ${currentStatus.bgColor}`}>
          <h3 className="text-lg font-semibold mb-2">Total Spaces</h3>
          <div className="text-3xl font-bold">{parkingData.current.totalSpaces.toLocaleString()}</div>
          <div className="mt-2 text-blue-500">Available in {selectedCity}</div>
          <div className="mt-4 text-sm text-gray-500">
            Updated {new Date(parkingData.current.timestamp).toLocaleTimeString()}
          </div>
        </Card>

        <Card className={`parking-status-card p-6 border-l-4 ${currentStatus.color.replace('text', 'border')} ${currentStatus.bgColor}`}>
          <div className="flex items-center">
            <span className={`status-indicator ${currentStatus.indicator}`} aria-hidden="true"></span>
            <h3 className="text-lg font-semibold mb-2">Occupied Spaces</h3>
          </div>
          <div className="text-3xl font-bold">{parkingData.current.occupiedSpaces.toLocaleString()}</div>
          <div className={`mt-2 ${currentStatus.color} font-medium`}>{currentStatus.text}</div>
          <div className="mt-4 text-sm text-gray-500">Live Update</div>
        </Card>

        <Card className={`parking-status-card p-6 border-l-4 ${currentStatus.color.replace('text', 'border')} ${currentStatus.bgColor}`}>
          <div className="flex items-center">
            <span className={`status-indicator ${currentStatus.indicator}`} aria-hidden="true"></span>
            <h3 className="text-lg font-semibold mb-2">Occupancy Rate</h3>
          </div>
          <div className="text-3xl font-bold">{parkingData.current.occupancyRate}%</div>
          <div className={`mt-2 ${currentStatus.color} font-medium`}>{currentStatus.text}</div>
          <div className="mt-4 text-sm text-gray-500">Live Update</div>
        </Card>
      </div>

      <Card className="parking-status-card p-6">
        <h3 className="text-lg font-semibold mb-4">Location-wise Availability</h3>
        <div className="space-y-4">
          {parkingData.locations.map(loc => {
            const status = getOccupancyStatus(loc.occupancyRate);
            const availableSpaces = loc.totalSpaces - loc.occupiedSpaces;
            return (
              <div 
                key={loc.name} 
                className={`p-4 rounded-lg ${status.bgColor} border-l-4 ${status.color.replace('text', 'border')}`}
                role="region"
                aria-label={`Parking status for ${loc.name}`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className={`status-indicator ${status.indicator}`} aria-hidden="true"></span>
                    <div>
                      <h4 className="font-medium">{loc.name}</h4>
                      <p className={`${status.color} text-sm font-medium`}>
                        {status.text} • {availableSpaces.toLocaleString()} spots available
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{loc.occupancyRate}%</div>
                    <div className="text-sm text-gray-500">occupied</div>
                  </div>
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`parking-progress-bar h-full ${status.color.replace('text', 'bg')}`}
                    style={{ width: `${loc.occupancyRate}%` }}
                    role="progressbar"
                    aria-valuenow={loc.occupancyRate}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="parking-status-card p-6">
        <h3 className="text-lg font-semibold mb-4">Parking Insights</h3>
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-3">Current Status</h4>
            <div className="space-y-2">
              {parkingData.locations.map(loc => {
                const status = getOccupancyStatus(loc.occupancyRate);
                const availableSpaces = loc.totalSpaces - loc.occupiedSpaces;
                return (
                  <div 
                    key={loc.name}
                    className={`p-2 rounded ${status.bgColor} flex items-center`}
                  >
                    <span className={`status-indicator ${status.indicator}`} aria-hidden="true"></span>
                    <span className="font-medium flex-1">{loc.name}</span>
                    <span className={status.color}>
                      {availableSpaces.toLocaleString()} spots free
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Smart Recommendations</h4>
            <div className="space-y-2">
              {parkingData.locations
                .filter(loc => loc.occupancyRate <= 60)
                .map(loc => (
                  <div key={loc.name} className="p-2 bg-green-100 rounded flex items-center">
                    <span className="status-indicator low" aria-hidden="true"></span>
                    <span className="text-green-600">
                      Best availability at {loc.name} ({(loc.totalSpaces - loc.occupiedSpaces).toLocaleString()} spaces)
                    </span>
                  </div>
                ))}
              <div className="p-2 bg-amber-100 rounded flex items-center">
                <span className="status-indicator moderate" aria-hidden="true"></span>
                <span className="text-amber-600">
                  Peak hours expected between 5 PM - 8 PM
                </span>
              </div>
              <div className="p-2 bg-blue-100 rounded flex items-center">
                <span className="status-indicator" style={{ backgroundColor: '#3B82F6' }} aria-hidden="true"></span>
                <span className="text-blue-600">
                  Data updates every 5 minutes
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}