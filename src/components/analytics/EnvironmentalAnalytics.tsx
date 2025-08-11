import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from "@nivo/bar";
import { fetchEnvironmentalData, type EnvironmentalData } from "@/services/aqi";
import { useCity } from "@/contexts/CityContext";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  ClockIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from "@heroicons/react/24/solid";

type TimeRange = 'daily' | 'weekly' | 'monthly' | 'yearly';

const timeRangeDescriptions = {
  daily: "24-hour pattern showing typical daily variations in air quality",
  weekly: "Recent 4-week trend showing day-to-day variations in air quality",
  monthly: "12-month view highlighting seasonal patterns in air quality",
  yearly: "5-year historical data showing long-term air quality improvements"
};

const chartTheme = {
  textColor: "#ffffff",
  fontSize: 12,
  fontFamily: "Inter, system-ui, sans-serif",
  axis: {
    domain: {
      line: {
        stroke: "#ffffff",
        strokeWidth: 1
      }
    },
    ticks: {
      line: {
        stroke: "#ffffff",
        strokeWidth: 1
      },
      text: {
        fill: "#ffffff",
        fontSize: 11,
        fontWeight: 500,
        fontFamily: "Inter, system-ui, sans-serif"
      }
    },
    legend: {
      text: {
        fill: "#ffffff",
        fontSize: 13,
        fontWeight: 600,
        fontFamily: "Inter, system-ui, sans-serif"
      }
    }
  },
  grid: {
    line: {
      stroke: "#ffffff",
      strokeOpacity: 0.08,
      strokeWidth: 1
    }
  },
  legends: {
    text: {
      fill: "#ffffff",
      fontSize: 12,
      fontWeight: 500,
      fontFamily: "Inter, system-ui, sans-serif"
    }
  },
  tooltip: {
    container: {
      background: "rgba(17, 24, 39, 0.95)",
      color: "#ffffff",
      fontSize: 12,
      fontFamily: "Inter, system-ui, sans-serif",
      borderRadius: 8,
      border: "1px solid rgba(75, 85, 99, 0.3)",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)"
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
    improving: {
      icon: ArrowDownIcon,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      text: 'Improving'
    },
    stable: {
      icon: ArrowRightIcon,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      text: 'Stable'
    },
    worsening: {
      icon: ArrowUpIcon,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      text: 'Worsening'
    }
  }[trend];

  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-md ${config.bgColor} ${config.color}`}>
      <Icon className="h-3 w-3 flex-shrink-0" />
      <span className="text-xs font-medium">{config.text}</span>
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
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <div className="text-center">
          <div className="text-lg font-medium text-gray-300">Loading Environmental Data</div>
          <div className="text-sm text-gray-500 mt-1">Fetching real-time air quality information...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="p-6 bg-red-500/10 border-red-500/20">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-red-400 mb-2">Data Loading Error</h3>
              <p className="text-red-300 text-sm leading-relaxed mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Retry Loading
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!envData) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="p-6 bg-yellow-500/10 border-yellow-500/20">
          <div className="flex items-start space-x-3">
            <InformationCircleIcon className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">No Data Available</h3>
              <p className="text-yellow-300 text-sm leading-relaxed">Environmental data is currently unavailable for this location.</p>
            </div>
          </div>
        </Card>
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

  // Helper function to get pollutant value with fallback
  const getPollutantValue = (pollutant: keyof EnvironmentalData['current']['aqi']['pollutants']) => {
    return envData.current.aqi.pollutants[pollutant] ?? 0;
  };

  // Helper function to determine primary pollutant
  const getPrimaryPollutant = () => {
    const pollutants = envData.current.aqi.pollutants;
    const values = {
      'PM2.5': pollutants.pm25 ?? 0,
      'NO2': pollutants.no2 ?? 0,
      'SO2': pollutants.so2 ?? 0,
      'O3': pollutants.o3 ?? 0
    };
    
    return Object.entries(values).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Environmental Analytics</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Real-time air quality monitoring and analysis for {selectedCity?.charAt(0).toUpperCase() + selectedCity?.slice(1)}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ClockIcon className="h-4 w-4" />
          <span>Last updated: {new Date(envData.current.timestamp).toLocaleString()}</span>
        </div>
      </div>

      {/* Main Chart Section */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Air Quality Index Trends
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track AQI patterns across different time periods to identify trends and patterns
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['daily', 'weekly', 'monthly', 'yearly'] as TimeRange[]).map(range => (
                <button
                  key={range}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedTimeRange === range
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setSelectedTimeRange(range)}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <InformationCircleIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  {selectedTimeRange.charAt(0).toUpperCase() + selectedTimeRange.slice(1)} Analysis
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                  {timeRangeDescriptions[selectedTimeRange]}
                </p>
              </div>
            </div>
          </div>

          <div className="h-[420px] bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-lg p-4">
            <ResponsiveBar
              data={getTimeRangeData()}
              keys={['value']}
              indexBy="period"
              margin={{ top: 30, right: 30, bottom: 80, left: 80 }}
              padding={0.3}
              colors={({ data }) => getAqiColor(data.value)}
              borderRadius={6}
              enableGridX={false}
              enableGridY={true}
              theme={chartTheme}
              axisBottom={{
                tickSize: 5,
                tickPadding: 8,
                tickRotation: selectedTimeRange === 'daily' ? -45 : -30,
                tickValues: selectedTimeRange === 'daily' ? 12 : undefined,
                legend: selectedTimeRange === 'daily' ? 'Time (Hours)' :
                       selectedTimeRange === 'weekly' ? 'Time Period (Weeks)' :
                       selectedTimeRange === 'monthly' ? 'Time Period (Months)' : 'Time Period (Years)',
                legendPosition: 'middle',
                legendOffset: 60
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 8,
                tickRotation: 0,
                legend: 'Air Quality Index (AQI)',
                legendPosition: 'middle',
                legendOffset: -60,
                format: value => `${value}`
              }}
              tooltip={({ value, indexValue, color }) => (
                <div className="bg-gray-900/95 text-white p-3 border border-gray-600 rounded-lg shadow-xl backdrop-blur-sm">
                  <div className="font-semibold text-sm mb-1">{indexValue}</div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="text-sm">AQI: <span className="font-medium">{value}</span></span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {value <= 50 ? 'Good' : value <= 100 ? 'Moderate' : value <= 150 ? 'Unhealthy for Sensitive' : 'Unhealthy'}
                  </div>
                </div>
              )}
              animate={true}
              motionConfig="gentle"
            />
          </div>
        </div>
      </Card>

      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current AQI Card */}
        <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Current AQI</h3>
              <Badge variant="outline" className="text-xs">
                Live
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <div
                  className="text-5xl font-bold mb-2 tabular-nums"
                  style={{ color: getAqiColor(envData.current.aqi.value) }}
                >
                  {envData.current.aqi.value}
                </div>
                <div
                  className="text-lg font-semibold mb-1"
                  style={{ color: getAqiColor(envData.current.aqi.value) }}
                >
                  {envData.current.aqi.category}
                </div>
                <div className="text-xs text-gray-500">
                  Air Quality Index
                </div>
              </div>

              {envData.current.aqi.prediction && (
                <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Predicted:</span>
                    <span
                      className="font-semibold tabular-nums"
                      style={{ color: getAqiColor(envData.current.aqi.prediction.predictedAQI) }}
                    >
                      {envData.current.aqi.prediction.predictedAQI}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Confidence:</span>
                    <span className="font-semibold text-blue-400 tabular-nums">
                      {Math.round(envData.current.aqi.prediction.confidence * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-center pt-1">
                    <TrendIndicator trend={envData.current.aqi.prediction.trend} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Background decoration */}
          <div
            className="absolute top-0 right-0 w-24 h-24 opacity-10 transform rotate-12"
            style={{ backgroundColor: getAqiColor(envData.current.aqi.value) }}
          ></div>
        </Card>

        {/* Temperature Card */}
        <Card className="p-6 bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Temperature</h3>
            <Badge variant="outline" className="text-xs text-red-400 border-red-400/30">
              Live
            </Badge>
          </div>

          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-red-400 tabular-nums">
              {envData.current.temperature}°C
            </div>
            <div className="text-sm font-medium text-red-300">
              {envData.current.temperature > 30 ? 'High Temperature' :
               envData.current.temperature < 15 ? 'Low Temperature' : 'Normal Range'}
            </div>
            <div className="text-xs text-gray-500">
              Ambient Temperature
            </div>
          </div>
        </Card>

        {/* Humidity Card */}
        <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Humidity</h3>
            <Badge variant="outline" className="text-xs text-blue-400 border-blue-400/30">
              Live
            </Badge>
          </div>

          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-blue-400 tabular-nums">
              {envData.current.humidity.toFixed(1)}%
            </div>
            <div className="text-sm font-medium text-blue-300">
              {envData.current.humidity > 70 ? 'High Humidity' :
               envData.current.humidity < 30 ? 'Low Humidity' : 'Optimal Level'}
            </div>
            <div className="text-xs text-gray-500">
              Relative Humidity
            </div>
          </div>
        </Card>

        {/* CO₂ Levels Card */}
        <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">CO₂ Levels</h3>
            <Badge variant="outline" className="text-xs text-purple-400 border-purple-400/30">
              Live
            </Badge>
          </div>

          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-purple-400 tabular-nums">
              {envData.current.co2.toLocaleString()}
            </div>
            <div className="text-sm font-medium text-purple-300">
              {envData.current.co2 > 1000 ? 'Elevated Level' :
               envData.current.co2 < 400 ? 'Low Level' : 'Normal Range'}
            </div>
            <div className="text-xs text-gray-500">
              Parts Per Million (PPM)
            </div>
          </div>
        </Card>

      </div>

      {/* Pollutant Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* NO₂ Levels Card */}
        <Card className="p-6 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">NO₂ Levels</h3>
            <Badge
              variant="outline"
              className={`text-xs ${
                getPollutantValue('no2') > 100 ? 'text-red-400 border-red-400/30' :
                getPollutantValue('no2') > 50 ? 'text-yellow-400 border-yellow-400/30' :
                'text-green-400 border-green-400/30'
              }`}
            >
              {getPollutantValue('no2') > 100 ? 'High' :
               getPollutantValue('no2') > 50 ? 'Moderate' : 'Normal'}
            </Badge>
          </div>

          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-cyan-400 tabular-nums">
              {getPollutantValue('no2').toFixed(1)}
            </div>
            <div className="text-sm font-medium text-cyan-300">
              Nitrogen Dioxide
            </div>
            <div className="text-xs text-gray-500">
              Parts Per Billion (PPB)
            </div>
          </div>
        </Card>

        {/* SO₂ Levels Card */}
        <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">SO₂ Levels</h3>
            <Badge
              variant="outline"
              className={`text-xs ${
                getPollutantValue('so2') > 75 ? 'text-red-400 border-red-400/30' :
                getPollutantValue('so2') > 35 ? 'text-yellow-400 border-yellow-400/30' :
                'text-green-400 border-green-400/30'
              }`}
            >
              {getPollutantValue('so2') > 75 ? 'High' :
               getPollutantValue('so2') > 35 ? 'Moderate' : 'Normal'}
            </Badge>
          </div>

          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-yellow-400 tabular-nums">
              {getPollutantValue('so2').toFixed(1)}
            </div>
            <div className="text-sm font-medium text-yellow-300">
              Sulfur Dioxide
            </div>
            <div className="text-xs text-gray-500">
              Parts Per Billion (PPB)
            </div>
          </div>
        </Card>

        {/* O₃ Levels Card */}
        <Card className="p-6 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border border-indigo-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">O₃ Levels</h3>
            <Badge
              variant="outline"
              className={`text-xs ${
                getPollutantValue('o3') > 70 ? 'text-red-400 border-red-400/30' :
                getPollutantValue('o3') > 50 ? 'text-yellow-400 border-yellow-400/30' :
                'text-green-400 border-green-400/30'
              }`}
            >
              {getPollutantValue('o3') > 70 ? 'High' :
               getPollutantValue('o3') > 50 ? 'Moderate' : 'Normal'}
            </Badge>
          </div>

          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-indigo-400 tabular-nums">
              {getPollutantValue('o3').toFixed(1)}
            </div>
            <div className="text-sm font-medium text-indigo-300">
              Ozone
            </div>
            <div className="text-xs text-gray-500">
              Parts Per Billion (PPB)
            </div>
          </div>
        </Card>
      </div>

      {/* Location Comparison Chart */}
      <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Location-wise AQI Comparison
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Compare air quality levels across different monitoring locations in the region
          </p>
        </div>

        <div className="h-[400px] bg-gradient-to-br from-slate-900/30 to-slate-800/30 rounded-lg p-4">
          <ResponsiveBar
            data={envData.locationAverages.map(loc => ({
              location: loc.location.charAt(0).toUpperCase() + loc.location.slice(1),
              value: Math.round(loc.averageAqi),
              fullName: loc.location
            }))}
            keys={['value']}
            indexBy="location"
            margin={{ top: 30, right: 30, bottom: 80, left: 80 }}
            padding={0.4}
            colors={({ data }) => getAqiColor(data.value)}
            borderRadius={6}
            enableGridX={false}
            enableGridY={true}
            theme={chartTheme}
            axisBottom={{
              tickSize: 5,
              tickPadding: 8,
              tickRotation: -30,
              legend: 'Monitoring Locations',
              legendPosition: 'middle',
              legendOffset: 60
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 8,
              tickRotation: 0,
              legend: 'Air Quality Index (AQI)',
              legendPosition: 'middle',
              legendOffset: -60,
              format: value => `${value}`
            }}
            tooltip={({ value, indexValue, color, data }) => (
              <div className="bg-gray-900/95 text-white p-4 border border-gray-600 rounded-lg shadow-xl backdrop-blur-sm min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <MapPinIcon className="h-4 w-4 text-gray-400" />
                  <span className="font-semibold">{indexValue}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">AQI Level:</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: color }}
                      ></div>
                      <span className="font-medium tabular-nums">{value}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Category:</span>
                    <span className="text-sm font-medium" style={{ color }}>
                      {value <= 50 ? 'Good' :
                       value <= 100 ? 'Moderate' :
                       value <= 150 ? 'Unhealthy for Sensitive' :
                       value <= 200 ? 'Unhealthy' : 'Very Unhealthy'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            animate={true}
            motionConfig="gentle"
          />
        </div>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature & Humidity Correlation */}
        <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Temperature & Humidity Correlation
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              24-hour patterns showing the relationship between temperature and humidity levels
            </p>
          </div>

          <div className="h-[320px] bg-gradient-to-br from-slate-900/30 to-slate-800/30 rounded-lg p-4">
            <ResponsiveLine
              data={[
                {
                  id: "Temperature",
                  data: envData.hourly.map(h => ({
                    x: h.hour,
                    y: h.temperature
                  }))
                },
                {
                  id: "Humidity",
                  data: envData.hourly.map(h => ({
                    x: h.hour,
                    y: h.humidity
                  }))
                }
              ]}
              margin={{ top: 60, right: 30, bottom: 60, left: 70 }}
              xScale={{ type: "point" }}
              yScale={{ type: "linear", min: "auto", max: "auto" }}
              theme={chartTheme}
              curve="cardinal"
              axisBottom={{
                tickSize: 5,
                tickPadding: 8,
                tickRotation: -30,
                legend: "Time (Hours)",
                legendPosition: "middle",
                legendOffset: 45
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 8,
                tickRotation: 0,
                legend: "Temperature (°C) / Humidity (%)",
                legendPosition: "middle",
                legendOffset: -55
              }}
              pointSize={6}
              pointColor="#ffffff"
              pointBorderWidth={2}
              pointBorderColor={{ from: "serieColor" }}
              enableArea={false}
              enableGridX={false}
              enableGridY={true}
              colors={['#ef4444', '#06b6d4']}
              lineWidth={3}
              legends={[
                {
                  anchor: "top",
                  direction: "row",
                  justify: false,
                  translateY: -45,
                  itemWidth: 100,
                  itemHeight: 20,
                  symbolSize: 12,
                  symbolShape: "circle",
                  itemTextColor: "#ffffff",
                  itemsSpacing: 20
                }
              ]}
              tooltip={({ point }) => (
                <div className="bg-gray-900/95 text-white p-3 border border-gray-600 rounded-lg shadow-xl backdrop-blur-sm">
                  <div className="font-semibold text-sm mb-1">{point.data.x}</div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: point.serieColor }}
                    ></div>
                    <span className="text-sm">
                      {point.serieId}: <span className="font-medium tabular-nums">{point.data.y}</span>
                      {point.serieId === 'Temperature' ? '°C' : '%'}
                    </span>
                  </div>
                </div>
              )}
              animate={true}
              motionConfig="gentle"
            />
          </div>
        </Card>

        {/* CO₂ Levels Chart */}
        <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              CO₂ Concentration Levels
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              24-hour carbon dioxide concentration monitoring in parts per million
            </p>
          </div>

          <div className="h-[320px] bg-gradient-to-br from-slate-900/30 to-slate-800/30 rounded-lg p-4">
            <ResponsiveLine
              data={[
                {
                  id: "CO₂",
                  data: envData.hourly.map(h => ({
                    x: h.hour,
                    y: h.co2
                  }))
                }
              ]}
              margin={{ top: 30, right: 30, bottom: 60, left: 70 }}
              xScale={{ type: "point" }}
              yScale={{ type: "linear", min: "auto", max: "auto" }}
              theme={chartTheme}
              curve="cardinal"
              axisBottom={{
                tickSize: 5,
                tickPadding: 8,
                tickRotation: -30,
                legend: "Time (Hours)",
                legendPosition: "middle",
                legendOffset: 45
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 8,
                tickRotation: 0,
                legend: "CO₂ Concentration (PPM)",
                legendPosition: "middle",
                legendOffset: -55,
                format: value => `${value.toLocaleString()}`
              }}
              enablePoints={true}
              pointSize={6}
              pointColor="#ffffff"
              pointBorderWidth={2}
              pointBorderColor="#8b5cf6"
              enableArea={true}
              areaOpacity={0.15}
              colors={["#8b5cf6"]}
              lineWidth={3}
              enableGridX={false}
              enableGridY={true}
              tooltip={({ point }) => (
                <div className="bg-gray-900/95 text-white p-3 border border-gray-600 rounded-lg shadow-xl backdrop-blur-sm">
                  <div className="font-semibold text-sm mb-1">{point.data.x}</div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: point.serieColor }}
                    ></div>
                    <span className="text-sm">
                      CO₂: <span className="font-medium tabular-nums">{point.data.y.toLocaleString()}</span> PPM
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {point.data.y > 1000 ? 'Elevated Level' :
                     point.data.y < 400 ? 'Low Level' : 'Normal Range'}
                  </div>
                </div>
              )}
              animate={true}
              motionConfig="gentle"
            />
          </div>
        </Card>

        {/* Air Pollutants Chart */}
        <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Air Pollutant Concentrations
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              24-hour monitoring of major air pollutants (NO₂, SO₂, O₃) in parts per billion
            </p>
          </div>

          <div className="h-[320px] bg-gradient-to-br from-slate-900/30 to-slate-800/30 rounded-lg p-4">
            <ResponsiveLine
              data={[
                {
                  id: "NO₂",
                  data: envData.hourly.map(h => ({
                    x: h.hour,
                    y: h.aqi.pollutants?.no2 ?? 0
                  }))
                },
                {
                  id: "SO₂",
                  data: envData.hourly.map(h => ({
                    x: h.hour,
                    y: h.aqi.pollutants?.so2 ?? 0
                  }))
                },
                {
                  id: "O₃",
                  data: envData.hourly.map(h => ({
                    x: h.hour,
                    y: h.aqi.pollutants?.o3 ?? 0
                  }))
                }
              ]}
              margin={{ top: 60, right: 30, bottom: 60, left: 70 }}
              xScale={{ type: "point" }}
              yScale={{ type: "linear", min: "auto", max: "auto" }}
              theme={chartTheme}
              curve="cardinal"
              axisBottom={{
                tickSize: 5,
                tickPadding: 8,
                tickRotation: -30,
                legend: "Time (Hours)",
                legendPosition: "middle",
                legendOffset: 45
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 8,
                tickRotation: 0,
                legend: "Concentration (PPB)",
                legendPosition: "middle",
                legendOffset: -55,
                format: value => `${value.toFixed(1)}`
              }}
              enablePoints={true}
              pointSize={5}
              pointColor="#ffffff"
              pointBorderWidth={2}
              pointBorderColor={{ from: 'color' }}
              enableArea={false}
              colors={['#06b6d4', '#f59e0b', '#8b5cf6']}
              lineWidth={2}
              enableGridX={false}
              enableGridY={true}
              legends={[
                {
                  anchor: "top",
                  direction: "row",
                  justify: false,
                  translateY: -45,
                  itemWidth: 80,
                  itemHeight: 20,
                  symbolSize: 12,
                  symbolShape: "circle",
                  itemTextColor: "#ffffff",
                  itemsSpacing: 15
                }
              ]}
              tooltip={({ point }) => (
                <div className="bg-gray-900/95 text-white p-3 border border-gray-600 rounded-lg shadow-xl backdrop-blur-sm">
                  <div className="font-semibold text-sm mb-1">{point.data.x}</div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: point.serieColor }}
                    ></div>
                    <span className="text-sm">
                      {point.serieId}: <span className="font-medium tabular-nums">{point.data.y.toFixed(1)}</span> PPB
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {point.serieId === 'NO₂' && (
                      point.data.y > 100 ? 'High Level' : point.data.y > 50 ? 'Moderate Level' : 'Normal Level'
                    )}
                    {point.serieId === 'SO₂' && (
                      point.data.y > 75 ? 'High Level' : point.data.y > 35 ? 'Moderate Level' : 'Normal Level'
                    )}
                    {point.serieId === 'O₃' && (
                      point.data.y > 70 ? 'High Level' : point.data.y > 50 ? 'Moderate Level' : 'Normal Level'
                    )}
                  </div>
                </div>
              )}
              animate={true}
              motionConfig="gentle"
            />
          </div>
        </Card>
      </div>

      {/* Analysis Cards Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Environmental Analysis Card */}
        <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Environmental Analysis
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Detailed analysis of current air quality conditions and trends
            </p>
          </div>

          <div className="space-y-6">
            {/* Current Conditions */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircleIcon className="h-5 w-5 text-blue-400" />
                <h4 className="font-semibold text-blue-400">Current Conditions</h4>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 px-3 bg-gray-800/30 rounded-lg">
                  <span className="text-sm text-gray-300">Primary Pollutant:</span>
                  <span
                    className="font-semibold text-sm"
                    style={{
                      color: getAqiColor(getPollutantValue(getPrimaryPollutant().toLowerCase() as keyof EnvironmentalData['current']['aqi']['pollutants']))
                    }}
                  >
                    {getPrimaryPollutant()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 bg-gray-800/30 rounded-lg">
                  <span className="text-sm text-gray-300">24-hour Average:</span>
                  <span
                    className="font-semibold text-sm tabular-nums"
                    style={{ color: getAqiColor(envData.current.aqi.value) }}
                  >
                    {envData.current.aqi.value} AQI
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 bg-gray-800/30 rounded-lg">
                  <span className="text-sm text-gray-300">Peak Hours:</span>
                  <span className="font-semibold text-sm text-red-400 tabular-nums">
                    {envData.timeRangeAverages.daily.reduce((max, current) =>
                      current.averageAqi > max.averageAqi ? current : max
                    ).hour}:00
                  </span>
                </div>
              </div>
            </div>

            <Separator className="bg-gray-700" />

            {/* Trend Analysis */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ArrowUpIcon className="h-5 w-5 text-amber-400" />
                <h4 className="font-semibold text-amber-400">Trend Analysis</h4>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-gradient-to-r from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <InformationCircleIcon className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-blue-300 leading-relaxed">
                      {envData.current.aqi.prediction?.trend === 'improving' ? 'Air quality showing improvement trend over the next 24 hours' :
                       envData.current.aqi.prediction?.trend === 'worsening' ? 'Air quality expected to deteriorate in coming hours' :
                       'Air quality levels expected to remain stable'}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <InformationCircleIcon className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-purple-300 leading-relaxed">
                      CO₂ levels are {envData.current.co2 > 1000 ? 'above recommended range - consider improving ventilation' : 'within normal range for indoor environments'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Smart Recommendations Card */}
        <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Smart Recommendations
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Personalized health and activity recommendations based on current air quality
            </p>
          </div>

          <div className="space-y-6">
            {/* Health Advisory */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
                <h4 className="font-semibold text-green-400">Health Advisory</h4>
              </div>
              <div className="space-y-3">
                {envData.current.aqi.value <= 50 && (
                  <div className="p-3 bg-gradient-to-r from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-green-400 mb-1">Excellent Air Quality</div>
                        <div className="text-sm text-green-300 leading-relaxed">
                          Perfect conditions for all outdoor activities including exercise, sports, and recreation
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {envData.current.aqi.value > 50 && envData.current.aqi.value <= 100 && (
                  <div className="p-3 bg-gradient-to-r from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <ExclamationTriangleIcon className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-yellow-400 mb-1">Moderate Air Quality</div>
                        <div className="text-sm text-yellow-300 leading-relaxed">
                          Generally acceptable, but sensitive individuals should consider reducing prolonged outdoor exertion
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {envData.current.aqi.value > 100 && (
                  <div className="p-3 bg-gradient-to-r from-red-500/10 to-red-600/5 border border-red-500/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <ExclamationTriangleIcon className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-red-400 mb-1">Unhealthy Air Quality</div>
                        <div className="text-sm text-red-300 leading-relaxed">
                          Limit outdoor exposure, especially for children, elderly, and those with respiratory conditions
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator className="bg-gray-700" />

            {/* Action Items */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ArrowRightIcon className="h-5 w-5 text-blue-400" />
                <h4 className="font-semibold text-blue-400">Recommended Actions</h4>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-gradient-to-r from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <ClockIcon className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-blue-400 mb-1">Optimal Ventilation Window</div>
                      <div className="text-sm text-blue-300">Best air quality typically between 6:00 AM - 9:00 AM</div>
                    </div>
                  </div>
                </div>

                {envData.current.humidity > 70 && (
                  <div className="p-3 bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <ExclamationTriangleIcon className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-amber-400 mb-1">High Humidity Alert</div>
                        <div className="text-sm text-amber-300">Consider using dehumidifiers to maintain optimal indoor conditions</div>
                      </div>
                    </div>
                  </div>
                )}

                {envData.current.co2 > 1000 && (
                  <div className="p-3 bg-gradient-to-r from-red-500/10 to-red-600/5 border border-red-500/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <ExclamationTriangleIcon className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-red-400 mb-1">Ventilation Required</div>
                        <div className="text-sm text-red-300">Improve air circulation in enclosed spaces immediately</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-gradient-to-r from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <InformationCircleIcon className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-purple-400 mb-1">Stay Updated</div>
                      <div className="text-sm text-purple-300">Air quality data refreshes every 5 minutes for real-time monitoring</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Footer Information */}
      <Card className="p-4 bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-600/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <MapPinIcon className="h-4 w-4" />
              <span>Location: {selectedCity?.charAt(0).toUpperCase() + selectedCity?.slice(1)}</span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4" />
              <span>Updated: {new Date(envData.current.timestamp).toLocaleString()}</span>
            </div>
          </div>
          <div className="text-xs">
            Data sourced from environmental monitoring stations • Predictions based on ML models
          </div>
        </div>
      </Card>
    </div>
  );
}