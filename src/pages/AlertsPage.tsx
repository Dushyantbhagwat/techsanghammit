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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Alerts</h1>
        <div className="flex items-center gap-4">
          <select
            value={selectedType}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            {types.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Alert Distribution by Category</h3>
          <div className="h-[400px]">
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

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Alert Insights</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Current Status</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Most alerts from {categories.find(c => c !== 'All' && alerts.filter(a => a.category === c).length === Math.max(...categories.filter(c => c !== 'All').map(c => alerts.filter(a => a.category === c).length)))} category</li>
                <li>{alerts.filter(a => a.type === 'red').length} critical alerts requiring attention</li>
                <li>{new Set(alerts.map(a => a.area)).size} distinct areas affected</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Recommendations</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Prioritize {alerts.filter(a => a.type === 'red').length > 0 ? 'critical' : 'warning'} alerts</li>
                <li>Monitor affected areas for escalations</li>
                <li>Review response protocols for frequent alerts</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {filteredAlerts.map(alert => {
          const severity = getAlertSeverity(alert.type);
          const Icon = severity.icon;
          return (
            <Card key={alert.id} className="p-4">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg bg-${severity.color}-100`}>
                  <Icon className={`h-5 w-5 text-${severity.color}-600`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{alert.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{alert.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm px-2 py-1 rounded-full bg-${severity.color}-100 text-${severity.color}-600`}>
                        {alert.category}
                      </span>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        {alert.time}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
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