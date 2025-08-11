import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { AlertTriangle, AlertCircle, Bell, Clock, AlertOctagon } from "lucide-react";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from "@nivo/bar";
import { VoiceAssistant } from "@/components/alerts/VoiceAssistant";

// Thresholds for different metrics
const THRESHOLDS = {
  traffic: {
    red: 3000, // vehicles/hour
    yellow: 2500,
    green: 1500
  },
  aqi: {
    red: 150, // AQI value
    yellow: 100,
    green: 50
  },
  co2: {
    red: 1000, // ppm
    yellow: 800,
    green: 600
  },
  temperature: {
    red: 35, // °C
    yellow: 30,
    green: 25
  },
  humidity: {
    red: 80, // %
    yellow: 70,
    green: 60
  }
};

// Mock current values (in a real app, these would come from your analytics data)
const currentValues = {
  traffic: 2700,
  aqi: 120,
  co2: 850,
  temperature: 32,
  humidity: 75
};

function getAlertLevel(value: number, thresholds: { red: number; yellow: number; green: number }) {
  if (value >= thresholds.red) return 'red';
  if (value >= thresholds.yellow) return 'yellow';
  return 'green';
}

function getAlertSeverity(level: string) {
  switch (level) {
    case 'red':
      return { label: 'Critical', color: 'red', icon: AlertOctagon };
    case 'yellow':
      return { label: 'Warning', color: 'orange', icon: AlertTriangle };
    case 'green':
      return { label: 'Normal', color: 'green', icon: Bell };
    default:
      return { label: 'Unknown', color: 'gray', icon: AlertCircle };
  }
}

const alertsData = [
  { hour: "00:00", count: 2 },
  { hour: "03:00", count: 1 },
  { hour: "06:00", count: 3 },
  { hour: "09:00", count: 5 },
  { hour: "12:00", count: 4 },
  { hour: "15:00", count: 6 },
  { hour: "18:00", count: 4 },
  { hour: "21:00", count: 2 }
];

// Generate alerts based on current values and thresholds
function generateAlerts() {
  const alerts = [];
  const areas = ["Downtown", "Suburban Area", "Industrial Zone", "Residential District"];
  let id = 1;

  // Traffic alerts
  const trafficLevel = getAlertLevel(currentValues.traffic, THRESHOLDS.traffic);
  if (trafficLevel !== 'green') {
    alerts.push({
      id: id++,
      type: trafficLevel,
      title: `High Traffic Volume`,
      description: `Traffic flow exceeding ${trafficLevel === 'red' ? 'critical' : 'warning'} threshold in ${areas[0]}`,
      time: "10 minutes ago",
      category: "Traffic",
      area: areas[0]
    });
  }

  // AQI alerts
  const aqiLevel = getAlertLevel(currentValues.aqi, THRESHOLDS.aqi);
  if (aqiLevel !== 'green') {
    alerts.push({
      id: id++,
      type: aqiLevel,
      title: "Air Quality Alert",
      description: `AQI levels at ${currentValues.aqi} in ${areas[1]} - ${aqiLevel === 'red' ? 'Hazardous' : 'Unhealthy'} conditions`,
      time: "25 minutes ago",
      category: "Environmental",
      area: areas[1]
    });
  }

  // CO2 alerts
  const co2Level = getAlertLevel(currentValues.co2, THRESHOLDS.co2);
  if (co2Level !== 'green') {
    alerts.push({
      id: id++,
      type: co2Level,
      title: "High CO₂ Levels",
      description: `CO₂ concentration at ${currentValues.co2}ppm in ${areas[2]}`,
      time: "15 minutes ago",
      category: "Environmental",
      area: areas[2]
    });
  }

  // Temperature alerts
  const tempLevel = getAlertLevel(currentValues.temperature, THRESHOLDS.temperature);
  if (tempLevel !== 'green') {
    alerts.push({
      id: id++,
      type: tempLevel,
      title: "High Temperature",
      description: `Temperature at ${currentValues.temperature}°C in ${areas[3]}`,
      time: "5 minutes ago",
      category: "Environmental",
      area: areas[3]
    });
  }

  return alerts;
}

const categories = ["All", "Traffic", "Environmental", "Infrastructure", "Security", "Parking"];
const types = ["All", "Red", "Yellow", "Green"];

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

