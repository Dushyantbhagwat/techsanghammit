import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from "@nivo/bar";
import { useCity } from "@/contexts/CityContext";
import { fetchParkingData, type LocationParkingData } from "@/services/parking";

const chartTheme = {
  textColor: "#ffffff",
  axis: {
    domain: {
      line: {
        stroke: "#ffffff"
      }
    },
    ticks: {
      line: {
        stroke: "#ffffff"
      },
      text: {
        fill: "#ffffff",
        fontSize: 12,
        fontWeight: 600
      }
    },
    legend: {
      text: {
        fill: "#ffffff",
        fontSize: 14,
        fontWeight: 600
      }
    }
  },
  grid: {
    line: {
      stroke: "#ffffff",
      strokeOpacity: 0.1
    }
  },
  legends: {
    text: {
      fill: "#ffffff",
      fontSize: 12
    }
  }
};

export function ParkingAnalytics() {
  const [parkingData, setParkingData] = useState<LocationParkingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedCity } = useCity();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
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
    return <div>Loading parking data...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!parkingData) {
    return <div>No parking data available</div>;
  }

  const getOccupancyStatus = (rate: number) => {
    if (rate <= 50) return { text: "Low Occupancy", color: "text-green-500" };
    if (rate <= 80) return { text: "Moderate", color: "text-amber-500" };
    return { text: "High Occupancy", color: "text-red-500" };
  };

  const currentStatus = getOccupancyStatus(parkingData.current.occupancyRate);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Spaces</h3>
          <div className="text-3xl font-bold">{parkingData.current.totalSpaces}</div>
          <div className="mt-2 text-blue-500">Available</div>
          <div className="mt-4 text-sm text-gray-500">
            Updated {new Date(parkingData.current.timestamp).toLocaleTimeString()}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Occupied Spaces</h3>
          <div className="text-3xl font-bold">{parkingData.current.occupiedSpaces}</div>
          <div className={`mt-2 ${currentStatus.color}`}>{currentStatus.text}</div>
          <div className="mt-4 text-sm text-gray-500">Updated now</div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Occupancy Rate</h3>
          <div className="text-3xl font-bold">{parkingData.current.occupancyRate}%</div>
          <div className={`mt-2 ${currentStatus.color}`}>{currentStatus.text}</div>
          <div className="mt-4 text-sm text-gray-500">Updated now</div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Hourly Occupancy Trend</h3>
        <div className="h-[300px]">
          <ResponsiveLine
            data={[
              {
                id: "occupancy",
                data: parkingData.hourly.map(h => ({
                  x: h.hour,
                  y: h.occupancyRate
                }))
              }
            ]}
            margin={{ top: 20, right: 20, bottom: 90, left: 60 }}
            xScale={{ type: "point" }}
            yScale={{ type: "linear", min: 0, max: 100 }}
            curve="cardinal"
            axisBottom={{
              tickSize: 5,
              tickPadding: 20,
              tickRotation: -45,
              legend: "Hour",
              legendOffset: 70,
              legendPosition: "middle"
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Occupancy Rate (%)",
              legendOffset: -40,
              legendPosition: "middle"
            }}
            enablePoints={true}
            pointSize={8}
            pointColor="#ffffff"
            pointBorderWidth={2}
            pointBorderColor="#00E396"
            enableArea={true}
            areaOpacity={0.1}
            colors={["#00E396"]}
            enableGridX={false}
            enableGridY={false}
            theme={chartTheme}
            enableSlices="x"
            sliceTooltip={({ slice }) => (
              <div style={{ background: 'white', padding: '9px 12px', border: '1px solid #ccc' }}>
                {slice.points.map(point => (
                  <div key={point.id}>
                    <strong>Hour: </strong>{String(point.data.x)}<br />
                    <strong>Occupancy: </strong>{String(point.data.y)}%
                  </div>
                ))}
              </div>
            )}
          />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Location-wise Occupancy</h3>
        <div className="h-[300px]">
          <ResponsiveBar
            data={parkingData.locations}
            keys={['occupancyRate']}
            indexBy="name"
            margin={{ top: 20, right: 20, bottom: 90, left: 60 }}
            padding={0.3}
            valueScale={{ type: 'linear' }}
            colors={({ data }) => {
              const rate = data.occupancyRate as number;
              if (rate <= 50) return '#00E396';
              if (rate <= 80) return '#FEB019';
              return '#FF4560';
            }}
            borderRadius={4}
            axisBottom={{
              tickSize: 5,
              tickPadding: 20,
              tickRotation: -45,
              legend: "Location Name",
              legendOffset: 70,
              legendPosition: "middle"
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Occupancy Rate (%)',
              legendPosition: 'middle',
              legendOffset: -40
            }}
            enableGridX={false}
            enableGridY={false}
            theme={chartTheme}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor="#ffffff"
            label={d => `${d.value}%`}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Space Utilization</h3>
          <div className="h-[300px]">
            <ResponsiveBar
              data={parkingData.locations.map(loc => ({
                name: loc.name,
                occupied: loc.occupiedSpaces,
                available: loc.totalSpaces - loc.occupiedSpaces
              }))}
              keys={['occupied', 'available']}
              indexBy="name"
              margin={{ top: 20, right: 20, bottom: 110, left: 60 }}
              padding={0.3}
              groupMode="stacked"
              colors={['#FF4560', '#00E396']}
              borderRadius={4}
              axisBottom={{
                tickSize: 5,
                tickPadding: 15,
                tickRotation: -45,
                legend: "Location Name",
                legendOffset: 90,
                legendPosition: "middle"
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Number of Spaces',
                legendPosition: 'middle',
                legendOffset: -40
              }}
              enableGridX={false}
              enableGridY={false}
              theme={chartTheme}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor="#ffffff"
              legends={[
                {
                  dataFrom: 'keys',
                  anchor: 'top-right',
                  direction: 'row',
                  justify: false,
                  translateY: 10,
                  translateX: -10,
                  itemWidth: 100,
                  itemHeight: 20,
                  itemDirection: 'left-to-right',
                  symbolSize: 10,
                  itemTextColor: "#ffffff"
                }
              ]}
            />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Parking Insights</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Current Status</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {parkingData.locations.map(loc => {
                  const status = getOccupancyStatus(loc.occupancyRate);
                  return (
                    <li key={loc.name} className={status.color}>
                      {status.text} at {loc.name} ({loc.occupancyRate}% full)
                    </li>
                  );
                })}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Recommendations</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {parkingData.locations
                  .filter(loc => loc.occupancyRate <= 60)
                  .map(loc => (
                    <li key={loc.name} className="text-green-500">
                      Good availability at {loc.name} ({loc.totalSpaces - loc.occupiedSpaces} spaces)
                    </li>
                  ))}
                <li className="text-amber-500">Peak hours expected between 5 PM - 8 PM</li>
                <li className="text-blue-500">Check real-time updates before arrival</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}