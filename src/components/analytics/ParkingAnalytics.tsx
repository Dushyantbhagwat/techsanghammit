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
    if (rate <= 50) return {
      text: "Low Occupancy",
      color: "text-green-500",
      bgColor: "bg-gradient-to-br from-green-500/10 to-green-600/5",
      borderColor: "border-green-500",
      indicator: "low"
    };
    if (rate <= 80) return {
      text: "Moderate",
      color: "text-amber-500",
      bgColor: "bg-gradient-to-br from-amber-500/10 to-amber-600/5",
      borderColor: "border-amber-500",
      indicator: "moderate"
    };
    return {
      text: "High Occupancy",
      color: "text-red-500",
      bgColor: "bg-gradient-to-br from-red-500/10 to-red-600/5",
      borderColor: "border-red-500",
      indicator: "high"
    };
  };

  const currentStatus = getOccupancyStatus(parkingData.current.occupancyRate);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="parking-status-card p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <h3 className="text-lg font-semibold mb-2">Total Spaces</h3>
          <div className="text-3xl font-bold">{parkingData.current.totalSpaces.toLocaleString()}</div>
          <div className="mt-2 text-blue-500">Infrastructure Coverage</div>
          <div className="mt-4 text-sm text-gray-400">
            Last updated: {new Date(parkingData.current.timestamp).toLocaleTimeString()}
          </div>
        </Card>

        <Card className={`parking-status-card p-6 ${currentStatus.bgColor}`}>
          <div className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${currentStatus.color.replace('text', 'bg')}`} aria-hidden="true"></span>
            <h3 className="text-lg font-semibold">Occupied Spaces</h3>
          </div>
          <div className="text-3xl font-bold mt-2">{parkingData.current.occupiedSpaces.toLocaleString()}</div>
          <div className={`mt-2 ${currentStatus.color} font-medium`}>
            {currentStatus.text} • {((parkingData.current.occupiedSpaces / parkingData.current.totalSpaces) * 100).toFixed(1)}% of capacity
          </div>
          <div className="mt-4 text-sm text-gray-400">Real-time monitoring</div>
        </Card>

        <Card className={`parking-status-card p-6 ${currentStatus.bgColor}`}>
          <div className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${currentStatus.color.replace('text', 'bg')}`} aria-hidden="true"></span>
            <h3 className="text-lg font-semibold">Available Spaces</h3>
          </div>
          <div className="text-3xl font-bold mt-2">
            {(parkingData.current.totalSpaces - parkingData.current.occupiedSpaces).toLocaleString()}
          </div>
          <div className={`mt-2 ${currentStatus.color} font-medium`}>
            Immediate availability
          </div>
          <div className="mt-4 text-sm text-gray-400">Updated live</div>
        </Card>
      </div>

      <Card className="parking-status-card p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
        <h3 className="text-lg font-semibold mb-4">Location-wise Availability</h3>
        <div className="space-y-4">
          {parkingData.locations.map(loc => {
            const status = getOccupancyStatus(loc.occupancyRate);
            const availableSpaces = loc.totalSpaces - loc.occupiedSpaces;
            return (
              <div
                key={loc.name}
                className={`p-4 rounded-lg ${status.bgColor}`}
                role="region"
                aria-label={`Parking status for ${loc.name}`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className={`h-3 w-3 rounded-full ${status.color.replace('text', 'bg')}`} aria-hidden="true"></span>
                    <div>
                      <h4 className="font-medium">{loc.name}</h4>
                      <p className={`${status.color} text-sm font-medium`}>
                        {status.text} • {availableSpaces.toLocaleString()} available
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{loc.occupancyRate}%</div>
                    <div className="text-sm text-gray-400">occupancy</div>
                  </div>
                </div>
                <div className="mt-3 h-2 bg-gray-700/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${status.color.replace('text', 'bg')}`}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="parking-status-card p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <h3 className="text-lg font-semibold mb-4">Parking Analytics</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3 text-blue-400">Occupancy Overview</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Average Occupancy Rate</span>
                  <span className="font-semibold">
                    {(parkingData.locations.reduce((acc, loc) => acc + loc.occupancyRate, 0) / parkingData.locations.length).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Available Spaces</span>
                  <span className="font-semibold text-green-500">
                    {parkingData.locations.reduce((acc, loc) => acc + (loc.totalSpaces - loc.occupiedSpaces), 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Locations at Capacity</span>
                  <span className="font-semibold text-red-500">
                    {parkingData.locations.filter(loc => loc.occupancyRate >= 90).length}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3 text-amber-400">Peak Hours Analysis</h4>
              <div className="space-y-2">
                <div className="p-2 bg-gradient-to-r from-amber-500/10 to-amber-600/5 rounded">
                  <span className="text-amber-500">Morning Peak: 8 AM - 11 AM</span>
                </div>
                <div className="p-2 bg-gradient-to-r from-red-500/10 to-red-600/5 rounded">
                  <span className="text-red-500">Evening Peak: 5 PM - 8 PM</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="parking-status-card p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <h3 className="text-lg font-semibold mb-4">Smart Recommendations</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3 text-green-400">Best Parking Options</h4>
              <div className="space-y-2">
                {parkingData.locations
                  .filter(loc => loc.occupancyRate <= 60)
                  .map(loc => (
                    <div key={loc.name} className="p-2 bg-gradient-to-r from-green-500/10 to-green-600/5 rounded">
                      <span className="text-green-500">
                        {loc.name}: {(loc.totalSpaces - loc.occupiedSpaces).toLocaleString()} spaces available
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3 text-blue-400">System Updates</h4>
              <div className="space-y-2">
                <div className="p-2 bg-gradient-to-r from-blue-500/10 to-blue-600/5 rounded">
                  <span className="text-blue-500">Real-time data updates every 5 minutes</span>
                </div>
                <div className="p-2 bg-gradient-to-r from-purple-500/10 to-purple-600/5 rounded">
                  <span className="text-purple-500">AI-powered occupancy predictions</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}