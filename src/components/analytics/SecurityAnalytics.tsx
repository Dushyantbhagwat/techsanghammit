import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from "@nivo/bar";
import { useCity } from "@/contexts/CityContext";
import { fetchSecurityData, type SecurityData } from "@/services/security";
import { ExclamationTriangleIcon, CheckCircleIcon, ShieldExclamationIcon } from "@heroicons/react/24/solid";

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

const StatusIndicator = ({ level }: { level: SecurityData['zones'][0]['riskLevel'] }) => {
  const config = {
    Low: { icon: CheckCircleIcon, color: 'text-green-500', text: 'Normal' },
    Medium: { icon: ExclamationTriangleIcon, color: 'text-amber-500', text: 'Caution' },
    High: { icon: ShieldExclamationIcon, color: 'text-red-500', text: 'Alert' }
  }[level];

  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-1 ${config.color}`}>
      <Icon className="h-4 w-4" />
      <span>{config.text}</span>
    </div>
  );
};

export function SecurityAnalytics() {
  const [securityData, setSecurityData] = useState<SecurityData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedCity } = useCity();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchSecurityData(selectedCity);
        setSecurityData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch security data');
        console.error('Error fetching security data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30 * 1000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [selectedCity]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg animate-pulse">Loading security data...</div>
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

  if (!securityData) {
    return (
      <div className="p-6 bg-yellow-500/10 rounded-lg">
        <p className="text-yellow-500">No security data available</p>
      </div>
    );
  }

  const highRiskZones = securityData.zones.filter(zone => zone.riskLevel === 'High');
  const systemStatus = securityData.zones.every(zone => 
    zone.activeCameras >= 25
  ) ? 'Normal' : 'Degraded';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Active Alerts</h3>
          <div className="text-3xl font-bold">{securityData.current.activeAlerts}</div>
          <StatusIndicator level={securityData.current.activeAlerts > 10 ? 'High' : securityData.current.activeAlerts > 5 ? 'Medium' : 'Low'} />
          <div className="mt-4 text-sm text-gray-500">
            Updated {new Date(securityData.current.timestamp).toLocaleTimeString()}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Active Cameras</h3>
          <div className="text-3xl font-bold">{securityData.current.activeCameras}</div>
          <div className="mt-2">
            <StatusIndicator level={systemStatus === 'Normal' ? 'Low' : 'Medium'} />
          </div>
          <div className="mt-4 text-sm text-gray-500">Updated now</div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Incidents</h3>
          <div className="text-3xl font-bold">{securityData.current.incidentCount}</div>
          <StatusIndicator level={securityData.current.incidentCount > 15 ? 'High' : securityData.current.incidentCount > 8 ? 'Medium' : 'Low'} />
          <div className="mt-4 text-sm text-gray-500">Last 24 Hours</div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Hourly Alert Trend</h3>
        <div className="h-[380px]">
          <ResponsiveLine
            data={[
              {
                id: "alerts",
                data: securityData.hourly.map(h => ({
                  x: h.hour,
                  y: h.alertCount
                }))
              }
            ]}
            margin={{ top: 25, right: 20, bottom: 55, left: 60 }}
            xScale={{ type: "point" }}
            yScale={{ type: "linear", min: 0, max: "auto" }}
            theme={chartTheme}
            curve="cardinal"
            axisBottom={{
              tickSize: 5,
              tickPadding: 12,
              tickRotation: -45,
              legend: "Hour",
              legendOffset: 45,
              legendPosition: "middle"
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Number of Alerts",
              legendOffset: -40,
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
            enableSlices="x"
            sliceTooltip={({ slice }) => (
              <div className="bg-gray-800 text-white p-2 border border-gray-700 rounded shadow-lg">
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

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Zone-wise Security Status</h3>
        <div className="h-[380px]">
          <ResponsiveBar
            data={securityData.zones}
            keys={['incidentCount']}
            indexBy="name"
            margin={{ top: 85, right: 20, bottom: 115, left: 60 }}
            padding={0.3}
            valueScale={{ type: 'linear' }}
            theme={chartTheme}
            colors={({ data }) => {
              switch (data.riskLevel) {
                case 'Low': return '#00E396';
                case 'Medium': return '#FEB019';
                case 'High': return '#FF4560';
                default: return '#999999';
              }
            }}
            borderRadius={4}
            enableGridX={false}
            enableGridY={false}
            axisBottom={{
              tickSize: 5,
              tickPadding: 12,
              tickRotation: -45,
              legend: "Zone",
              legendOffset: 75,
              legendPosition: "middle"
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Incident Count',
              legendPosition: 'middle',
              legendOffset: -40
            }}
            tooltip={({ value, indexValue, color }) => (
              <div className="bg-gray-800 text-white p-2 border border-gray-700 rounded shadow-lg">
                <strong>{indexValue}</strong><br />
                <span>Incidents: {value}</span><br />
                <span style={{ color }}>
                  Risk Level: {securityData.zones.find(z => z.name === indexValue)?.riskLevel}
                </span>
              </div>
            )}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Incident Types</h3>
          <div className="h-[380px]">
            <ResponsiveBar
              data={securityData.incidentTypes}
              keys={['count']}
              indexBy="type"
              margin={{ top: 85, right: 20, bottom: 115, left: 60 }}
              padding={0.3}
              theme={chartTheme}
              colors="#6C5DD3"
              borderRadius={4}
              enableGridX={false}
              enableGridY={false}
              axisBottom={{
                tickSize: 5,
                tickPadding: 12,
                tickRotation: -45,
                legend: "Incident Type",
                legendOffset: 85,
                legendPosition: "middle"
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Number of Incidents',
                legendPosition: 'middle',
                legendOffset: -40
              }}
              tooltip={({ value, indexValue }) => (
                <div className="bg-gray-800 text-white p-2 border border-gray-700 rounded shadow-lg">
                  <strong>{indexValue}</strong><br />
                  <span>Count: {value}</span>
                </div>
              )}
            />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Security Insights</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Current Status</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {highRiskZones.map(zone => (
                  <li key={zone.name} className="text-red-500">
                    High alert level in {zone.name} ({zone.incidentCount} incidents)
                  </li>
                ))}
                <li className={systemStatus === 'Normal' ? 'text-green-500' : 'text-amber-500'}>
                  Surveillance system status: {systemStatus}
                </li>
                <li className="text-blue-500">
                  Most common incident: {securityData.incidentTypes[0].type}
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Recommendations</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {highRiskZones.map(zone => (
                  <li key={zone.name}>Increase patrols in {zone.name}</li>
                ))}
                {systemStatus === 'Degraded' && (
                  <li>Schedule maintenance for inactive cameras</li>
                )}
                <li>Monitor {securityData.incidentTypes[0].type.toLowerCase()} incidents closely</li>
                <li>Regular system diagnostics recommended</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}