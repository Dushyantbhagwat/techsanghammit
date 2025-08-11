import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { AlertTriangle, AlertCircle, Bell, Clock, AlertOctagon, CheckCircle, Eye, Download, X, RefreshCw } from "lucide-react";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from "@nivo/bar";
import { VoiceAssistant } from "@/components/alerts/VoiceAssistant";

// Enhanced Alert Interface
interface Alert {
  id: number;
  type: 'red' | 'yellow' | 'green';
  title: string;
  description: string;
  time: string;
  timestamp: Date;
  category: string;
  area: string;
  status: 'active' | 'acknowledged' | 'resolved';
  priority: number;
  source: string;
  metadata?: Record<string, any>;
}

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

// Dynamic current values that change over time to simulate real-time data
let currentValues = {
  traffic: 2700,
  aqi: 120,
  co2: 850,
  temperature: 32,
  humidity: 75,
  parking: 85, // percentage occupied
  security: 0, // incidents count
  infrastructure: 95 // health percentage
};

// Areas and their characteristics
const AREAS = [
  { name: "Downtown", riskFactor: 1.2, population: "high" },
  { name: "Suburban Area", riskFactor: 0.8, population: "medium" },
  { name: "Industrial Zone", riskFactor: 1.5, population: "low" },
  { name: "Residential District", riskFactor: 0.6, population: "high" },
  { name: "Commercial Hub", riskFactor: 1.1, population: "high" },
  { name: "Tech Park", riskFactor: 0.9, population: "medium" }
];

// Alert sources for realistic generation
const ALERT_SOURCES = [
  "Traffic Monitoring System",
  "Environmental Sensors",
  "Security Cameras",
  "Infrastructure Monitors",
  "Parking Management",
  "Emergency Services",
  "Citizen Reports",
  "IoT Sensors"
];

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

// Simulate realistic data fluctuations
function updateCurrentValues() {
  const now = new Date();
  const hour = now.getHours();

  // Traffic patterns based on time of day
  const trafficBase = hour >= 7 && hour <= 9 || hour >= 17 && hour <= 19 ? 3200 :
                     hour >= 10 && hour <= 16 ? 2400 : 1800;
  currentValues.traffic = Math.max(1000, trafficBase + (Math.random() - 0.5) * 800);

  // Environmental factors with daily patterns
  currentValues.aqi = Math.max(20, 80 + (Math.random() - 0.5) * 100 + (hour > 6 && hour < 20 ? 20 : -10));
  currentValues.co2 = Math.max(400, 700 + (Math.random() - 0.5) * 400 + (hour > 8 && hour < 18 ? 100 : -50));
  currentValues.temperature = Math.max(15, 25 + (Math.random() - 0.5) * 20 + Math.sin((hour - 6) * Math.PI / 12) * 8);
  currentValues.humidity = Math.max(30, Math.min(90, 60 + (Math.random() - 0.5) * 40));

  // Other systems
  currentValues.parking = Math.max(20, Math.min(95, 70 + (Math.random() - 0.5) * 50));
  currentValues.security = Math.random() < 0.1 ? Math.floor(Math.random() * 3) : 0;
  currentValues.infrastructure = Math.max(80, Math.min(100, 95 + (Math.random() - 0.5) * 20));
}