export function AlertsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState(() => {
    const typeParam = searchParams.get('type');
    return typeParam ? typeParam.charAt(0).toUpperCase() + typeParam.slice(1) : "All";
  });
  const [alerts, setAlerts] = useState(generateAlerts());
  const [voiceAssistantData, setVoiceAssistantData] = useState({
    time: new Date().toLocaleTimeString(),
    date: new Date().toLocaleDateString(),
    traffic: {
      vehicleCount: currentValues.traffic,
      congestionLevel: getAlertLevel(currentValues.traffic, THRESHOLDS.traffic) === 'red'
        ? 'high'
        : getAlertLevel(currentValues.traffic, THRESHOLDS.traffic) === 'yellow'
        ? 'moderate'
        : 'low'
    },
    aqi: {
      value: currentValues.aqi,
      category: getAlertLevel(currentValues.aqi, THRESHOLDS.aqi) === 'red'
        ? 'hazardous'
        : getAlertLevel(currentValues.aqi, THRESHOLDS.aqi) === 'yellow'
        ? 'unhealthy'
        : 'good'
    },
    co2: {
      value: currentValues.co2,
      status: getAlertLevel(currentValues.co2, THRESHOLDS.co2) === 'red'
        ? 'critically high'
        : getAlertLevel(currentValues.co2, THRESHOLDS.co2) === 'yellow'
        ? 'elevated'
        : 'normal'
    },
    temperature: {
      value: currentValues.temperature,
      status: getAlertLevel(currentValues.temperature, THRESHOLDS.temperature) === 'red'
        ? 'extremely hot'
        : getAlertLevel(currentValues.temperature, THRESHOLDS.temperature) === 'yellow'
        ? 'warm'
        : 'comfortable'
    }
  });

  // Update selected type when URL changes
  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam) {
      setSelectedType(typeParam.charAt(0).toUpperCase() + typeParam.slice(1));
    }
  }, [searchParams]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAlerts(generateAlerts());
      setVoiceAssistantData(prev => ({
        ...prev,
        time: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
        traffic: {
          vehicleCount: currentValues.traffic,
          congestionLevel: getAlertLevel(currentValues.traffic, THRESHOLDS.traffic) === 'red'
            ? 'high'
            : getAlertLevel(currentValues.traffic, THRESHOLDS.traffic) === 'yellow'
            ? 'moderate'
            : 'low'
        },
        aqi: {
          value: currentValues.aqi,
          category: getAlertLevel(currentValues.aqi, THRESHOLDS.aqi) === 'red'
            ? 'hazardous'
            : getAlertLevel(currentValues.aqi, THRESHOLDS.aqi) === 'yellow'
            ? 'unhealthy'
            : 'good'
        },
        co2: {
          value: currentValues.co2,
          status: getAlertLevel(currentValues.co2, THRESHOLDS.co2) === 'red'
            ? 'critically high'
            : getAlertLevel(currentValues.co2, THRESHOLDS.co2) === 'yellow'
            ? 'elevated'
            : 'normal'
        },
        temperature: {
          value: currentValues.temperature,
          status: getAlertLevel(currentValues.temperature, THRESHOLDS.temperature) === 'red'
            ? 'extremely hot'
            : getAlertLevel(currentValues.temperature, THRESHOLDS.temperature) === 'yellow'
            ? 'warm'
            : 'comfortable'
        }
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    if (type === "All") {
      searchParams.delete('type');
    } else {
      searchParams.set('type', type.toLowerCase());
    }
    setSearchParams(searchParams);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const filteredAlerts = alerts.filter(alert => {
    const categoryMatch = selectedCategory === "All" || alert.category === selectedCategory;
    const typeMatch = selectedType === "All" || alert.type === selectedType.toLowerCase();
    return categoryMatch && typeMatch;
  });

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Alerts</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <select
            value={selectedType}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="px-2 sm:px-3 py-1.5 sm:py-2 bg-black text-white border border-gray-800 rounded-md text-xs sm:text-sm hover:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            {types.map(type => (
              <option key={type} value={type} className="bg-black text-white">
                {type}
              </option>
            ))}
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="px-2 sm:px-3 py-1.5 sm:py-2 bg-black text-white border border-gray-800 rounded-md text-xs sm:text-sm hover:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            {categories.map(category => (
              <option key={category} value={category} className="bg-black text-white">
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Active Alerts</h3>
          <div className="text-3xl font-bold">{alerts.length}</div>
          <div className="mt-2 text-sm text-gray-500">
            <span className={alerts.length > 5 ? "text-red-500" : "text-green-500"}>
              {alerts.length > 5 ? "↑" : "↓"} {Math.abs(alerts.length - 5)}
            </span> from baseline
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Critical Issues</h3>
          <div className="text-3xl font-bold text-red-500">
            {alerts.filter(a => a.type === 'red').length}
          </div>
          <div className="mt-2 text-sm text-gray-500">Requiring immediate attention</div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Areas Affected</h3>
          <div className="text-3xl font-bold">
            {new Set(alerts.map(a => a.area)).size}
          </div>
          <div className="mt-2 text-sm text-gray-500">Distinct locations</div>
        </Card>

        <VoiceAssistant data={voiceAssistantData} />
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Alert Frequency (24h)</h3>
        <div className="h-[400px]">
          <ResponsiveLine
            data={[
              {
                id: "alerts",
                data: alertsData.map(d => ({ x: d.hour, y: d.count }))
              }
            ]}
            margin={{ top: 40, right: 20, bottom: 70, left: 60 }}
            xScale={{ type: "point" }}
            yScale={{ type: "linear", min: 0, max: "auto" }}
            curve="cardinal"
            axisBottom={{
              tickSize: 5,
              tickPadding: 12,
              tickRotation: -45,
              legend: "Hour of Day",
              legendOffset: 60,
              legendPosition: "middle"
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Number of Alerts",
              legendOffset: -50,
              legendPosition: "middle"
            }}
            enablePoints={true}
            pointSize={8}
            pointColor="#ffffff"
            pointBorderWidth={2}
            pointBorderColor="#FF4560"
            enableArea={true}
            areaOpacity={0.1}
            colors={["#FF4560"]}
            enableGridX={false}
            enableGridY={false}
            theme={chartTheme}
            enableSlices="x"
            sliceTooltip={({ slice }) => (
              <div style={{ background: 'white', padding: '9px 12px', border: '1px solid #ccc' }}>
                {slice.points.map(point => (
                  <div key={point.id}>
                    <strong>Hour: </strong>{String(point.data.x)}<br />
                    <strong>Alerts: </strong>{String(point.data.y)}
                  </div>
                ))}
              </div>
            )}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Alert Distribution by Category</h3>
          <div className="h-[300px] sm:h-[400px]">
            <ResponsiveBar
              data={[
                {
                  category: "Traffic",
                  Critical: alerts.filter(a => a.type === 'red' && a.category === 'Traffic').length,
                  Warning: alerts.filter(a => a.type === 'yellow' && a.category === 'Traffic').length,
                  Normal: alerts.filter(a => a.type === 'green' && a.category === 'Traffic').length,
                },
                {
                  category: "Environmental",
                  Critical: alerts.filter(a => a.type === 'red' && a.category === 'Environmental').length,
                  Warning: alerts.filter(a => a.type === 'yellow' && a.category === 'Environmental').length,
                  Normal: alerts.filter(a => a.type === 'green' && a.category === 'Environmental').length,
                },
                {
                  category: "Infrastructure",
                  Critical: alerts.filter(a => a.type === 'red' && a.category === 'Infrastructure').length,
                  Warning: alerts.filter(a => a.type === 'yellow' && a.category === 'Infrastructure').length,
                  Normal: alerts.filter(a => a.type === 'green' && a.category === 'Infrastructure').length,
                },
                {
                  category: "Security",
                  Critical: alerts.filter(a => a.type === 'red' && a.category === 'Security').length,
                  Warning: alerts.filter(a => a.type === 'yellow' && a.category === 'Security').length,
                  Normal: alerts.filter(a => a.type === 'green' && a.category === 'Security').length,
                }
              ]}
              keys={['Critical', 'Warning', 'Normal']}
              indexBy="category"
              margin={{ top: 30, right: 130, bottom: 50, left: 60 }}
              padding={0.3}
              groupMode="grouped"
              valueScale={{ type: 'linear' }}
              colors={['#FF4560', '#FEB019', '#00E396']}
              borderRadius={4}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Category',
                legendPosition: 'middle',
                legendOffset: 40
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Number of Alerts',
                legendPosition: 'middle',
                legendOffset: -40
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor="#ffffff"
              legends={[
                {
                  dataFrom: 'keys',
                  anchor: 'bottom-right',
                  direction: 'column',
                  justify: false,
                  translateX: 120,
                  translateY: 0,
                  itemsSpacing: 2,
                  itemWidth: 100,
                  itemHeight: 20,
                  itemDirection: 'left-to-right',
                  itemOpacity: 0.85,
                  symbolSize: 20,
                  itemTextColor: "#ffffff",
                  effects: [
                    {
                      on: 'hover',
                      style: {
                        itemOpacity: 1
                      }
                    }
                  ]
                }
              ]}
              theme={chartTheme}
              enableGridY={false}
            />
          </div>
        </Card>

        <Card className="p-4 sm:p-6 bg-gradient-to-br from-black to-gray-900 border border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-white">Alert Insights</h3>
            <span className="px-2 sm:px-3 py-1 text-xs font-medium bg-blue-500/30 text-blue-300 rounded-full w-fit">
              Live Analysis
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-6">
              <div>
                <h4 className="flex items-center gap-2 font-medium mb-3 text-gray-200">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Current Status
                </h4>
                <div className="space-y-3">
                  <div className="bg-black rounded-lg p-3 border border-gray-800">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Most Active Category</span>
                      <span className="text-white font-medium">
                        {categories.find(c => c !== 'All' && alerts.filter(a => a.category === c).length === Math.max(...categories.filter(c => c !== 'All').map(c => alerts.filter(a => a.category === c).length)))}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      {Math.max(...categories.filter(c => c !== 'All').map(c => alerts.filter(a => a.category === c).length))} alerts in this category
                    </div>
                  </div>
                  <div className="bg-black rounded-lg p-3 border border-gray-800">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Critical Alerts</span>
                      <span className={`font-medium ${
                        alerts.filter(a => a.type === 'red').length > 0 ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {alerts.filter(a => a.type === 'red').length}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      Requiring immediate attention
                    </div>
                  </div>
                  <div className="bg-black rounded-lg p-3 border border-gray-800">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Areas Affected</span>
                      <span className="text-white font-medium">
                        {new Set(alerts.map(a => a.area)).size}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      Distinct locations with active alerts
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="flex items-center gap-2 font-medium mb-3 text-gray-200">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  Smart Recommendations
                </h4>
                <div className="space-y-3">
                  {alerts.filter(a => a.type === 'red').length > 0 && (
                    <div className="bg-black rounded-lg p-3 border border-red-900/50">
                      <div className="font-medium text-red-400">Critical Alert Response</div>
                      <div className="mt-1 text-sm text-red-200">
                        Immediate attention required for {alerts.filter(a => a.type === 'red').length} critical alerts. Prioritize high-risk areas.
                      </div>
                    </div>
                  )}
                  <div className="bg-black rounded-lg p-3 border border-blue-900/50">
                    <div className="font-medium text-blue-400">Area Monitoring</div>
                    <div className="mt-1 text-sm text-blue-200">
                      Focus on {Array.from(new Set(alerts.map(a => a.area))).slice(0, 2).join(', ')} for potential escalations.
                    </div>
                  </div>
                  <div className="bg-black rounded-lg p-3 border border-green-900/50">
                    <div className="font-medium text-green-400">Optimization</div>
                    <div className="mt-1 text-sm text-green-200">
                      {alerts.length > 5
                        ? "Review and update response protocols for high alert frequency"
                        : "Current alert levels within normal range. Maintain standard protocols"}
                    </div>
                  </div>
                  <div className="bg-black rounded-lg p-3 border border-yellow-900/50">
                    <div className="font-medium text-yellow-400">Resource Allocation</div>
                    <div className="mt-1 text-sm text-yellow-200">
                      {`Deploy resources to ${
                        categories.find(c => c !== 'All' && alerts.filter(a => a.category === c).length === Math.max(...categories.filter(c => c !== 'All').map(c => alerts.filter(a => a.category === c).length)))
                      } zones for improved response times`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {filteredAlerts.map(alert => {
          const severity = getAlertSeverity(alert.type);
          const Icon = severity.icon;
          return (
            <Card key={alert.id} className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                <div className={`p-2 rounded-lg bg-${severity.color}-100 self-start`}>
                  <Icon className={`h-4 sm:h-5 w-4 sm:w-5 text-${severity.color}-600`} />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                    <div>
                      <h3 className="text-sm sm:text-base font-medium">{alert.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">{alert.description}</p>
                    </div>
                    <div className="flex items-center gap-2 self-start">
                      <span className={`text-xs sm:text-sm px-2 py-1 rounded-full bg-${severity.color}-100 text-${severity.color}-600`}>
                        {alert.category}
                      </span>
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
                        <Clock className="h-3 sm:h-4 w-3 sm:w-4" />
                        {alert.time}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs sm:text-sm text-gray-500">
                    Location: {alert.area}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}