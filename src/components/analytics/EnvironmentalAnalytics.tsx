import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from "@nivo/bar";
import { fetchEnvironmentalData, type EnvironmentalData, getAqiCategory } from "@/services/aqi";
import { useCity } from "@/contexts/CityContext";
import { ArrowUpIcon, ArrowDownIcon, ArrowRightIcon } from "@heroicons/react/24/solid";

type TimeRange = 'daily' | 'weekly' | 'monthly' | 'yearly';

const timeRangeDescriptions = {
  daily: "24-hour pattern showing typical daily variations in air quality",
  weekly: "Recent 4-week trend showing day-to-day variations in air quality",
  monthly: "12-month view highlighting seasonal patterns in air quality",
  yearly: "5-year historical data showing long-term air quality improvements"
};

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
        fill: "#ffffff"
      }
    },
    legend: {
      text: {
        fill: "#ffffff",
        fontSize: 12,
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

const getAqiColor = (value: number) => {
  if (value <= 50) return '#00E396';
  if (value <= 100) return '#FEB019';
  if (value <= 150) return '#FF4560';
  if (value <= 200) return '#775DD0';
  if (value <= 300) return '#FF1010';
  return '#7A0000';
};

const TrendIndicator = ({ trend }: { trend: 'improving' | 'stable' | 'worsening' }) => {
  const config = {
    improving: { icon: ArrowDownIcon, color: 'text-green-500', text: 'Improving' },
    stable: { icon: ArrowRightIcon, color: 'text-blue-500', text: 'Stable' },
    worsening: { icon: ArrowUpIcon, color: 'text-red-500', text: 'Worsening' }
  }[trend];

  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-1 ${config.color}`}>
      <Icon className="h-4 w-4" />
      <span>{config.text}</span>
    </div>
  );
};

export function EnvironmentalAnalytics() {
  const [envData, setEnvData] = useState<EnvironmentalData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('daily');
  const { selectedCity } = useCity();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchEnvironmentalData(selectedCity);
        setEnvData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch environmental data');
        console.error('Error fetching environmental data:', err);
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
      <div className="flex items-center justify-center h-96">
        <div className="text-lg animate-pulse">Loading environmental data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 rounded-lg">
        <p className="text-red-500">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!envData) {
    return (
      <div className="p-6 bg-yellow-500/10 rounded-lg">
        <p className="text-yellow-500">No environmental data available</p>
      </div>
    );
  }

  const getTimeRangeData = () => {
    switch (selectedTimeRange) {
      case 'daily':
        return envData.timeRangeAverages.daily.map(d => ({
          period: d.hour,
          value: d.averageAqi
        }));
      case 'weekly':
        return envData.timeRangeAverages.weekly.map(d => ({
          period: d.week,
          value: d.averageAqi
        }));
      case 'monthly':
        return envData.timeRangeAverages.monthly.map(d => ({
          period: d.month,
          value: d.averageAqi
        }));
      case 'yearly':
        return envData.timeRangeAverages.yearly.map(d => ({
          period: d.year,
          value: d.averageAqi
        }));
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="text-lg font-semibold">Air Quality Index Trends</h3>
            <div className="flex gap-2">
              {(['daily', 'weekly', 'monthly', 'yearly'] as TimeRange[]).map(range => (
                <button
                  key={range}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedTimeRange === range
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setSelectedTimeRange(range)}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            {timeRangeDescriptions[selectedTimeRange]}
          </div>

          <div className="h-[400px]">
            <ResponsiveBar
              data={getTimeRangeData()}
              keys={['value']}
              indexBy="period"
              margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
              padding={0.3}
              colors={({ data }) => getAqiColor(data.value)}
              borderRadius={4}
              enableGridX={false}
              enableGridY={false}
              theme={chartTheme}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: selectedTimeRange === 'daily' ? -45 : -45,
                tickValues: selectedTimeRange === 'daily' ? 12 : undefined,
                legend: selectedTimeRange === 'daily' ? 'Hours' :
                       selectedTimeRange === 'weekly' ? 'Weeks' :
                       selectedTimeRange === 'monthly' ? 'Months' : 'Years',
                legendPosition: 'middle',
                legendOffset: 40
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Air Quality Index (AQI)',
                legendPosition: 'middle',
                legendOffset: -50
              }}
              tooltip={({ value, indexValue, color }) => (
                <div className="bg-gray-800 text-white p-2 border border-gray-700 rounded shadow-lg">
                  <strong>{indexValue}</strong>
                  <br />
                  <span style={{ color }}>AQI: {value}</span>
                </div>
              )}
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 relative">
          <h3 className="text-lg font-semibold mb-2">Current AQI</h3>
          <div className="text-3xl font-bold">{envData.current.aqi.value}</div>
          <div className="space-y-2">
            <div style={{ color: getAqiColor(envData.current.aqi.value) }}>
              {envData.current.aqi.category}
            </div>
            {envData.current.aqi.prediction && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <span>Predicted:</span>
                  <span style={{ color: getAqiColor(envData.current.aqi.prediction.predictedAQI) }}>
                    {envData.current.aqi.prediction.predictedAQI} AQI
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span>Confidence:</span>
                  <span className="text-blue-500">
                    {Math.round(envData.current.aqi.prediction.confidence * 100)}%
                  </span>
                </div>
                <TrendIndicator trend={envData.current.aqi.prediction.trend} />
              </div>
            )}
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Updated {new Date(envData.current.timestamp).toLocaleTimeString()}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Temperature</h3>
          <div className="text-3xl font-bold">{envData.current.temperature}°C</div>
          <div className="mt-2 text-green-500">Normal</div>
          <div className="mt-4 text-sm text-gray-500">Updated now</div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Humidity</h3>
          <div className="text-3xl font-bold">{envData.current.humidity.toFixed(2)}%</div>
          <div className="mt-2 text-green-500">Optimal</div>
          <div className="mt-4 text-sm text-gray-500">Updated now</div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">CO₂</h3>
          <div className="text-3xl font-bold">{envData.current.co2} ppm</div>
          <div className="mt-2 text-green-500">Normal</div>
          <div className="mt-4 text-sm text-gray-500">Updated now</div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">NO₂</h3>
          <div className="text-3xl font-bold">{envData.current.aqi.pollutants.no2 || 0} ppb</div>
          <div className="mt-2 text-blue-500">Nitrogen Dioxide</div>
          <div className="mt-4 text-sm text-gray-500">Updated now</div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">SO₂</h3>
          <div className="text-3xl font-bold">{envData.current.aqi.pollutants.so2 || 0} ppb</div>
          <div className="mt-2 text-yellow-500">Sulfur Dioxide</div>
          <div className="mt-4 text-sm text-gray-500">Updated now</div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">O₃</h3>
          <div className="text-3xl font-bold">{envData.current.aqi.pollutants.o3 || 0} ppb</div>
          <div className="mt-2 text-purple-500">Ozone</div>
          <div className="mt-4 text-sm text-gray-500">Updated now</div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Location-wise AQI Comparison</h3>
        <div className="h-[380px]">
          <ResponsiveBar
            data={envData.locationAverages.map(loc => ({
              location: loc.location.charAt(0).toUpperCase() + loc.location.slice(1),
              value: loc.averageAqi
            }))}
            keys={['value']}
            indexBy="location"
            margin={{ top: 25, right: 20, bottom: 55, left: 60 }}
            padding={0.3}
            colors={({ data }) => getAqiColor(data.value)}
            borderRadius={4}
            enableGridX={false}
            enableGridY={false}
            theme={chartTheme}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: -45,
              legend: 'Location',
              legendPosition: 'middle',
              legendOffset: 45
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Air Quality Index (AQI)',
              legendPosition: 'middle',
              legendOffset: -50
            }}
            tooltip={({ value, indexValue, color }) => (
              <div className="bg-gray-800 text-white p-2 border border-gray-700 rounded shadow-lg">
                <strong>{indexValue}</strong>
                <br />
                <span style={{ color }}>AQI: {value}</span>
              </div>
            )}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Temperature & Humidity Correlation</h3>
          <div className="h-[300px]">
            <ResponsiveLine
              data={[
                {
                  id: "temperature",
                  data: envData.hourly.map(h => ({
                    x: h.hour,
                    y: h.temperature
                  }))
                },
                {
                  id: "humidity",
                  data: envData.hourly.map(h => ({
                    x: h.hour,
                    y: h.humidity
                  }))
                }
              ]}
              margin={{ top: 50, right: 20, bottom: 50, left: 60 }}
              xScale={{ type: "point" }}
              yScale={{ type: "linear", min: "auto", max: "auto" }}
              theme={chartTheme}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: "Time (Hours)",
                legendPosition: "middle",
                legendOffset: 40
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "Temperature (°C) / Humidity (%)",
                legendPosition: "middle",
                legendOffset: -50
              }}
              pointSize={8}
              pointColor="#ffffff"
              pointBorderWidth={2}
              pointBorderColor={{ from: "serieColor" }}
              enableArea={false}
              enableGridX={false}
              enableGridY={false}
              colors={['#FF4560', '#00E396']}
              legends={[
                {
                  anchor: "top",
                  direction: "row",
                  justify: false,
                  translateY: -40,
                  itemWidth: 100,
                  itemHeight: 20,
                  symbolSize: 10,
                  symbolShape: "circle",
                  itemTextColor: "#ffffff"
                }
              ]}
            />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">CO₂ Levels</h3>
          <div className="h-[300px]">
            <ResponsiveLine
              data={[
                {
                  id: "co2",
                  data: envData.hourly.map(h => ({
                    x: h.hour,
                    y: h.co2
                  }))
                }
              ]}
              margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
              xScale={{ type: "point" }}
              yScale={{ type: "linear", min: "auto", max: "auto" }}
              theme={chartTheme}
              curve="cardinal"
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: "Time (Hours)",
                legendPosition: "middle",
                legendOffset: 40
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "CO₂ Level (PPM)",
                legendPosition: "middle",
                legendOffset: -50
              }}
              enablePoints={true}
              pointSize={8}
              pointColor="#ffffff"
              pointBorderWidth={2}
              pointBorderColor="#6C5DD3"
              enableArea={true}
              areaOpacity={0.1}
              colors={["#6C5DD3"]}
              enableGridX={false}
              enableGridY={false}
            />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Air Pollutants</h3>
          <div className="h-[300px]">
            <ResponsiveLine
              data={[
                {
                  id: "NO₂",
                  data: envData.hourly.map(h => ({
                    x: h.hour,
                    y: h.aqi.pollutants?.no2 || 0
                  }))
                },
                {
                  id: "SO₂",
                  data: envData.hourly.map(h => ({
                    x: h.hour,
                    y: h.aqi.pollutants?.so2 || 0
                  }))
                },
                {
                  id: "O₃",
                  data: envData.hourly.map(h => ({
                    x: h.hour,
                    y: h.aqi.pollutants?.o3 || 0
                  }))
                }
              ]}
              margin={{ top: 50, right: 20, bottom: 50, left: 60 }}
              xScale={{ type: "point" }}
              yScale={{ type: "linear", min: "auto", max: "auto" }}
              theme={chartTheme}
              curve="cardinal"
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: "Time (Hours)",
                legendPosition: "middle",
                legendOffset: 40
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "Pollutant Level (PPB)",
                legendPosition: "middle",
                legendOffset: -50
              }}
              enablePoints={true}
              pointSize={6}
              pointColor="#ffffff"
              pointBorderWidth={2}
              pointBorderColor={{ from: 'color' }}
              enableArea={false}
              colors={['#4299E1', '#ECC94B', '#9F7AEA']}
              enableGridX={false}
              enableGridY={false}
              legends={[
                {
                  anchor: "top",
                  direction: "row",
                  justify: false,
                  translateY: -40,
                  itemWidth: 100,
                  itemHeight: 20,
                  symbolSize: 10,
                  symbolShape: "circle",
                  itemTextColor: "#ffffff"
                }
              ]}
            />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Environmental Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Air Quality Analysis</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Primary Pollutant</span>
                <span className="font-medium">
                  {envData.current.aqi.pollutants.pm25 ? 'PM2.5' : 
                   envData.current.aqi.pollutants.no2 ? 'NO2' : 
                   envData.current.aqi.pollutants.so2 ? 'SO2' : 'O3'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Daily Average</span>
                <span className="font-medium">{envData.current.aqi.value} AQI</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Peak Hours</span>
                <span className="font-medium">
                  {envData.timeRangeAverages.daily.reduce((max, current) => 
                    current.averageAqi > max.averageAqi ? current : max
                  ).hour}
                </span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-3">Recommendations</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Optimal ventilation hours: 6 AM - 9 AM</li>
              <li>Plan activities based on current AQI levels</li>
              <li>Use air purifiers when needed</li>
              <li>Check AQI before outdoor activities</li>
              <li>Monitor humidity levels in enclosed spaces</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}