// Enhanced alert generation with realistic scenarios
function generateDynamicAlerts(): Alert[] {
  const alerts: Alert[] = [];
  let id = Date.now(); // Use timestamp for unique IDs

  // Update values first
  updateCurrentValues();

  // Traffic alerts
  const trafficLevel = getAlertLevel(currentValues.traffic, THRESHOLDS.traffic);
  if (trafficLevel !== 'green') {
    const area = AREAS[Math.floor(Math.random() * AREAS.length)];
    const minutesAgo = Math.floor(Math.random() * 30) + 1;
    alerts.push({
      id: id++,
      type: trafficLevel as 'red' | 'yellow' | 'green',
      title: `${trafficLevel === 'red' ? 'Critical' : 'High'} Traffic Congestion`,
      description: `Traffic volume at ${Math.round(currentValues.traffic)} vehicles/hour in ${area.name}. ${trafficLevel === 'red' ? 'Emergency response may be delayed.' : 'Consider alternate routes.'}`,
      time: `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`,
      timestamp: new Date(Date.now() - minutesAgo * 60000),
      category: "Traffic",
      area: area.name,
      status: 'active',
      priority: trafficLevel === 'red' ? 1 : 2,
      source: "Traffic Monitoring System",
      metadata: { vehicleCount: Math.round(currentValues.traffic), threshold: THRESHOLDS.traffic[trafficLevel] }
    });
  }

  // Environmental alerts
  const aqiLevel = getAlertLevel(currentValues.aqi, THRESHOLDS.aqi);
  if (aqiLevel !== 'green') {
    const area = AREAS[Math.floor(Math.random() * AREAS.length)];
    const minutesAgo = Math.floor(Math.random() * 45) + 5;
    alerts.push({
      id: id++,
      type: aqiLevel as 'red' | 'yellow' | 'green',
      title: "Air Quality Alert",
      description: `AQI at ${Math.round(currentValues.aqi)} in ${area.name}. ${aqiLevel === 'red' ? 'Hazardous conditions - avoid outdoor activities.' : 'Unhealthy for sensitive groups.'}`,
      time: `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`,
      timestamp: new Date(Date.now() - minutesAgo * 60000),
      category: "Environmental",
      area: area.name,
      status: 'active',
      priority: aqiLevel === 'red' ? 1 : 2,
      source: "Environmental Sensors",
      metadata: { aqiValue: Math.round(currentValues.aqi), category: aqiLevel === 'red' ? 'Hazardous' : 'Unhealthy' }
    });
  }

  // CO2 alerts
  const co2Level = getAlertLevel(currentValues.co2, THRESHOLDS.co2);
  if (co2Level !== 'green') {
    const area = AREAS[Math.floor(Math.random() * AREAS.length)];
    const minutesAgo = Math.floor(Math.random() * 20) + 1;
    alerts.push({
      id: id++,
      type: co2Level as 'red' | 'yellow' | 'green',
      title: "Elevated CO₂ Levels",
      description: `CO₂ concentration at ${Math.round(currentValues.co2)}ppm in ${area.name}. ${co2Level === 'red' ? 'Immediate ventilation required.' : 'Monitor air quality.'}`,
      time: `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`,
      timestamp: new Date(Date.now() - minutesAgo * 60000),
      category: "Environmental",
      area: area.name,
      status: 'active',
      priority: co2Level === 'red' ? 1 : 2,
      source: "IoT Sensors",
      metadata: { co2Level: Math.round(currentValues.co2), unit: 'ppm' }
    });
  }

  // Temperature alerts
  const tempLevel = getAlertLevel(currentValues.temperature, THRESHOLDS.temperature);
  if (tempLevel !== 'green') {
    const area = AREAS[Math.floor(Math.random() * AREAS.length)];
    const minutesAgo = Math.floor(Math.random() * 15) + 1;
    alerts.push({
      id: id++,
      type: tempLevel as 'red' | 'yellow' | 'green',
      title: `${tempLevel === 'red' ? 'Extreme' : 'High'} Temperature Alert`,
      description: `Temperature at ${Math.round(currentValues.temperature)}°C in ${area.name}. ${tempLevel === 'red' ? 'Heat emergency protocols activated.' : 'Heat advisory in effect.'}`,
      time: `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`,
      timestamp: new Date(Date.now() - minutesAgo * 60000),
      category: "Environmental",
      area: area.name,
      status: 'active',
      priority: tempLevel === 'red' ? 1 : 2,
      source: "Environmental Sensors",
      metadata: { temperature: Math.round(currentValues.temperature), unit: '°C' }
    });
  }

  // Parking alerts
  if (currentValues.parking > 90) {
    const area = AREAS[Math.floor(Math.random() * AREAS.length)];
    const minutesAgo = Math.floor(Math.random() * 10) + 1;
    alerts.push({
      id: id++,
      type: 'yellow',
      title: "Parking Capacity Alert",
      description: `Parking ${Math.round(currentValues.parking)}% full in ${area.name}. Limited spaces available.`,
      time: `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`,
      timestamp: new Date(Date.now() - minutesAgo * 60000),
      category: "Parking",
      area: area.name,
      status: 'active',
      priority: 3,
      source: "Parking Management",
      metadata: { occupancyRate: Math.round(currentValues.parking), unit: '%' }
    });
  }

  // Security alerts
  if (currentValues.security > 0) {
    const area = AREAS[Math.floor(Math.random() * AREAS.length)];
    const minutesAgo = Math.floor(Math.random() * 5) + 1;
    alerts.push({
      id: id++,
      type: 'red',
      title: "Security Incident",
      description: `${currentValues.security} security incident${currentValues.security > 1 ? 's' : ''} reported in ${area.name}. Emergency response dispatched.`,
      time: `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`,
      timestamp: new Date(Date.now() - minutesAgo * 60000),
      category: "Security",
      area: area.name,
      status: 'active',
      priority: 1,
      source: "Security Cameras",
      metadata: { incidentCount: currentValues.security }
    });
  }

  // Infrastructure alerts
  if (currentValues.infrastructure < 90) {
    const area = AREAS[Math.floor(Math.random() * AREAS.length)];
    const minutesAgo = Math.floor(Math.random() * 60) + 10;
    const severity = currentValues.infrastructure < 85 ? 'red' : 'yellow';
    alerts.push({
      id: id++,
      type: severity,
      title: "Infrastructure Health Alert",
      description: `Infrastructure health at ${Math.round(currentValues.infrastructure)}% in ${area.name}. ${severity === 'red' ? 'Critical maintenance required.' : 'Scheduled maintenance recommended.'}`,
      time: `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`,
      timestamp: new Date(Date.now() - minutesAgo * 60000),
      category: "Infrastructure",
      area: area.name,
      status: 'active',
      priority: severity === 'red' ? 1 : 2,
      source: "Infrastructure Monitors",
      metadata: { healthScore: Math.round(currentValues.infrastructure), unit: '%' }
    });
  }

  // Random additional alerts for variety
  if (Math.random() < 0.3) {
    const randomAlerts = [
      {
        type: 'yellow' as const,
        title: "Citizen Report",
        description: "Pothole reported on Main Street. Maintenance crew notified.",
        category: "Infrastructure",
        source: "Citizen Reports"
      },
      {
        type: 'green' as const,
        title: "System Update",
        description: "Traffic light system updated successfully. All signals operational.",
        category: "Infrastructure",
        source: "Infrastructure Monitors"
      },
      {
        type: 'yellow' as const,
        title: "Weather Advisory",
        description: "Heavy rain expected. Monitor flood-prone areas.",
        category: "Environmental",
        source: "Weather Service"
      }
    ];

    const randomAlert = randomAlerts[Math.floor(Math.random() * randomAlerts.length)];
    const area = AREAS[Math.floor(Math.random() * AREAS.length)];
    const minutesAgo = Math.floor(Math.random() * 120) + 5;

    alerts.push({
      id: id++,
      type: randomAlert.type,
      title: randomAlert.title,
      description: randomAlert.description,
      time: `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`,
      timestamp: new Date(Date.now() - minutesAgo * 60000),
      category: randomAlert.category,
      area: area.name,
      status: 'active',
      priority: randomAlert.type === 'red' ? 1 : randomAlert.type === 'yellow' ? 2 : 3,
      source: randomAlert.source,
      metadata: {}
    });
  }

  return alerts.sort((a, b) => a.priority - b.priority || b.timestamp.getTime() - a.timestamp.getTime());
}

