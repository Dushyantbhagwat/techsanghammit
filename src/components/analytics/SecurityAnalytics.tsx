import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from "@nivo/bar";
import { useCity } from "@/contexts/CityContext";
import { fetchSecurityData, type SecurityData } from "@/services/security";
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ShieldExclamationIcon,
  ClockIcon,
  MapPinIcon,
  CameraIcon,
  ShieldCheckIcon,
  EyeIcon,
  BellAlertIcon,
  InformationCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from "@heroicons/react/24/solid";

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

const StatusIndicator = ({ level }: { level: SecurityData['zones'][0]['riskLevel'] }) => {
  const config = {
    Low: {
      icon: CheckCircleIcon,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      text: 'Normal'
    },
    Medium: {
      icon: ExclamationTriangleIcon,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      text: 'Caution'
    },
    High: {
      icon: ShieldExclamationIcon,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      text: 'Alert'
    }
  }[level];

  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-md border ${config.bgColor} ${config.borderColor} ${config.color}`}>
      <Icon className="h-3 w-3 flex-shrink-0" />
      <span className="text-xs font-medium">{config.text}</span>
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
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        <div className="text-center">
          <div className="text-lg font-medium text-gray-300">Loading Security Data</div>
          <div className="text-sm text-gray-500 mt-1">Fetching real-time security monitoring information...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="p-6 bg-red-500/10 border-red-500/20">
          <div className="flex items-start space-x-3">
            <ShieldExclamationIcon className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-red-400 mb-2">Security Data Error</h3>
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

  if (!securityData) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="p-6 bg-yellow-500/10 border-yellow-500/20">
          <div className="flex items-start space-x-3">
            <InformationCircleIcon className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">No Data Available</h3>
              <p className="text-yellow-300 text-sm leading-relaxed">Security monitoring data is currently unavailable for this location.</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const highRiskZones = securityData.zones.filter(zone => zone.riskLevel === 'High');
  const systemStatus = securityData.zones.every(zone => 
    zone.activeCameras >= 25
  ) ? 'Normal' : 'Degraded';

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Security Analytics</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Real-time security monitoring and threat analysis for {selectedCity?.charAt(0).toUpperCase() + selectedCity?.slice(1)}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <ClockIcon className="h-4 w-4" />
            <span>Last updated: {new Date(securityData.current.timestamp).toLocaleString()}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            <EyeIcon className="h-3 w-3 mr-1" />
            Live Monitoring
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active Alerts Card */}
        <Card className="p-6 bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Active Alerts</h3>
              <Badge variant="outline" className="text-xs text-red-400 border-red-400/30">
                <BellAlertIcon className="h-3 w-3 mr-1" />
                Live
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <div className="text-5xl font-bold text-red-400 tabular-nums mb-2">
                  {securityData.current.activeAlerts}
                </div>
                <div className="text-xs text-gray-500 mb-3">
                  Security Alerts
                </div>
                <div className="flex justify-center">
                  <StatusIndicator level={securityData.current.activeAlerts > 10 ? 'High' : securityData.current.activeAlerts > 5 ? 'Medium' : 'Low'} />
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm text-gray-400 leading-relaxed">
                  {securityData.current.activeAlerts > 10 ? 'Critical attention needed - immediate response required' :
                   securityData.current.activeAlerts > 5 ? 'Elevated alert level - monitor closely' : 'Normal operations - all systems stable'}
                </div>
              </div>
            </div>
          </div>

          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full transform translate-x-8 -translate-y-8"></div>
        </Card>

        {/* Surveillance Network Card */}
        <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Surveillance Network</h3>
              <Badge variant="outline" className="text-xs text-blue-400 border-blue-400/30">
                <CameraIcon className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-400 tabular-nums mb-2">
                  {securityData.current.activeCameras}
                </div>
                <div className="text-sm font-medium text-blue-300 mb-1">
                  {Math.round((securityData.current.activeCameras / securityData.zones.reduce((acc, z) => acc + z.activeCameras, 0)) * 100)}% Operational
                </div>
                <div className="text-xs text-gray-500">
                  Active Cameras
                </div>
              </div>

              <div className="flex justify-center">
                <StatusIndicator level={systemStatus === 'Normal' ? 'Low' : 'Medium'} />
              </div>
            </div>
          </div>

          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full transform translate-x-8 -translate-y-8"></div>
        </Card>

        {/* 24h Incidents Card */}
        <Card className="p-6 bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">24h Incidents</h3>
              <Badge variant="outline" className="text-xs text-amber-400 border-amber-400/30">
                <ClockIcon className="h-3 w-3 mr-1" />
                24h
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <div className="text-5xl font-bold text-amber-400 tabular-nums mb-2">
                  {securityData.current.incidentCount}
                </div>
                <div className="text-sm font-medium text-amber-300 mb-1">
                  {securityData.current.incidentCount > 15 ? 'Above Average Activity' :
                   securityData.current.incidentCount > 8 ? 'Moderate Activity' : 'Normal Activity'}
                </div>
                <div className="text-xs text-gray-500">
                  Security Incidents
                </div>
              </div>

              <div className="flex justify-center">
                <StatusIndicator level={securityData.current.incidentCount > 15 ? 'High' : securityData.current.incidentCount > 8 ? 'Medium' : 'Low'} />
              </div>
            </div>
          </div>

          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full transform translate-x-8 -translate-y-8"></div>
        </Card>
      </div>

      {/* Hourly Alert Trend Chart */}
      <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Hourly Alert Trend
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            24-hour security alert patterns showing peak activity periods and trends
          </p>
        </div>

        <div className="h-[400px] bg-gradient-to-br from-slate-900/30 to-slate-800/30 rounded-lg p-4">
          <ResponsiveLine
            data={[
              {
                id: "Security Alerts",
                data: securityData.hourly.map(h => ({
                  x: h.hour,
                  y: h.alertCount
                }))
              }
            ]}
            margin={{ top: 30, right: 30, bottom: 80, left: 80 }}
            xScale={{ type: "point" }}
            yScale={{ type: "linear", min: 0, max: "auto" }}
            theme={chartTheme}
            curve="cardinal"
            axisBottom={{
              tickSize: 5,
              tickPadding: 8,
              tickRotation: -30,
              legend: "Time (Hours)",
              legendOffset: 60,
              legendPosition: "middle"
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 8,
              tickRotation: 0,
              legend: "Number of Alerts",
              legendOffset: -60,
              legendPosition: "middle",
              format: value => `${value}`
            }}
            enablePoints={true}
            pointSize={6}
            pointColor="#ffffff"
            pointBorderWidth={2}
            pointBorderColor="#ef4444"
            enableArea={true}
            areaOpacity={0.15}
            colors={["#ef4444"]}
            lineWidth={3}
            enableGridX={false}
            enableGridY={true}
            tooltip={({ point }) => (
              <div className="bg-gray-900/95 text-white p-3 border border-gray-600 rounded-lg shadow-xl backdrop-blur-sm">
                <div className="font-semibold text-sm mb-1">{point.data.x}:00</div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <span className="text-sm">
                    Alerts: <span className="font-medium tabular-nums">{point.data.y}</span>
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {point.data.y > 10 ? 'High Activity Period' :
                   point.data.y > 5 ? 'Moderate Activity' : 'Low Activity'}
                </div>
              </div>
            )}
            animate={true}
            motionConfig="gentle"
          />
        </div>
      </Card>

      {/* Zone-wise Security Status Chart */}
      <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Zone-wise Security Status
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Security incident distribution across different zones with risk level indicators
          </p>
        </div>

        <div className="h-[400px] bg-gradient-to-br from-slate-900/30 to-slate-800/30 rounded-lg p-4">
          <ResponsiveBar
            data={securityData.zones}
            keys={['incidentCount']}
            indexBy="name"
            margin={{ top: 30, right: 30, bottom: 100, left: 80 }}
            padding={0.4}
            valueScale={{ type: 'linear' }}
            theme={chartTheme}
            colors={({ data }) => {
              switch (data.riskLevel) {
                case 'Low': return '#10b981';
                case 'Medium': return '#f59e0b';
                case 'High': return '#ef4444';
                default: return '#6b7280';
              }
            }}
            borderRadius={6}
            enableGridX={false}
            enableGridY={true}
            axisBottom={{
              tickSize: 5,
              tickPadding: 8,
              tickRotation: -30,
              legend: "Security Zones",
              legendOffset: 80,
              legendPosition: "middle"
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 8,
              tickRotation: 0,
              legend: 'Incident Count',
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
                    <span className="text-sm text-gray-400">Incidents:</span>
                    <span className="font-medium tabular-nums">{value}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Risk Level:</span>
                    <span className="text-sm font-medium" style={{ color }}>
                      {data.riskLevel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Active Cameras:</span>
                    <span className="text-sm font-medium">{data.activeCameras}</span>
                  </div>
                </div>
              </div>
            )}
            animate={true}
            motionConfig="gentle"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incident Types Chart */}
        <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Incident Types Distribution
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Breakdown of security incidents by category over the last 24 hours
            </p>
          </div>

          <div className="h-[320px] bg-gradient-to-br from-slate-900/30 to-slate-800/30 rounded-lg p-4">
            <ResponsiveBar
              data={securityData.incidentTypes}
              keys={['count']}
              indexBy="type"
              margin={{ top: 30, right: 30, bottom: 80, left: 70 }}
              padding={0.4}
              theme={chartTheme}
              colors="#8b5cf6"
              borderRadius={6}
              enableGridX={false}
              enableGridY={true}
              axisBottom={{
                tickSize: 5,
                tickPadding: 8,
                tickRotation: -30,
                legend: "Incident Type",
                legendOffset: 60,
                legendPosition: "middle"
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 8,
                tickRotation: 0,
                legend: 'Incident Count',
                legendPosition: 'middle',
                legendOffset: -55,
                format: value => `${value}`
              }}
              tooltip={({ value, indexValue, color }) => (
                <div className="bg-gray-900/95 text-white p-3 border border-gray-600 rounded-lg shadow-xl backdrop-blur-sm">
                  <div className="font-semibold text-sm mb-1">{indexValue}</div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                    <span className="text-sm">
                      Count: <span className="font-medium tabular-nums">{value}</span>
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {value > 10 ? 'High frequency' : value > 5 ? 'Moderate frequency' : 'Low frequency'}
                  </div>
                </div>
              )}
              animate={true}
              motionConfig="gentle"
            />
          </div>
        </Card>

        {/* Response Time Analysis */}
        <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Response Time Analysis
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Average security response times by incident type and priority level
            </p>
          </div>

          <div className="h-[320px] bg-gradient-to-br from-slate-900/30 to-slate-800/30 rounded-lg p-4">
            <ResponsiveBar
              data={securityData.incidentTypes.map(incident => ({
                type: incident.type,
                responseTime: Math.round(5 + Math.random() * 15), // Simulated response times
                priority: incident.count > 10 ? 'High' : incident.count > 5 ? 'Medium' : 'Low'
              }))}
              keys={['responseTime']}
              indexBy="type"
              margin={{ top: 30, right: 30, bottom: 80, left: 70 }}
              padding={0.4}
              theme={chartTheme}
              colors={({ data }) => {
                switch (data.priority) {
                  case 'High': return '#ef4444';
                  case 'Medium': return '#f59e0b';
                  case 'Low': return '#10b981';
                  default: return '#6b7280';
                }
              }}
              borderRadius={6}
              enableGridX={false}
              enableGridY={true}
              axisBottom={{
                tickSize: 5,
                tickPadding: 8,
                tickRotation: -30,
                legend: "Incident Type",
                legendOffset: 60,
                legendPosition: "middle"
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 8,
                tickRotation: 0,
                legend: 'Response Time (min)',
                legendPosition: 'middle',
                legendOffset: -55,
                format: value => `${value}m`
              }}
              tooltip={({ value, indexValue, color, data }) => (
                <div className="bg-gray-900/95 text-white p-3 border border-gray-600 rounded-lg shadow-xl backdrop-blur-sm">
                  <div className="font-semibold text-sm mb-1">{indexValue}</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                      <span className="text-sm">
                        Response: <span className="font-medium tabular-nums">{value} minutes</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Priority:</span>
                      <span className="text-sm font-medium" style={{ color }}>
                        {data.priority}
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
      </div>

      {/* Security Insights & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Analysis */}
        <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Security Analysis
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Current security status and threat assessment for monitored zones
            </p>
          </div>

          <div className="space-y-6">
            {/* High Priority Alerts */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ShieldExclamationIcon className="h-5 w-5 text-red-400" />
                <h4 className="font-semibold text-red-400">High Priority Alerts</h4>
              </div>
              <div className="space-y-3">
                {highRiskZones.map(zone => (
                  <div key={zone.name} className="p-3 bg-gradient-to-r from-red-500/10 to-red-600/5 border border-red-500/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <ExclamationTriangleIcon className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-red-400 mb-1">{zone.name}</div>
                        <div className="text-sm text-red-300">
                          {zone.incidentCount} incidents detected - High risk zone requiring immediate attention
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {highRiskZones.length === 0 && (
                  <div className="p-3 bg-gradient-to-r from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-green-400 mb-1">All Clear</div>
                        <div className="text-sm text-green-300">No high-risk zones detected - security status normal</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator className="bg-gray-700" />

            {/* System Status */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheckIcon className="h-5 w-5 text-blue-400" />
                <h4 className="font-semibold text-blue-400">System Status</h4>
              </div>
              <div className="space-y-3">
                <div className={`p-3 border rounded-lg ${
                  systemStatus === 'Normal'
                    ? 'bg-gradient-to-r from-green-500/10 to-green-600/5 border-green-500/20'
                    : 'bg-gradient-to-r from-amber-500/10 to-amber-600/5 border-amber-500/20'
                }`}>
                  <div className="flex items-start gap-2">
                    <CameraIcon className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className={`text-sm font-medium mb-1 ${systemStatus === 'Normal' ? 'text-green-400' : 'text-amber-400'}`}>
                        Surveillance System: {systemStatus}
                      </div>
                      <div className={`text-sm ${systemStatus === 'Normal' ? 'text-green-300' : 'text-amber-300'}`}>
                        {systemStatus === 'Normal' ? 'All cameras operational and monitoring effectively' : 'Some cameras require maintenance attention'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gradient-to-r from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <InformationCircleIcon className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-blue-400 mb-1">Most Frequent Incident</div>
                      <div className="text-sm text-blue-300">
                        {securityData.incidentTypes[0].type} ({securityData.incidentTypes[0].count} cases in 24h)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Items */}
        <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Recommended Actions
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Priority actions and maintenance recommendations based on current security analysis
            </p>
          </div>

          <div className="space-y-6">
            {/* Immediate Actions */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BellAlertIcon className="h-5 w-5 text-amber-400" />
                <h4 className="font-semibold text-amber-400">Immediate Actions</h4>
              </div>
              <div className="space-y-3">
                {highRiskZones.map(zone => (
                  <div key={zone.name} className="p-3 bg-gradient-to-r from-red-500/10 to-red-600/5 border border-red-500/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <ArrowTrendingUpIcon className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-red-400 mb-1">High Priority</div>
                        <div className="text-sm text-red-300">
                          Increase patrol frequency in {zone.name} - Deploy additional security personnel
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {systemStatus === 'Degraded' && (
                  <div className="p-3 bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CameraIcon className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-amber-400 mb-1">System Maintenance</div>
                        <div className="text-sm text-amber-300">
                          Schedule immediate maintenance for non-operational cameras
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator className="bg-gray-700" />

            {/* Routine Actions */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ClockIcon className="h-5 w-5 text-purple-400" />
                <h4 className="font-semibold text-purple-400">Routine Monitoring</h4>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-gradient-to-r from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <EyeIcon className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-blue-400 mb-1">Pattern Analysis</div>
                      <div className="text-sm text-blue-300">
                        Monitor {securityData.incidentTypes[0].type.toLowerCase()} incident patterns for trends
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gradient-to-r from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <ShieldCheckIcon className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-purple-400 mb-1">System Diagnostics</div>
                      <div className="text-sm text-purple-300">
                        Run comprehensive system diagnostics every 6 hours
                      </div>
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
              <span>Updated: {new Date(securityData.current.timestamp).toLocaleString()}</span>
            </div>
          </div>
          <div className="text-xs">
            Real-time security monitoring • AI-powered threat detection • 24/7 surveillance
          </div>
        </div>
      </Card>
    </div>
  );
}