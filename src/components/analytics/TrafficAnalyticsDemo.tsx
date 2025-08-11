import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  TrendingUp, 
  MapPin, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Activity
} from 'lucide-react';

export function TrafficAnalyticsDemo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<'normal' | 'rush' | 'incident'>('normal');

  const scenarios = {
    normal: {
      title: 'Normal Traffic Flow',
      description: 'Typical traffic conditions with moderate congestion',
      congestion: 45,
      speed: 38,
      vehicles: 650,
      color: 'bg-green-500',
      status: 'Normal'
    },
    rush: {
      title: 'Rush Hour Traffic',
      description: 'Peak hour conditions with high congestion',
      congestion: 78,
      speed: 22,
      vehicles: 1250,
      color: 'bg-yellow-500',
      status: 'Peak Hours'
    },
    incident: {
      title: 'Traffic Incident',
      description: 'Emergency situation with severe congestion',
      congestion: 92,
      speed: 12,
      vehicles: 1850,
      color: 'bg-red-500',
      status: 'Critical'
    }
  };

  const currentData = scenarios[currentScenario];

  const features = [
    {
      title: 'Real-time Traffic Flow Charts',
      description: 'Interactive 24-hour traffic pattern visualization with current and predicted data',
      icon: <TrendingUp className="h-5 w-5" />,
      status: 'implemented'
    },
    {
      title: 'Traffic Hotspots Analysis',
      description: 'Color-coded hotspot visualization with drill-down capabilities',
      icon: <MapPin className="h-5 w-5" />,
      status: 'implemented'
    },
    {
      title: 'Predictive Analytics',
      description: 'ML-based traffic predictions for next 12-24 hours with confidence intervals',
      icon: <Clock className="h-5 w-5" />,
      status: 'implemented'
    },
    {
      title: 'Comparative Analysis',
      description: 'Week-over-week traffic comparisons and performance metrics',
      icon: <Activity className="h-5 w-5" />,
      status: 'implemented'
    },
    {
      title: 'Advanced KPI Dashboard',
      description: 'Traffic efficiency, wait times, signal optimization, and route efficiency metrics',
      icon: <CheckCircle className="h-5 w-5" />,
      status: 'implemented'
    },
    {
      title: 'Alert Integration',
      description: 'Automated alert generation with email notifications and browser alerts',
      icon: <AlertTriangle className="h-5 w-5" />,
      status: 'implemented'
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Enhanced Traffic Analytics Demo</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive traffic monitoring and analysis platform with predictive capabilities
        </p>
      </div>

      {/* Demo Controls */}
      <Card className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
        <h3 className="text-lg font-semibold mb-4">Interactive Demo Controls</h3>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2">
            {Object.entries(scenarios).map(([key, scenario]) => (
              <Button
                key={key}
                variant={currentScenario === key ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentScenario(key as any)}
                className="flex items-center gap-2"
              >
                <div className={`w-3 h-3 rounded-full ${scenario.color}`} />
                {scenario.title}
              </Button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? 'Pause' : 'Play'} Demo
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentScenario('normal');
                setIsPlaying(false);
              }}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Current Scenario Display */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{currentData.title}</h3>
          <Badge variant={currentScenario === 'normal' ? 'default' : 
                         currentScenario === 'rush' ? 'secondary' : 'destructive'}>
            {currentData.status}
          </Badge>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 mb-4">{currentData.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-red-500">{currentData.congestion}%</div>
            <div className="text-sm text-gray-500">Congestion Level</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-blue-500">{currentData.speed} km/h</div>
            <div className="text-sm text-gray-500">Average Speed</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-purple-500">{currentData.vehicles.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Vehicle Count</div>
          </div>
        </div>
      </Card>

      {/* Features Overview */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Enhanced Features Implemented</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-green-500 mt-1">
                {feature.icon}
              </div>
              <div>
                <h4 className="font-medium mb-1">{feature.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                <Badge variant="default" className="mt-2 text-xs">
                  ✓ Implemented
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Usage Instructions */}
      <Card className="p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10">
        <h3 className="text-lg font-semibold mb-4">How to Use the Enhanced Traffic Analytics</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <span className="font-medium text-blue-500">1.</span>
            <span>Use the time range selector (1H, 4H, 24H, 7D) to view different time periods</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-blue-500">2.</span>
            <span>Switch between Overview, Predictive, and Comparative views for different insights</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-blue-500">3.</span>
            <span>Click on hotspots in the chart to drill down into specific location details</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-blue-500">4.</span>
            <span>Enable auto-refresh for real-time updates based on your settings preferences</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-blue-500">5.</span>
            <span>Export data as JSON for external analysis or reporting</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-blue-500">6.</span>
            <span>Test the alert system with the "Test Alert" button to verify notifications</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