const categories = ["All", "Traffic", "Environmental", "Infrastructure", "Security", "Parking"];
const types = ["All", "Red", "Yellow", "Green"];
const statuses = ["All", "Active", "Acknowledged", "Resolved"];
const areas = ["All", ...AREAS.map(area => area.name)];

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
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const categoryParam = searchParams.get('category');
    return categoryParam ? categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1) : "All";
  });
  const [selectedType, setSelectedType] = useState(() => {
    const typeParam = searchParams.get('type');
    return typeParam ? typeParam.charAt(0).toUpperCase() + typeParam.slice(1) : "All";
  });
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedArea, setSelectedArea] = useState("All");
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertHistory, setAlertHistory] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  // Alert management functions
  const acknowledgeAlert = useCallback((alertId: number) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, status: 'acknowledged' } : alert
    ));
    setAlertHistory(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, status: 'acknowledged' } : alert
    ));
  }, []);

  const resolveAlert = useCallback((alertId: number) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, status: 'resolved' } : alert
    ));
    setAlertHistory(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, status: 'resolved' } : alert
    ));
  }, []);

  const viewAlertDetails = useCallback((alert: Alert) => {
    setSelectedAlert(alert);
    setShowDetailModal(true);
  }, []);

  const exportAlerts = useCallback(() => {
    const currentFilteredAlerts = alerts.filter(alert => {
      const categoryMatch = selectedCategory === "All" || alert.category === selectedCategory;
      const typeMatch = selectedType === "All" || alert.type === selectedType.toLowerCase();
      const statusMatch = selectedStatus === "All" || alert.status === selectedStatus.toLowerCase();
      const areaMatch = selectedArea === "All" || alert.area === selectedArea;
      return categoryMatch && typeMatch && statusMatch && areaMatch;
    });

    const dataStr = JSON.stringify(currentFilteredAlerts, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `alerts_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [alerts, selectedCategory, selectedType, selectedStatus, selectedArea]);

  const refreshAlerts = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      const newAlerts = generateDynamicAlerts();
      setAlerts(newAlerts);
      setAlertHistory(prev => [...prev, ...newAlerts].slice(-100)); // Keep last 100 alerts
      setIsLoading(false);
    }, 1000);
  }, []);

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

  // Initialize alerts on component mount
  useEffect(() => {
    const initialAlerts = generateDynamicAlerts();
    setAlerts(initialAlerts);
    setAlertHistory(initialAlerts);
  }, []);

  // Update filters when URL changes
  useEffect(() => {
    const typeParam = searchParams.get('type');
    const categoryParam = searchParams.get('category');

    if (typeParam) {
      setSelectedType(typeParam.charAt(0).toUpperCase() + typeParam.slice(1));
    }
    if (categoryParam) {
      setSelectedCategory(categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1));
    }
  }, [searchParams]);

  // Real-time updates with dynamic data
  useEffect(() => {
    const interval = setInterval(() => {
      const newAlerts = generateDynamicAlerts();
      setAlerts(newAlerts);
      setAlertHistory(prev => [...prev, ...newAlerts].slice(-100));

      setVoiceAssistantData(prev => ({
        ...prev,
        time: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
        traffic: {
          vehicleCount: Math.round(currentValues.traffic),
          congestionLevel: getAlertLevel(currentValues.traffic, THRESHOLDS.traffic) === 'red'
            ? 'high'
            : getAlertLevel(currentValues.traffic, THRESHOLDS.traffic) === 'yellow'
            ? 'moderate'
            : 'low'
        },
        aqi: {
          value: Math.round(currentValues.aqi),
          category: getAlertLevel(currentValues.aqi, THRESHOLDS.aqi) === 'red'
            ? 'hazardous'
            : getAlertLevel(currentValues.aqi, THRESHOLDS.aqi) === 'yellow'
            ? 'unhealthy'
            : 'good'
        },
        co2: {
          value: Math.round(currentValues.co2),
          status: getAlertLevel(currentValues.co2, THRESHOLDS.co2) === 'red'
            ? 'critically high'
            : getAlertLevel(currentValues.co2, THRESHOLDS.co2) === 'yellow'
            ? 'elevated'
            : 'normal'
        },
        temperature: {
          value: Math.round(currentValues.temperature),
          status: getAlertLevel(currentValues.temperature, THRESHOLDS.temperature) === 'red'
            ? 'extremely hot'
            : getAlertLevel(currentValues.temperature, THRESHOLDS.temperature) === 'yellow'
            ? 'warm'
            : 'comfortable'
        }
      }));
    }, 15000); // Update every 15 seconds for more dynamic feel

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
    if (category === "All") {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category.toLowerCase());
    }
    setSearchParams(searchParams);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
  };

  const handleAreaChange = (area: string) => {
    setSelectedArea(area);
  };

  const filteredAlerts = alerts.filter(alert => {
    const categoryMatch = selectedCategory === "All" || alert.category === selectedCategory;
    const typeMatch = selectedType === "All" || alert.type === selectedType.toLowerCase();
    const statusMatch = selectedStatus === "All" || alert.status === selectedStatus.toLowerCase();
    const areaMatch = selectedArea === "All" || alert.area === selectedArea;
    return categoryMatch && typeMatch && statusMatch && areaMatch;
  });

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold">Alerts</h1>
          {isLoading && (
            <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={refreshAlerts}
            disabled={isLoading}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md text-xs sm:text-sm transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={exportAlerts}
            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs sm:text-sm transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Enhanced Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <select
          value={selectedType}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="px-3 py-2 bg-black text-white border border-gray-800 rounded-md text-sm hover:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        >
          <option value="" disabled className="text-gray-400">Severity</option>
          {types.map(type => (
            <option key={type} value={type} className="bg-black text-white">
              {type} {type !== 'All' ? 'Alerts' : ''}
            </option>
          ))}
        </select>
        <select
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="px-3 py-2 bg-black text-white border border-gray-800 rounded-md text-sm hover:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        >
          <option value="" disabled className="text-gray-400">Category</option>
          {categories.map(category => (
            <option key={category} value={category} className="bg-black text-white">
              {category}
            </option>
          ))}
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="px-3 py-2 bg-black text-white border border-gray-800 rounded-md text-sm hover:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        >
          <option value="" disabled className="text-gray-400">Status</option>
          {statuses.map(status => (
            <option key={status} value={status} className="bg-black text-white">
              {status}
            </option>
          ))}
        </select>
        <select
          value={selectedArea}
          onChange={(e) => handleAreaChange(e.target.value)}
          className="px-3 py-2 bg-black text-white border border-gray-800 rounded-md text-sm hover:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        >
          <option value="" disabled className="text-gray-400">Area</option>
          {areas.map(area => (
            <option key={area} value={area} className="bg-black text-white">
              {area}
            </option>
          ))}
        </select>
      </div>

      {/* Filter Summary */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
        <span>Showing {filteredAlerts.length} of {alerts.length} alerts</span>
        {(selectedType !== "All" || selectedCategory !== "All" || selectedStatus !== "All" || selectedArea !== "All") && (
          <>
            <span>•</span>
            <span>Filtered by:</span>
            {selectedType !== "All" && <span className="px-2 py-1 bg-gray-800 rounded text-xs">{selectedType}</span>}
            {selectedCategory !== "All" && <span className="px-2 py-1 bg-gray-800 rounded text-xs">{selectedCategory}</span>}
            {selectedStatus !== "All" && <span className="px-2 py-1 bg-gray-800 rounded text-xs">{selectedStatus}</span>}
            {selectedArea !== "All" && <span className="px-2 py-1 bg-gray-800 rounded text-xs">{selectedArea}</span>}
          </>
        )}
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
        {filteredAlerts.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-gray-400">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No alerts found</h3>
              <p className="text-sm">Try adjusting your filters or refresh to see new alerts.</p>
            </div>
          </Card>
        ) : (
          filteredAlerts.map(alert => {
            const severity = getAlertSeverity(alert.type);
            const Icon = severity.icon;
            const statusColor = alert.status === 'resolved' ? 'text-green-600' :
                               alert.status === 'acknowledged' ? 'text-yellow-600' : 'text-red-600';

            return (
              <Card key={alert.id} className={`p-3 sm:p-4 transition-all duration-200 hover:shadow-lg ${
                alert.status === 'resolved' ? 'opacity-75 border-green-200' :
                alert.status === 'acknowledged' ? 'border-yellow-200' : ''
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                  <div className={`p-2 rounded-lg bg-${severity.color}-100 self-start relative`}>
                    <Icon className={`h-4 sm:h-5 w-4 sm:w-5 text-${severity.color}-600`} />
                    {alert.status === 'resolved' && (
                      <CheckCircle className="h-3 w-3 text-green-600 absolute -top-1 -right-1 bg-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm sm:text-base font-medium">{alert.title}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${statusColor} bg-opacity-10 border border-current`}>
                            {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">{alert.description}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {alert.time}
                          </div>
                          <div>Location: {alert.area}</div>
                          <div>Source: {alert.source}</div>
                          <span className={`px-2 py-1 rounded-full bg-${severity.color}-100 text-${severity.color}-600 text-xs`}>
                            {alert.category}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 self-start">
                        <button
                          onClick={() => viewAlertDetails(alert)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {alert.status === 'active' && (
                          <>
                            <button
                              onClick={() => acknowledgeAlert(alert.id)}
                              className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                              title="Acknowledge"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => resolveAlert(alert.id)}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Resolve"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {alert.status === 'acknowledged' && (
                          <button
                            onClick={() => resolveAlert(alert.id)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Resolve"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Alert Detail Modal */}
      {showDetailModal && selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Alert Details</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Alert ID</label>
                    <p className="text-sm">{selectedAlert.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Priority</label>
                    <p className="text-sm">{selectedAlert.priority === 1 ? 'Critical' : selectedAlert.priority === 2 ? 'High' : 'Medium'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Category</label>
                    <p className="text-sm">{selectedAlert.category}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <p className="text-sm capitalize">{selectedAlert.status}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Area</label>
                    <p className="text-sm">{selectedAlert.area}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Source</label>
                    <p className="text-sm">{selectedAlert.source}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Title</label>
                  <p className="text-lg font-medium">{selectedAlert.title}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-sm">{selectedAlert.description}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Timestamp</label>
                  <p className="text-sm">{selectedAlert.timestamp.toLocaleString()}</p>
                </div>

                {selectedAlert.metadata && Object.keys(selectedAlert.metadata).length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Additional Data</label>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded p-3 text-sm">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(selectedAlert.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t">
                  {selectedAlert.status === 'active' && (
                    <>
                      <button
                        onClick={() => {
                          acknowledgeAlert(selectedAlert.id);
                          setShowDetailModal(false);
                        }}
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                      >
                        Acknowledge
                      </button>
                      <button
                        onClick={() => {
                          resolveAlert(selectedAlert.id);
                          setShowDetailModal(false);
                        }}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        Resolve
                      </button>
                    </>
                  )}
                  {selectedAlert.status === 'acknowledged' && (
                    <button
                      onClick={() => {
                        resolveAlert(selectedAlert.id);
                        setShowDetailModal(false);
                      }}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      Resolve
                    </button>
                  )}
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}