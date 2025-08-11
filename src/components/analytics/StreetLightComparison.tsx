import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  Zap, 
  Settings, 
  MapPin, 
  Clock,
  Leaf,
  Shield,
  RefreshCw,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { fetchStreetLightData, type StreetLightData } from '@/services/streetlight';

const CITIES = ['thane', 'borivali', 'kharghar', 'pune', 'nashik', 'panvel'];

export function StreetLightComparison() {
  const [cityData, setCityData] = useState<Record<string, StreetLightData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'efficiency' | 'lights' | 'energy' | 'faults'>('efficiency');

  const loadAllCityData = async () => {
    setIsLoading(true);
    const data: Record<string, StreetLightData> = {};
    
    for (const city of CITIES) {
      try {
        const lightData = await fetchStreetLightData(city);
        data[city] = lightData;
      } catch (error) {
        console.error(`Failed to load data for ${city}:`, error);
      }
    }
    
    setCityData(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadAllCityData();
  }, []);

  const getCityTypeColor = (type: string) => {
    switch (type) {
      case 'it_hub': return 'bg-blue-500';
      case 'business': return 'bg-purple-500';
      case 'residential': return 'bg-green-500';
      case 'religious': return 'bg-orange-500';
      case 'mixed': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getCityTypeIcon = (type: string) => {
    switch (type) {
      case 'it_hub': return <Settings className="h-4 w-4" />;
      case 'business': return <TrendingUp className="h-4 w-4" />;
      case 'residential': return <Lightbulb className="h-4 w-4" />;
      case 'religious': return <MapPin className="h-4 w-4" />;
      case 'mixed': return <Zap className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  const calculateMetrics = (data: StreetLightData) => {
    const operationalEfficiency = (data.current.activeLights / data.current.totalLights) * 100;
    const energyEfficiency = data.energyStats.efficiency.currentMonth;
    const faultRate = (data.current.faultyLights / data.current.totalLights) * 100;
    
    return {
      operationalEfficiency,
      energyEfficiency,
      faultRate,
      totalLights: data.current.totalLights,
      energyConsumption: data.current.energyConsumption
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading city comparison data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Street Light City Comparison</h2>
        <div className="flex gap-2">
          <Button
            variant={selectedMetric === 'efficiency' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedMetric('efficiency')}
          >
            Efficiency
          </Button>
          <Button
            variant={selectedMetric === 'lights' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedMetric('lights')}
          >
            Lights
          </Button>
          <Button
            variant={selectedMetric === 'energy' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedMetric('energy')}
          >
            Energy
          </Button>
          <Button
            variant={selectedMetric === 'faults' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedMetric('faults')}
          >
            Faults
          </Button>
          <Button variant="outline" size="sm" onClick={loadAllCityData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CITIES.map((city) => {
          const data = cityData[city];
          if (!data) return null;

          const metrics = calculateMetrics(data);
          const characteristics = data.cityCharacteristics;

          let metricValue: number;
          let metricLabel: string;
          let metricColor: string;

          switch (selectedMetric) {
            case 'efficiency':
              metricValue = metrics.operationalEfficiency;
              metricLabel = `${metrics.operationalEfficiency.toFixed(1)}%`;
              metricColor = metrics.operationalEfficiency > 95 ? 'text-green-500' : 
                           metrics.operationalEfficiency > 90 ? 'text-yellow-500' : 'text-red-500';
              break;
            case 'lights':
              metricValue = metrics.totalLights;
              metricLabel = metrics.totalLights.toLocaleString();
              metricColor = 'text-blue-500';
              break;
            case 'energy':
              metricValue = metrics.energyConsumption;
              metricLabel = `${metrics.energyConsumption.toFixed(1)} kWh`;
              metricColor = 'text-purple-500';
              break;
            case 'faults':
              metricValue = metrics.faultRate;
              metricLabel = `${metrics.faultRate.toFixed(1)}%`;
              metricColor = metrics.faultRate < 2 ? 'text-green-500' : 
                           metrics.faultRate < 5 ? 'text-yellow-500' : 'text-red-500';
              break;
            default:
              metricValue = 0;
              metricLabel = '0';
              metricColor = 'text-gray-500';
          }

          return (
            <Card key={city} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold capitalize">{city}</h3>
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded ${getCityTypeColor(characteristics.cityType)} text-white`}>
                    {getCityTypeIcon(characteristics.cityType)}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {characteristics.cityType.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${metricColor}`}>
                    {metricLabel}
                  </div>
                  <div className="text-sm text-gray-500 capitalize">
                    {selectedMetric === 'efficiency' ? 'Operational Efficiency' : selectedMetric}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Infrastructure:</span>
                    <Badge variant="outline" className="text-xs">
                      {characteristics.infrastructureAge}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Energy Focus:</span>
                    <Badge variant="outline" className="text-xs">
                      {characteristics.lightingRequirements.energyEfficiencyFocus}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Security Level:</span>
                    <Badge variant="outline" className="text-xs">
                      {characteristics.lightingRequirements.securityLevel}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Smart Features:</span>
                    <span className="font-medium">
                      {Object.values(data.smartFeatures).filter(Boolean).length}/5
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Zones: {data.zones.length} • Lights: {data.current.totalLights.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Energy Efficiency: {data.energyStats.efficiency.currentMonth.toFixed(1)}%
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">City Lighting Characteristics Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-500 mb-2">IT Hub Cities</h4>
            <ul className="space-y-1">
              <li>• Pune: 24/7 high-security lighting</li>
              <li>• Smart controls for energy optimization</li>
              <li>• Motion sensors in parking areas</li>
              <li>• Aging infrastructure with upgrade needs</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-purple-500 mb-2">Business Districts</h4>
            <ul className="space-y-1">
              <li>• Thane: Aesthetic and security focus</li>
              <li>• Smart dimming for cost reduction</li>
              <li>• High-intensity commercial lighting</li>
              <li>• Modern infrastructure with smart features</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-green-500 mb-2">Residential Areas</h4>
            <ul className="space-y-1">
              <li>• Borivali, Kharghar: Energy efficiency priority</li>
              <li>• Community safety lighting</li>
              <li>• Motion sensors for security</li>
              <li>• Modern/new infrastructure</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-orange-500 mb-2">Religious Centers</h4>
            <ul className="space-y-1">
              <li>• Nashik: Traditional design elements</li>
              <li>• Consistent lighting for religious sites</li>
              <li>• Festival-ready illumination</li>
              <li>• Aging infrastructure with heritage focus</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-500 mb-2">Mixed Development</h4>
            <ul className="space-y-1">
              <li>• Panvel: Flexible lighting solutions</li>
              <li>• Adaptive controls for varied needs</li>
              <li>• Zone-specific optimization</li>
              <li>• Modern infrastructure with smart features</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
