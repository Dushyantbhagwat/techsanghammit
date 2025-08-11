import { useEffect, useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveHeatMap } from "@nivo/heatmap";
import {
  Lightbulb,
  Zap,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  MapPin,
  Clock,
  Settings,
  Wifi,
  Sun,
  Moon,
  RefreshCw,
  Download,
  Eye,
  Target,
  BarChart3,
  Shield,
  Leaf
} from "lucide-react";
import { useCity } from "@/contexts/CityContext";
import { useSettings } from "@/contexts/SettingsContext";
import { fetchStreetLightData, type StreetLightData } from "@/services/streetlight";

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

type ViewMode = 'overview' | 'zones' | 'efficiency' | 'maintenance';
type TimeRange = '24h' | '7d' | '30d' | '1y';

export function StreetLightAnalytics() {
  const { selectedCity } = useCity();
  const { settings } = useSettings();
  const [data, setData] = useState<StreetLightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchStreetLightData(selectedCity);
      setData(result);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching street light data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCity]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh data
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadData();
    }, settings.dashboard.refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, loadData, settings.dashboard.refreshInterval]);

  // Enhanced data processing with city-specific insights
  const enhancedData = useMemo(() => {
    if (!data) return null;

    const cityCharacteristics = data.cityCharacteristics;

    // Calculate performance metrics
    const operationalEfficiency = (data.current.activeLights / data.current.totalLights) * 100;
    const energyEfficiency = data.energyStats.efficiency.currentMonth;
    const maintenanceScore = data.current.maintenanceScore;

    // Calculate cost savings from smart features
    const smartSavings = {
      dimming: cityCharacteristics.operationalPatterns.dimming ? 15 : 0,
      motionSensors: cityCharacteristics.operationalPatterns.motionSensors ? 25 : 0,
      smartControls: cityCharacteristics.operationalPatterns.smartControls ? 20 : 0
    };

    const totalSmartSavings = Object.values(smartSavings).reduce((sum, saving) => sum + saving, 0);

    // Calculate environmental impact
    const carbonFootprint = data.energyStats.monthly * 0.82; // kg CO2 per kWh
    const carbonSavings = carbonFootprint * (totalSmartSavings / 100);

    return {
      ...data,
      metrics: {
        operationalEfficiency,
        energyEfficiency,
        maintenanceScore,
        smartSavings,
        totalSmartSavings,
        carbonFootprint,
        carbonSavings
      }
    };
  }, [data]);

  // Chart data preparation
  const chartData = useMemo(() => {
    if (!enhancedData) return { hourly: [], zones: [], efficiency: [] };

    // Hourly energy consumption chart
    const hourlyData = [{
      id: "Energy Usage",
      data: enhancedData.hourly.map(h => ({
        x: h.hour,
        y: h.energyUsage
      }))
    }];

    // Zone performance chart
    const zoneData = enhancedData.zones.map(zone => ({
      zone: zone.name,
      lights: zone.lightCount,
      efficiency: zone.energyEfficiency * 10,
      faults: enhancedData.faultReport.find(f => f.zone === zone.name)?.count || 0,
      priority: zone.priorityLevel === 'critical' ? 4 :
                zone.priorityLevel === 'high' ? 3 :
                zone.priorityLevel === 'medium' ? 2 : 1
    }));

    // Efficiency trends
    const efficiencyData = [{
      id: "Efficiency Trend",
      data: [
        { x: "Jan", y: enhancedData.energyStats.efficiency.yearOverYear },
        { x: "Feb", y: enhancedData.energyStats.efficiency.yearOverYear + 2 },
        { x: "Mar", y: enhancedData.energyStats.efficiency.previousMonth },
        { x: "Apr", y: enhancedData.energyStats.efficiency.currentMonth }
      ]
    }];

    return { hourly: hourlyData, zones: zoneData, efficiency: efficiencyData };
  }, [enhancedData]);

  const exportData = () => {
    if (!enhancedData) return;

    const exportData = {
      timestamp: new Date().toISOString(),
      city: selectedCity,
      metrics: enhancedData.metrics,
      zones: enhancedData.zones,
      faultReport: enhancedData.faultReport,
      energyStats: enhancedData.energyStats,
      smartFeatures: enhancedData.smartFeatures
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `streetlight-analytics-${selectedCity}-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading || !enhancedData) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading street light data...</span>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">Street Light Analytics</h2>
          <Badge variant={enhancedData.metrics.operationalEfficiency >= 95 ? "default" :
                         enhancedData.metrics.operationalEfficiency >= 90 ? "secondary" : "destructive"}>
            {enhancedData.metrics.operationalEfficiency >= 95 ? 'Excellent' :
             enhancedData.metrics.operationalEfficiency >= 90 ? 'Good' : 'Needs Attention'}
          </Badge>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Selector */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {(['overview', 'zones', 'efficiency', 'maintenance'] as ViewMode[]).map((mode) => (
              <Button
                key={mode}
                variant={viewMode === mode ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode(mode)}
                className="text-xs capitalize"
              >
                {mode === 'overview' && <Eye className="h-3 w-3 mr-1" />}
                {mode === 'zones' && <MapPin className="h-3 w-3 mr-1" />}
                {mode === 'efficiency' && <Leaf className="h-3 w-3 mr-1" />}
                {mode === 'maintenance' && <Settings className="h-3 w-3 mr-1" />}
                {mode}
              </Button>
            ))}
          </div>

          {/* Action Buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 ${autoRefresh ? 'text-green-600' : ''}`}
          >
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={exportData}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* City Information */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>City: {selectedCity?.charAt(0).toUpperCase() + selectedCity?.slice(1)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {enhancedData.cityCharacteristics.cityType.replace('_', ' ').toUpperCase()}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {enhancedData.cityCharacteristics.infrastructureAge} infrastructure
            </Badge>
            <Badge variant="outline" className="text-xs">
              {enhancedData.cityCharacteristics.lightingRequirements.energyEfficiencyFocus} efficiency focus
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          <span>Real-time monitoring active</span>
        </div>
      </div>

      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Total Lights</h3>
            <Lightbulb className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold">{enhancedData.current.totalLights.toLocaleString()}</span>
            <div className="text-xs text-blue-500">
              {enhancedData.cityCharacteristics.baseMetrics.lightsPerKm} per km
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Infrastructure coverage across {enhancedData.zones.length} zones
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Active Lights</h3>
            <Zap className="h-4 w-4 text-green-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold">{enhancedData.current.activeLights.toLocaleString()}</span>
            <div className="flex items-center gap-1 text-green-500">
              <TrendingUp className="h-3 w-3" />
              <span className="text-xs">{enhancedData.metrics.operationalEfficiency.toFixed(1)}%</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {enhancedData.current.faultyLights} lights need attention
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Energy Efficiency</h3>
            <Leaf className="h-4 w-4 text-purple-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold">{enhancedData.metrics.energyEfficiency.toFixed(1)}%</span>
            <div className="flex items-center gap-1 text-purple-500">
              <TrendingUp className="h-3 w-3" />
              <span className="text-xs">+{(enhancedData.energyStats.efficiency.currentMonth - enhancedData.energyStats.efficiency.previousMonth).toFixed(1)}%</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Target: {enhancedData.energyStats.efficiency.targetEfficiency}%
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-600/5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Smart Savings</h3>
            <Settings className="h-4 w-4 text-orange-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold">{enhancedData.metrics.totalSmartSavings}%</span>
            <div className="flex items-center gap-1 text-orange-500">
              <Leaf className="h-3 w-3" />
              <span className="text-xs">CO₂ saved</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {enhancedData.metrics.carbonSavings.toFixed(0)} kg CO₂/month
          </div>
        </Card>
      </div>

      {/* Main Content Based on View Mode */}
      {viewMode === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Energy Consumption Chart */}
          <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5" />
              24-Hour Energy Consumption
            </h3>
            <div className="h-[350px]">
              <ResponsiveLine
                data={chartData.hourly}
                margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
                xScale={{ type: "point" }}
                yScale={{ type: "linear", min: 0, max: "auto" }}
                curve="cardinal"
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: -45,
                  legend: "Hour",
                legendOffset: 70,
                legendPosition: "middle"
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 16,
                tickRotation: 0,
                legend: "Energy Usage (kWh)",
                legendOffset: -50,
                legendPosition: "middle"
              }}
              theme={chartTheme}
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
            />
          </div>
        </Card>

          {/* Zone Performance Chart */}
          <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Zone Performance Overview
            </h3>
            <div className="h-[350px]">
              <ResponsiveBar
                data={chartData.zones}
                keys={['lights']}
                indexBy="zone"
                margin={{ top: 20, right: 20, bottom: 80, left: 60 }}
                padding={0.3}
                colors={({ data }) =>
                  data.priority === 4 ? '#ef4444' :
                  data.priority === 3 ? '#f59e0b' :
                  data.priority === 2 ? '#3b82f6' : '#10b981'
                }
                borderRadius={4}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: -45,
                  legend: 'Zone',
                  legendOffset: 70,
                  legendPosition: 'middle'
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Light Count',
                  legendOffset: -50,
                  legendPosition: 'middle'
                }}
                theme={{
                  textColor: "#ffffff",
                  axis: {
                    domain: { line: { stroke: "#ffffff" } },
                    ticks: {
                      line: { stroke: "#ffffff" },
                      text: { fill: "#ffffff", fontSize: 12 }
                    },
                    legend: {
                      text: { fill: "#ffffff", fontSize: 14 }
                    }
                  },
                  grid: {
                    line: { stroke: "#ffffff", strokeOpacity: 0.1 }
                  }
                }}
                enableGridX={false}
                enableGridY={true}
                onClick={(data) => setSelectedZone(data.data.zone)}
                tooltip={({ data }) => (
                  <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg">
                    <strong>{data.zone}</strong>
                    <br />
                    Lights: {data.lights}
                    <br />
                    Efficiency: {data.efficiency.toFixed(1)}%
                    <br />
                    Faults: {data.faults}
                  </div>
                )}
              />
            </div>
          </Card>
        </div>
      )}

      {/* Zones Detail View */}
      {viewMode === 'zones' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enhancedData.zones.map((zone, index) => {
              const faultData = enhancedData.faultReport.find(f => f.zone === zone.name);
              const faultCount = faultData?.count || 0;
              const operationalRate = ((zone.lightCount - faultCount) / zone.lightCount) * 100;

              return (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{zone.name}</h3>
                    <Badge variant={
                      zone.priorityLevel === 'critical' ? 'destructive' :
                      zone.priorityLevel === 'high' ? 'secondary' : 'default'
                    }>
                      {zone.priorityLevel}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Total Lights:</span>
                      <span className="font-medium">{zone.lightCount}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span>Operational:</span>
                      <span className={`font-medium ${operationalRate >= 95 ? 'text-green-500' : operationalRate >= 90 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {operationalRate.toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span>Energy Efficiency:</span>
                      <span className="font-medium">{zone.energyEfficiency}/10</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span>Zone Type:</span>
                      <Badge variant="outline" className="text-xs">
                        {zone.type}
                      </Badge>
                    </div>

                    {faultData && (
                      <div className="pt-2 border-t">
                        <div className="flex justify-between text-sm">
                          <span>Active Faults:</span>
                          <span className={`font-medium ${faultData.status === 'critical' ? 'text-red-500' : faultData.status === 'moderate' ? 'text-yellow-500' : 'text-blue-500'}`}>
                            {faultCount}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Type: {faultData.type} • ETA: {faultData.estimatedRepairTime}
                        </div>
                      </div>
                    )}

                    {zone.specialFeatures && (
                      <div className="pt-2 border-t">
                        <div className="text-xs text-gray-500 mb-1">Special Features:</div>
                        <div className="flex flex-wrap gap-1">
                          {zone.specialFeatures.map((feature, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <h3 className="text-lg font-semibold mb-4">Fault Distribution by Severity</h3>
          <div className="h-[350px] -mt-2">
            <ResponsiveBar
              data={[
                {
                  status: "Critical",
                  count: data.faultReport.filter(f => f.status === 'critical').reduce((acc, curr) => acc + curr.count, 0),
                  color: "#FF4560"
                },
                {
                  status: "Moderate",
                  count: data.faultReport.filter(f => f.status === 'moderate').reduce((acc, curr) => acc + curr.count, 0),
                  color: "#FEB019"
                },
                {
                  status: "Minor",
                  count: data.faultReport.filter(f => f.status === 'minor').reduce((acc, curr) => acc + curr.count, 0),
                  color: "#00E396"
                }
              ]}
              keys={['count']}
              indexBy="status"
              margin={{ top: 40, right: 20, bottom: 90, left: 60 }}
              padding={0.3}
              colors={({ data }) => data.color}
              borderRadius={4}
              axisBottom={{
                tickSize: 5,
                tickPadding: 20,
                tickRotation: -45,
                legend: "Severity Level",
                legendOffset: 70,
                legendPosition: "middle"
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 16,
                tickRotation: 0,
                legend: 'Number of Faults',
                legendPosition: 'middle',
                legendOffset: -50
              }}
              theme={chartTheme}
              enableGridX={false}
              enableGridY={false}
            />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <h3 className="text-lg font-semibold mb-4">City-Specific Insights</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3 text-blue-400">
                {enhancedData.cityCharacteristics.cityType.replace('_', ' ').toUpperCase()} Characteristics
              </h4>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Infrastructure Age: {enhancedData.cityCharacteristics.infrastructureAge}</li>
                <li>Energy Efficiency Focus: {enhancedData.cityCharacteristics.lightingRequirements.energyEfficiencyFocus}</li>
                <li>Security Level: {enhancedData.cityCharacteristics.lightingRequirements.securityLevel}</li>
                <li>Smart Features: {Object.values(enhancedData.smartFeatures).filter(Boolean).length}/5 active</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-amber-400">Recommendations</h4>
              <ul className="list-disc list-inside space-y-2 text-sm">
                {enhancedData.cityCharacteristics.infrastructureAge === 'aging' && (
                  <li>Consider LED retrofit program to improve efficiency</li>
                )}
                {enhancedData.metrics.operationalEfficiency < 95 && (
                  <li>Prioritize fault resolution in critical zones</li>
                )}
                {!enhancedData.smartFeatures.predictiveMaintenance && (
                  <li>Deploy predictive maintenance sensors</li>
                )}
                <li>Optimize maintenance schedule: {enhancedData.cityCharacteristics.maintenanceSchedule.frequency}</li>
                <li>Monthly energy: {enhancedData.energyStats.monthly.toLocaleString()} kWh</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}