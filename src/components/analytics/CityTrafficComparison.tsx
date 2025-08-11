import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  TrendingUp, 
  Clock, 
  Users, 
  Building, 
  Zap,
  RefreshCw
} from 'lucide-react';
import { fetchTrafficData, type LocationTrafficData } from '@/services/traffic';

const CITIES = ['thane', 'borivali', 'kharghar', 'pune', 'nashik', 'panvel'];

export function CityTrafficComparison() {
  const [cityData, setCityData] = useState<Record<string, LocationTrafficData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'congestion' | 'vehicles' | 'efficiency'>('congestion');

  const loadAllCityData = async () => {
    setIsLoading(true);
    const data: Record<string, LocationTrafficData> = {};
    
    for (const city of CITIES) {
      try {
        const trafficData = await fetchTrafficData(city);
        data[city] = trafficData;
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
      case 'it_hub': return <Building className="h-4 w-4" />;
      case 'business': return <TrendingUp className="h-4 w-4" />;
      case 'residential': return <Users className="h-4 w-4" />;
      case 'religious': return <MapPin className="h-4 w-4" />;
      case 'mixed': return <Zap className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  const calculateCongestion = (data: LocationTrafficData) => {
    const baseVehicles = data.cityCharacteristics?.type === 'it_hub' ? 520 :
                        data.cityCharacteristics?.type === 'business' ? 450 :
                        data.cityCharacteristics?.type === 'residential' ? 350 :
                        data.cityCharacteristics?.type === 'religious' ? 350 :
                        data.cityCharacteristics?.type === 'mixed' ? 320 : 400;
    
    return Math.min(100, Math.max(0, (data.currentTraffic.vehicleCount / baseVehicles) * 100));
  };

  const calculateEfficiency = (data: LocationTrafficData) => {
    const congestion = calculateCongestion(data);
    const infrastructureBonus = (data.cityCharacteristics?.infrastructureRating || 5) / 10 * 20;
    return Math.round(Math.max(0, 100 - congestion * 0.6 + infrastructureBonus));
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
        <h2 className="text-2xl font-bold">City Traffic Comparison</h2>
        <div className="flex gap-2">
          <Button
            variant={selectedMetric === 'congestion' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedMetric('congestion')}
          >
            Congestion
          </Button>
          <Button
            variant={selectedMetric === 'vehicles' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedMetric('vehicles')}
          >
            Vehicles
          </Button>
          <Button
            variant={selectedMetric === 'efficiency' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedMetric('efficiency')}
          >
            Efficiency
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

          const congestion = calculateCongestion(data);
          const efficiency = calculateEfficiency(data);
          const characteristics = data.cityCharacteristics;

          let metricValue: number;
          let metricLabel: string;
          let metricColor: string;

          switch (selectedMetric) {
            case 'congestion':
              metricValue = congestion;
              metricLabel = `${congestion.toFixed(1)}%`;
              metricColor = congestion > 75 ? 'text-red-500' : congestion > 50 ? 'text-yellow-500' : 'text-green-500';
              break;
            case 'vehicles':
              metricValue = data.currentTraffic.vehicleCount;
              metricLabel = data.currentTraffic.vehicleCount.toLocaleString();
              metricColor = 'text-blue-500';
              break;
            case 'efficiency':
              metricValue = efficiency;
              metricLabel = `${efficiency}%`;
              metricColor = efficiency > 85 ? 'text-green-500' : efficiency > 70 ? 'text-yellow-500' : 'text-red-500';
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
                {characteristics && (
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded ${getCityTypeColor(characteristics.type)} text-white`}>
                      {getCityTypeIcon(characteristics.type)}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {characteristics.type.replace('_', ' ')}
                    </Badge>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${metricColor}`}>
                    {metricLabel}
                  </div>
                  <div className="text-sm text-gray-500 capitalize">
                    {selectedMetric}
                  </div>
                </div>

                {characteristics && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Population Density:</span>
                      <Badge variant="outline" className="text-xs">
                        {characteristics.populationDensity.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Infrastructure:</span>
                      <span className="font-medium">{characteristics.infrastructureRating}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Speed:</span>
                      <span className="font-medium">{characteristics.averageSpeed} km/h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Economic Activity:</span>
                      <Badge variant="outline" className="text-xs">
                        {characteristics.economicActivity.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t">
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Peak: {data.peakHour.hour}:00 ({data.peakHour.vehicleCount.toLocaleString()} vehicles)
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Hotspots: {data.hotspots.length} locations
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">City Characteristics Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-500 mb-2">IT Hub Cities</h4>
            <ul className="space-y-1">
              <li>• Pune: Major IT corridor with tech parks</li>
              <li>• High morning/evening peaks + lunch rush</li>
              <li>• Advanced infrastructure requirements</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-purple-500 mb-2">Business Districts</h4>
            <ul className="space-y-1">
              <li>• Thane: Major business and commercial hub</li>
              <li>• Traditional rush hour patterns</li>
              <li>• High vehicle density and congestion</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-green-500 mb-2">Residential Areas</h4>
            <ul className="space-y-1">
              <li>• Borivali, Kharghar: Suburban residential</li>
              <li>• School and local commute patterns</li>
              <li>• Better infrastructure capacity</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-orange-500 mb-2">Religious Centers</h4>
            <ul className="space-y-1">
              <li>• Nashik: Temple and pilgrimage traffic</li>
              <li>• Early morning and evening peaks</li>
              <li>• Festival-based traffic variations</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-500 mb-2">Mixed Development</h4>
            <ul className="space-y-1">
              <li>• Panvel: Growing mixed-use area</li>
              <li>• Balanced residential and commercial</li>
              <li>• Moderate traffic patterns</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
