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
        <Card className="p-6 bg-gradient-to-br from-red-500/10 to-red-600/5">
          <h3 className="text-lg font-semibold mb-2">Active Alerts</h3>
          <div className="text-4xl font-bold">{securityData.current.activeAlerts}</div>
          <div className="mt-2 space-y-2">
            <StatusIndicator level={securityData.current.activeAlerts > 10 ? 'High' : securityData.current.activeAlerts > 5 ? 'Medium' : 'Low'} />
            <div className="text-sm text-gray-400">
              {securityData.current.activeAlerts > 10 ? 'Critical attention needed' :
               securityData.current.activeAlerts > 5 ? 'Elevated alert level' : 'Normal operations'}
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-400">
            Last updated: {new Date(securityData.current.timestamp).toLocaleTimeString()}
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <h3 className="text-lg font-semibold mb-2">Surveillance Network</h3>
          <div className="text-4xl font-bold">{securityData.current.activeCameras}</div>
          <div className="mt-2 space-y-2">
            <StatusIndicator level={systemStatus === 'Normal' ? 'Low' : 'Medium'} />
            <div className="text-sm text-gray-400">
              {Math.round((securityData.current.activeCameras / securityData.zones.reduce((acc, z) => acc + z.activeCameras, 0)) * 100)}% operational
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-400">Real-time monitoring</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-amber-500/10 to-amber-600/5">
          <h3 className="text-lg font-semibold mb-2">24h Incidents</h3>
          <div className="text-4xl font-bold">{securityData.current.incidentCount}</div>
          <div className="mt-2 space-y-2">
            <StatusIndicator level={securityData.current.incidentCount > 15 ? 'High' : securityData.current.incidentCount > 8 ? 'Medium' : 'Low'} />
            <div className="text-sm text-gray-400">
              {securityData.current.incidentCount > 15 ? 'Above average activity' :
               securityData.current.incidentCount > 8 ? 'Moderate activity' : 'Normal activity'}
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-400">Rolling 24-hour period</div>
        </Card>
      </div>

      <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
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

      <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
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
        <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
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

        <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <h3 className="text-lg font-semibold mb-4">Security Insights & Actions</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3 text-red-400">High Priority Alerts</h4>
              <div className="space-y-2">
                {highRiskZones.map(zone => (
                  <div key={zone.name} className="p-2 bg-gradient-to-r from-red-500/10 to-red-600/5 rounded">
                    <span className="text-red-400">
                      {zone.name}: {zone.incidentCount} incidents (High Risk)
                    </span>
                  </div>
                ))}
                {highRiskZones.length === 0 && (
                  <div className="p-2 bg-gradient-to-r from-green-500/10 to-green-600/5 rounded">
                    <span className="text-green-400">No high-risk zones detected</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3 text-blue-400">System Status</h4>
              <div className="space-y-2">
                <div className={`p-2 bg-gradient-to-r ${
                  systemStatus === 'Normal'
                    ? 'from-green-500/10 to-green-600/5'
                    : 'from-amber-500/10 to-amber-600/5'
                } rounded`}>
                  <span className={systemStatus === 'Normal' ? 'text-green-400' : 'text-amber-400'}>
                    Surveillance system: {systemStatus}
                  </span>
                </div>
                <div className="p-2 bg-gradient-to-r from-blue-500/10 to-blue-600/5 rounded">
                  <span className="text-blue-400">
                    Most frequent: {securityData.incidentTypes[0].type} ({securityData.incidentTypes[0].count} cases)
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3 text-amber-400">Action Items</h4>
              <div className="space-y-2">
                {highRiskZones.map(zone => (
                  <div key={zone.name} className="p-2 bg-gradient-to-r from-red-500/10 to-red-600/5 rounded">
                    <span className="text-red-400">
                      Immediate: Increase patrol frequency in {zone.name}
                    </span>
                  </div>
                ))}
                {systemStatus === 'Degraded' && (
                  <div className="p-2 bg-gradient-to-r from-amber-500/10 to-amber-600/5 rounded">
                    <span className="text-amber-400">
                      Priority: Schedule maintenance for non-operational cameras
                    </span>
                  </div>
                )}
                <div className="p-2 bg-gradient-to-r from-blue-500/10 to-blue-600/5 rounded">
                  <span className="text-blue-400">
                    Focus: Monitor {securityData.incidentTypes[0].type.toLowerCase()} patterns
                  </span>
                </div>
                <div className="p-2 bg-gradient-to-r from-purple-500/10 to-purple-600/5 rounded">
                  <span className="text-purple-400">
                    Routine: Run system diagnostics every 6 hours
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}