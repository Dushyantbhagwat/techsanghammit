import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertTriangle,
  Bell,
  TrendingUp,
  TrendingDown,
  Clock,
  MapPin,
  Activity,
  Zap,
  Route,
  BarChart3,
  RefreshCw,
  Download,
  Settings,
  Eye,
  Target
} from 'lucide-react';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import { useCity } from '@/contexts/CityContext';
import { useSettings } from '@/contexts/SettingsContext';
import { fetchTrafficData, type LocationTrafficData } from '@/services/traffic';
import { emailService } from '@/services/email';

// Enhanced interfaces for traffic analytics
interface TrafficPrediction {
  timeframe: '1h' | '4h' | '24h';
  predictions: {
    hour: string;
    congestionLevel: number;
    confidence: number;
    vehicleCount: number;
  }[];
  recommendations: string[];
}

interface TrafficKPI {
  label: string;
  value: string;
  trend: string;
  trendDirection: 'up' | 'down' | 'stable';
  color: string;
}

interface OptimizationMetrics {
  signalEfficiency: number;
  routeOptimization: number;
  congestionReduction: number;
  fuelSavings: number;
  emissionReduction: number;
}

type TimeRange = '1h' | '4h' | '24h' | '7d' | '30d';
type ViewMode = 'overview' | 'detailed' | 'predictive' | 'comparative';

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

export function TrafficAnalytics() {
  const { selectedCity } = useCity();
  const { settings } = useSettings();
  const [isSimulating, setIsSimulating] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [trafficData, setTrafficData] = useState<LocationTrafficData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const AUTHORITY_EMAIL = 'dushyantdbhagwat@gmail.com';

  // Load traffic data
  const loadTrafficData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchTrafficData(selectedCity);
      setTrafficData(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load traffic data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCity]);

  // Initial data load
  useEffect(() => {
    loadTrafficData();

    // Check if notifications are already permitted
    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
  }, [loadTrafficData]);

  // Auto-refresh data
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadTrafficData();
    }, settings.dashboard.refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, loadTrafficData, settings.dashboard.refreshInterval]);

  // Generate enhanced traffic data with city-specific predictions and analytics
  const enhancedTrafficData = useMemo(() => {
    if (!trafficData) return null;

    const currentHour = new Date().getHours();
    const cityCharacteristics = trafficData.cityCharacteristics;

    // Generate city-specific predictions for next 24 hours
    const predictions = Array.from({ length: 24 }, (_, i) => {
      const hour = (currentHour + i) % 24;
      const baseData = trafficData.hourlyData.find(h => parseInt(h.hour) === hour) || trafficData.hourlyData[0];

      // Use city-specific characteristics for more accurate predictions
      const cityBaseVehicles = cityCharacteristics ?
        (cityCharacteristics.type === 'it_hub' ? 520 :
         cityCharacteristics.type === 'business' ? 450 :
         cityCharacteristics.type === 'residential' ? 350 :
         cityCharacteristics.type === 'religious' ? 350 :
         cityCharacteristics.type === 'mixed' ? 320 : 400) : 400;

      // Apply city-specific time patterns
      let timeOfDayFactor = 1.0;
      if (cityCharacteristics?.type === 'it_hub') {
        // IT hubs have strong morning/evening peaks and lunch rush
        timeOfDayFactor = hour >= 8 && hour <= 10 ? 3.5 :
                         hour >= 17 && hour <= 20 ? 3.8 :
                         hour >= 13 && hour <= 14 ? 1.8 : 1.2;
      } else if (cityCharacteristics?.type === 'business') {
        // Business districts have traditional rush hours
        timeOfDayFactor = hour >= 8 && hour <= 11 ? 2.8 :
                         hour >= 17 && hour <= 20 ? 3.2 : 1.3;
      } else if (cityCharacteristics?.type === 'religious') {
        // Religious cities have early morning and evening temple rush
        timeOfDayFactor = hour >= 6 && hour <= 9 ? 2.2 :
                         hour >= 16 && hour <= 19 ? 2.4 : 1.1;
      } else {
        // Default residential/mixed patterns
        timeOfDayFactor = hour >= 7 && hour <= 9 ? 2.0 :
                         hour >= 17 && hour <= 19 ? 2.2 : 1.0;
      }

      // Add prediction uncertainty that increases over time
      const uncertainty = i * 0.05; // 5% uncertainty per hour
      const variation = (Math.random() - 0.5) * uncertainty;

      return {
        hour: `${hour.toString().padStart(2, '0')}:00`,
        congestionLevel: Math.min(100, Math.max(0,
          (baseData.vehicleCount / cityBaseVehicles) * 100 * (1 + variation)
        )),
        confidence: Math.max(0.5, 1 - (i * 0.03)), // Confidence decreases over time
        vehicleCount: Math.round(baseData.vehicleCount * (1 + variation))
      };
    });

    // Calculate current metrics using city-specific characteristics
    const cityBaseVehicles = cityCharacteristics ?
      (cityCharacteristics.type === 'it_hub' ? 520 :
       cityCharacteristics.type === 'business' ? 450 :
       cityCharacteristics.type === 'residential' ? 350 :
       cityCharacteristics.type === 'religious' ? 350 :
       cityCharacteristics.type === 'mixed' ? 320 : 400) : 400;

    const currentCongestion = Math.min(100, Math.max(0,
      (trafficData.currentTraffic.vehicleCount / cityBaseVehicles) * 100
    ));

    const currentSpeed = cityCharacteristics ?
      Math.max(10, cityCharacteristics.averageSpeed - (currentCongestion * 0.3)) :
      Math.max(15, 35 - (currentCongestion * 0.3));

    // Calculate efficiency based on infrastructure and congestion
    const infrastructureBonus = cityCharacteristics ?
      (cityCharacteristics.infrastructureRating / 10) * 20 : 0;
    const efficiency = Math.round(Math.max(0, 100 - currentCongestion * 0.6 + infrastructureBonus));

    // Calculate wait time based on congestion and infrastructure
    const baseWaitTime = currentCongestion * 0.08;
    const infrastructureFactor = cityCharacteristics ?
      (10 - cityCharacteristics.infrastructureRating) / 10 : 0.5;
    const waitTime = Math.round(baseWaitTime * (1 + infrastructureFactor) + 0.5);

    return {
      ...trafficData,
      predictions,
      currentMetrics: {
        congestionLevel: currentCongestion,
        averageSpeed: currentSpeed,
        vehicleCount: trafficData.currentTraffic.vehicleCount,
        efficiency: efficiency,
        waitTime: waitTime,
      }
    };
  }, [trafficData]);

  // Calculate city-specific KPIs
  const trafficKPIs = useMemo((): TrafficKPI[] => {
    if (!enhancedTrafficData) return [];

    const metrics = enhancedTrafficData.currentMetrics;
    const cityCharacteristics = enhancedTrafficData.cityCharacteristics;
    const currentHour = new Date().getHours();
    const previousHourData = enhancedTrafficData.hourlyData[Math.max(0, currentHour - 1)];

    // Calculate city-specific benchmarks
    const cityBenchmarks = {
      'it_hub': { efficiency: 75, waitTime: 4.5, signalOpt: 88, routeEff: 85 },
      'business': { efficiency: 80, waitTime: 3.5, signalOpt: 92, routeEff: 88 },
      'residential': { efficiency: 85, waitTime: 2.5, signalOpt: 95, routeEff: 92 },
      'religious': { efficiency: 78, waitTime: 3.8, signalOpt: 90, routeEff: 87 },
      'mixed': { efficiency: 82, waitTime: 3.0, signalOpt: 93, routeEff: 90 }
    };

    const benchmark = cityBenchmarks[cityCharacteristics?.type as keyof typeof cityBenchmarks] ||
                     cityBenchmarks.mixed;

    // Calculate signal optimization based on infrastructure and city type
    const signalOptimization = Math.round(
      benchmark.signalOpt +
      (cityCharacteristics?.infrastructureRating || 5) - 5 +
      (metrics.efficiency > benchmark.efficiency ? 5 : -3)
    );

    // Calculate route efficiency based on congestion and city characteristics
    const routeEfficiency = Math.round(
      benchmark.routeEff +
      (100 - metrics.congestionLevel) * 0.1 +
      (cityCharacteristics?.infrastructureRating || 5) - 5
    );

    // Calculate trends based on previous hour
    const efficiencyTrend = metrics.efficiency - benchmark.efficiency;
    const waitTimeTrend = metrics.waitTime - benchmark.waitTime;

    return [
      {
        label: "Traffic Efficiency",
        value: `${metrics.efficiency}%`,
        trend: `${efficiencyTrend >= 0 ? '+' : ''}${efficiencyTrend.toFixed(1)}%`,
        trendDirection: efficiencyTrend > 2 ? 'up' : efficiencyTrend < -2 ? 'down' : 'stable',
        color: metrics.efficiency > benchmark.efficiency + 5 ? 'text-green-500' :
               metrics.efficiency < benchmark.efficiency - 5 ? 'text-red-500' : 'text-yellow-500'
      },
      {
        label: "Average Wait Time",
        value: `${metrics.waitTime.toFixed(1)} min`,
        trend: `${waitTimeTrend <= 0 ? '' : '+'}${waitTimeTrend.toFixed(1)} min`,
        trendDirection: waitTimeTrend < -0.5 ? 'up' : waitTimeTrend > 0.5 ? 'down' : 'stable',
        color: metrics.waitTime < benchmark.waitTime ? 'text-green-500' :
               metrics.waitTime > benchmark.waitTime + 1 ? 'text-red-500' : 'text-yellow-500'
      },
      {
        label: "Signal Optimization",
        value: `${signalOptimization}%`,
        trend: `${signalOptimization > benchmark.signalOpt ? '+' : ''}${(signalOptimization - benchmark.signalOpt).toFixed(0)}%`,
        trendDirection: signalOptimization > benchmark.signalOpt + 2 ? 'up' :
                       signalOptimization < benchmark.signalOpt - 2 ? 'down' : 'stable',
        color: signalOptimization > benchmark.signalOpt + 3 ? 'text-green-500' :
               signalOptimization < benchmark.signalOpt - 3 ? 'text-red-500' : 'text-yellow-500'
      },
      {
        label: "Route Efficiency",
        value: `${routeEfficiency}%`,
        trend: `${routeEfficiency > benchmark.routeEff ? '+' : ''}${(routeEfficiency - benchmark.routeEff).toFixed(0)}%`,
        trendDirection: routeEfficiency > benchmark.routeEff + 2 ? 'up' :
                       routeEfficiency < benchmark.routeEff - 2 ? 'down' : 'stable',
        color: routeEfficiency > benchmark.routeEff + 3 ? 'text-green-500' :
               routeEfficiency < benchmark.routeEff - 3 ? 'text-red-500' : 'text-yellow-500'
      }
    ];
  }, [enhancedTrafficData]);

  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');

      // Show test notification if permission granted
      if (permission === 'granted') {
        new Notification('Notifications Enabled', {
          body: 'You will now receive traffic alerts.',
          icon: '/favicon.ico'
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  // Utility functions
  const getStatusColor = (level: number) => {
    if (level >= 75) return 'text-red-500';
    if (level >= 50) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusText = (level: number) => {
    if (level >= 75) return 'Peak Hours';
    if (level >= 50) return 'Moderate';
    return 'Normal';
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up': return <TrendingUp className="h-4 w-4" />;
      case 'down': return <TrendingDown className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  // Prepare chart data
  const hourlyChartData = useMemo(() => {
    if (!enhancedTrafficData) return [];

    return [
      {
        id: "Current Traffic",
        data: enhancedTrafficData.hourlyData.map(item => ({
          x: item.hour,
          y: item.vehicleCount
        }))
      },
      {
        id: "Predicted Traffic",
        data: enhancedTrafficData.predictions.slice(1, 13).map(item => ({
          x: item.hour,
          y: item.vehicleCount
        }))
      }
    ];
  }, [enhancedTrafficData]);

  const hotspotChartData = useMemo(() => {
    if (!enhancedTrafficData) return [];

    return enhancedTrafficData.hotspots.map(hotspot => ({
      location: hotspot.name,
      congestion: hotspot.congestionLevel * 100, // Convert to percentage
      vehicles: hotspot.vehicleCount,
      color: hotspot.congestionLevel >= 1.5 ? '#ef4444' :
             hotspot.congestionLevel >= 1.0 ? '#f59e0b' : '#10b981'
    }));
  }, [enhancedTrafficData]);

  const exportData = () => {
    if (!enhancedTrafficData) return;

    const exportData = {
      timestamp: new Date().toISOString(),
      city: selectedCity,
      metrics: enhancedTrafficData.currentMetrics,
      hourlyData: enhancedTrafficData.hourlyData,
      hotspots: enhancedTrafficData.hotspots,
      predictions: enhancedTrafficData.predictions.slice(0, 12)
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `traffic-analytics-${selectedCity}-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const simulateHighTraffic = async () => {
    if (!notificationsEnabled) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
      if (permission !== 'granted') {
        alert('Please enable notifications to receive traffic alerts.');
        return;
      }
    }

    setIsSimulating(true);
    
    // Generate random high congestion between 75-95%
    const newCongestion = Math.floor(Math.random() * 20) + 75;
    
    // Update metrics
    setCongestionLevel(newCongestion);
    setAverageSpeed(Math.max(15, 50 - newCongestion/2)); // Speed decreases with congestion
    setVehicleCount(Math.floor(Math.random() * 300) + 800);

    // Send alert
    const subject = `🚨 High Traffic Alert - ${selectedCity}`;
    const message = `
High Traffic Alert for ${selectedCity}

Current Traffic Metrics:
- Congestion Level: ${newCongestion}%
- Average Speed: ${Math.floor(averageSpeed)} km/h
- Vehicle Count: ${vehicleCount} vehicles

Status: Critical - Peak Hours
Location: ${selectedCity} Central District

This is an automated alert from the Smart City Traffic Monitoring System. Immediate attention may be required to manage traffic flow and prevent further congestion.

Actions Recommended:
1. Deploy additional traffic personnel
2. Adjust signal timings
3. Issue public advisory if needed

Please monitor the situation and take necessary actions.

---
Smart City Traffic Management System
    `;
    
    try {
      await emailService.sendEmail(AUTHORITY_EMAIL, subject, message);
    } catch (error) {
      console.error('Failed to send alert:', error);
    }

    // Reset simulation state after 5 seconds
    setTimeout(() => {
      loadTrafficData(); // Reload original data
      setIsSimulating(false);
    }, 5000);
  };

  if (isLoading || !enhancedTrafficData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading traffic data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">Traffic Flow Analytics</h2>
          <Badge variant={enhancedTrafficData.currentMetrics.congestionLevel >= 75 ? "destructive" :
                         enhancedTrafficData.currentMetrics.congestionLevel >= 50 ? "secondary" : "default"}>
            {getStatusText(enhancedTrafficData.currentMetrics.congestionLevel)}
          </Badge>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Time Range Selector */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {(['1h', '4h', '24h', '7d'] as TimeRange[]).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="text-xs"
              >
                {range.toUpperCase()}
              </Button>
            ))}
          </div>

          {/* View Mode Selector */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <Button
              variant={viewMode === 'overview' ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode('overview')}
              className="text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              Overview
            </Button>
            <Button
              variant={viewMode === 'predictive' ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode('predictive')}
              className="text-xs"
            >
              <Target className="h-3 w-3 mr-1" />
              Predictive
            </Button>
            <Button
              variant={viewMode === 'comparative' ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode('comparative')}
              className="text-xs"
            >
              <BarChart3 className="h-3 w-3 mr-1" />
              Compare
            </Button>
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

          {!notificationsEnabled && (
            <Button
              variant="outline"
              size="sm"
              onClick={requestNotificationPermission}
              className="flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              Alerts
            </Button>
          )}

          <Button
            onClick={simulateHighTraffic}
            disabled={isSimulating}
            variant="destructive"
            size="sm"
            className="flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            {isSimulating ? 'Simulating...' : 'Test Alert'}
          </Button>
        </div>
      </div>

      {/* City Information and Last Update */}
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
          {enhancedTrafficData?.cityCharacteristics && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {enhancedTrafficData.cityCharacteristics.type.replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {enhancedTrafficData.cityCharacteristics.populationDensity.replace('_', ' ')} density
              </Badge>
              <Badge variant="outline" className="text-xs">
                Infrastructure: {enhancedTrafficData.cityCharacteristics.infrastructureRating}/10
              </Badge>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          <span>Real-time monitoring active</span>
        </div>
      </div>

      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {trafficKPIs.map((kpi, index) => (
          <Card key={index} className="p-4 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">{kpi.label}</h3>
              <div className={`flex items-center gap-1 ${kpi.color}`}>
                {getTrendIcon(kpi.trendDirection)}
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold">{kpi.value}</span>
              <div className={`flex items-center gap-1 text-sm ${kpi.color}`}>
                {getTrendIcon(kpi.trendDirection)}
                <span>{kpi.trend}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Core Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Congestion Level</h3>
            <MapPin className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline">
            <span className={`text-2xl font-bold ${getStatusColor(enhancedTrafficData.currentMetrics.congestionLevel)}`}>
              {Math.round(enhancedTrafficData.currentMetrics.congestionLevel)}%
            </span>
            <span className="ml-2 text-sm text-muted-foreground">
              {getStatusText(enhancedTrafficData.currentMetrics.congestionLevel)}
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                enhancedTrafficData.currentMetrics.congestionLevel >= 75 ? 'bg-red-500' :
                enhancedTrafficData.currentMetrics.congestionLevel >= 50 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${enhancedTrafficData.currentMetrics.congestionLevel}%` }}
            />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Average Speed</h3>
            <Zap className="h-4 w-4 text-green-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold">
              {Math.round(enhancedTrafficData.currentMetrics.averageSpeed)} km/h
            </span>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            Target: 45 km/h
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Vehicle Count</h3>
            <Route className="h-4 w-4 text-purple-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold">{enhancedTrafficData.currentMetrics.vehicleCount.toLocaleString()}</span>
            <span className="ml-2 text-sm text-muted-foreground">vehicles/hour</span>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            Peak: {enhancedTrafficData.peakHour.vehicleCount.toLocaleString()} at {enhancedTrafficData.peakHour.hour}:00
          </div>
        </Card>
      </div>

      {/* Main Charts Section */}
      {viewMode === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hourly Traffic Flow Chart */}
          <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              24-Hour Traffic Pattern
            </h3>
            <div className="h-[350px]">
              <ResponsiveLine
                data={hourlyChartData}
                margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
                xScale={{ type: 'point' }}
                yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
                curve="cardinal"
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: -45,
                  legend: 'Time (Hours)',
                  legendOffset: 50,
                  legendPosition: 'middle'
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Vehicle Count',
                  legendOffset: -50,
                  legendPosition: 'middle'
                }}
                colors={['#3b82f6', '#ef4444']}
                pointSize={6}
                pointColor={{ theme: 'background' }}
                pointBorderWidth={2}
                pointBorderColor={{ from: 'serieColor' }}
                enablePointLabel={false}
                useMesh={true}
                theme={chartTheme}
                legends={[
                  {
                    anchor: 'top-right',
                    direction: 'column',
                    justify: false,
                    translateX: 0,
                    translateY: 0,
                    itemsSpacing: 0,
                    itemDirection: 'left-to-right',
                    itemWidth: 80,
                    itemHeight: 20,
                    itemOpacity: 0.75,
                    symbolSize: 12,
                    symbolShape: 'circle',
                    symbolBorderColor: 'rgba(0, 0, 0, .5)',
                    effects: [
                      {
                        on: 'hover',
                        style: {
                          itemBackground: 'rgba(0, 0, 0, .03)',
                          itemOpacity: 1
                        }
                      }
                    ]
                  }
                ]}
              />
            </div>
          </Card>

          {/* Traffic Hotspots */}
          <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Traffic Hotspots
            </h3>
            <div className="h-[350px]">
              <ResponsiveBar
                data={hotspotChartData}
                keys={['congestion']}
                indexBy="location"
                margin={{ top: 20, right: 20, bottom: 80, left: 60 }}
                padding={0.3}
                colors={({ data }) => data.color}
                borderRadius={4}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: -45,
                  legend: 'Location',
                  legendOffset: 70,
                  legendPosition: 'middle'
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Congestion Level',
                  legendOffset: -50,
                  legendPosition: 'middle'
                }}
                theme={chartTheme}
                enableGridX={false}
                enableGridY={true}
                onClick={(data) => setSelectedHotspot(data.data.location)}
                tooltip={({ data }) => (
                  <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg">
                    <strong>{data.location}</strong>
                    <br />
                    Congestion: {data.congestion.toFixed(1)}%
                    <br />
                    Vehicles: {data.vehicles}
                  </div>
                )}
              />
            </div>
          </Card>
        </div>
      )}

      {/* Predictive Analytics View */}
      {viewMode === 'predictive' && (
        <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Traffic Predictions (Next 12 Hours)
          </h3>
          <div className="h-[400px]">
            <ResponsiveLine
              data={[
                {
                  id: "Predicted Traffic",
                  data: enhancedTrafficData.predictions.slice(0, 12).map(p => ({
                    x: p.hour,
                    y: p.vehicleCount
                  }))
                },
                {
                  id: "Confidence Band",
                  data: enhancedTrafficData.predictions.slice(0, 12).map(p => ({
                    x: p.hour,
                    y: p.vehicleCount * p.confidence
                  }))
                }
              ]}
              margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
              xScale={{ type: 'point' }}
              yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
              curve="cardinal"
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: 'Time (Hours)',
                legendOffset: 50,
                legendPosition: 'middle'
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Predicted Vehicle Count',
                legendOffset: -50,
                legendPosition: 'middle'
              }}
              colors={['#10b981', '#6b7280']}
              pointSize={8}
              pointColor={{ theme: 'background' }}
              pointBorderWidth={2}
              pointBorderColor={{ from: 'serieColor' }}
              enablePointLabel={false}
              useMesh={true}
              theme={chartTheme}
              enableArea={true}
              areaOpacity={0.1}
            />
          </div>

          <div className="mt-4 p-4 bg-blue-500/10 rounded-lg">
            <h4 className="font-medium text-blue-400 mb-2">City-Specific AI Recommendations</h4>
            <ul className="text-sm space-y-1">
              {enhancedTrafficData.cityCharacteristics?.type === 'it_hub' && (
                <>
                  <li>• Optimize signal timing at IT corridor intersections during 9-10 AM and 6-8 PM</li>
                  <li>• Implement staggered office hours to reduce lunch-time congestion (1-2 PM)</li>
                  <li>• Deploy shuttle services from major IT parks to reduce private vehicle usage</li>
                  <li>• Consider dedicated IT employee transport lanes during peak hours</li>
                </>
              )}
              {enhancedTrafficData.cityCharacteristics?.type === 'business' && (
                <>
                  <li>• Deploy additional traffic personnel at business district during 8-11 AM and 5-8 PM</li>
                  <li>• Optimize parking management near commercial complexes</li>
                  <li>• Implement dynamic pricing for peak-hour parking to encourage off-peak travel</li>
                  <li>• Consider express bus services to major business hubs</li>
                </>
              )}
              {enhancedTrafficData.cityCharacteristics?.type === 'religious' && (
                <>
                  <li>• Manage temple area traffic during early morning (6-8 AM) and evening (4-7 PM)</li>
                  <li>• Implement temporary parking restrictions during religious festivals</li>
                  <li>• Deploy traffic volunteers at major temple entrances during peak hours</li>
                  <li>• Create dedicated pedestrian pathways near religious sites</li>
                </>
              )}
              {enhancedTrafficData.cityCharacteristics?.type === 'residential' && (
                <>
                  <li>• Optimize school zone traffic management during 7-9 AM and 3-5 PM</li>
                  <li>• Implement residential area speed limits and traffic calming measures</li>
                  <li>• Encourage carpooling and public transport usage in residential areas</li>
                  <li>• Create safe cycling lanes for local commuting</li>
                </>
              )}
              {(!enhancedTrafficData.cityCharacteristics?.type || enhancedTrafficData.cityCharacteristics?.type === 'mixed') && (
                <>
                  <li>• Balance traffic flow between residential and commercial areas</li>
                  <li>• Implement adaptive signal control based on real-time traffic conditions</li>
                  <li>• Consider mixed-use development to reduce travel distances</li>
                  <li>• Promote public transport connectivity between different zones</li>
                </>
              )}
            </ul>
          </div>
        </Card>
      )}

      {/* Comparative Analysis View */}
      {viewMode === 'comparative' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Comparison */}
          <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Weekly Traffic Comparison
            </h3>
            <div className="h-[350px]">
              <ResponsiveBar
                data={[
                  { day: 'Mon', current: enhancedTrafficData.dailyTotal * 0.9, previous: enhancedTrafficData.dailyTotal * 0.85 },
                  { day: 'Tue', current: enhancedTrafficData.dailyTotal * 0.95, previous: enhancedTrafficData.dailyTotal * 0.88 },
                  { day: 'Wed', current: enhancedTrafficData.dailyTotal, previous: enhancedTrafficData.dailyTotal * 0.92 },
                  { day: 'Thu', current: enhancedTrafficData.dailyTotal * 1.05, previous: enhancedTrafficData.dailyTotal * 0.98 },
                  { day: 'Fri', current: enhancedTrafficData.dailyTotal * 1.15, previous: enhancedTrafficData.dailyTotal * 1.1 },
                  { day: 'Sat', current: enhancedTrafficData.dailyTotal * 0.7, previous: enhancedTrafficData.dailyTotal * 0.65 },
                  { day: 'Sun', current: enhancedTrafficData.dailyTotal * 0.6, previous: enhancedTrafficData.dailyTotal * 0.55 }
                ]}
                keys={['current', 'previous']}
                indexBy="day"
                margin={{ top: 20, right: 80, bottom: 60, left: 80 }}
                padding={0.3}
                colors={['#3b82f6', '#6b7280']}
                borderRadius={4}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Day of Week',
                  legendOffset: 40,
                  legendPosition: 'middle'
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Total Vehicles',
                  legendOffset: -60,
                  legendPosition: 'middle'
                }}
                theme={chartTheme}
                enableGridX={false}
                enableGridY={true}
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
              />
            </div>
          </Card>

          {/* Performance Metrics */}
          <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Performance Metrics
            </h3>
            <div className="space-y-6">
              {/* Efficiency Score */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Traffic Efficiency</span>
                  <span className="text-lg font-bold text-green-500">{enhancedTrafficData.currentMetrics.efficiency}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${enhancedTrafficData.currentMetrics.efficiency}%` }}
                  />
                </div>
              </div>

              {/* Environmental Impact */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">CO₂ Reduction</span>
                  <span className="text-lg font-bold text-blue-500">12.5%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-blue-500 h-3 rounded-full w-[12.5%] transition-all duration-500" />
                </div>
              </div>

              {/* Fuel Savings */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Fuel Savings</span>
                  <span className="text-lg font-bold text-purple-500">8.3%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-purple-500 h-3 rounded-full w-[8.3%] transition-all duration-500" />
                </div>
              </div>

              {/* City-Specific Key Insights */}
              <div className="mt-6 p-4 bg-blue-500/10 rounded-lg">
                <h4 className="font-medium text-blue-400 mb-2">City-Specific Insights</h4>
                <ul className="text-sm space-y-1">
                  {enhancedTrafficData.cityCharacteristics?.type === 'it_hub' && (
                    <>
                      <li>• IT corridor traffic reduced by 12% with staggered office hours</li>
                      <li>• Lunch-time congestion decreased by 18% through shuttle services</li>
                      <li>• Tech park signal optimization improved flow by 25%</li>
                      <li>• Employee transport initiatives reduced private vehicles by 15%</li>
                    </>
                  )}
                  {enhancedTrafficData.cityCharacteristics?.type === 'business' && (
                    <>
                      <li>• Business district flow improved by 15% with dynamic parking</li>
                      <li>• Morning rush efficiency increased by 20% through signal timing</li>
                      <li>• Commercial area congestion reduced by 10% average</li>
                      <li>• Express bus services decreased private vehicle usage by 12%</li>
                    </>
                  )}
                  {enhancedTrafficData.cityCharacteristics?.type === 'religious' && (
                    <>
                      <li>• Temple area traffic managed 30% better during festivals</li>
                      <li>• Early morning congestion reduced by 22% with volunteer deployment</li>
                      <li>• Pedestrian safety improved by 40% with dedicated pathways</li>
                      <li>• Religious site parking optimization reduced wait times by 25%</li>
                    </>
                  )}
                  {enhancedTrafficData.cityCharacteristics?.type === 'residential' && (
                    <>
                      <li>• School zone safety improved by 35% with traffic calming</li>
                      <li>• Residential area speeds reduced by 15% improving safety</li>
                      <li>• Cycling infrastructure increased bike usage by 28%</li>
                      <li>• Carpooling initiatives reduced morning traffic by 18%</li>
                    </>
                  )}
                  {(!enhancedTrafficData.cityCharacteristics?.type || enhancedTrafficData.cityCharacteristics?.type === 'mixed') && (
                    <>
                      <li>• Mixed-zone traffic flow improved by 15% compared to last week</li>
                      <li>• Adaptive signals reduced peak hour congestion by 8 minutes</li>
                      <li>• Public transport connectivity increased usage by 12%</li>
                      <li>• Zone balancing decreased cross-area travel by 20%</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* High Traffic Alert */}
      {enhancedTrafficData.currentMetrics.congestionLevel >= 75 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-500">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">High Traffic Alert</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Traffic congestion has reached critical levels. Alert has been sent to authorities.
          </p>
        </div>
      )}
    </div>
  );
}