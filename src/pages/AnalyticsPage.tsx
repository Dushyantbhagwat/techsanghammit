import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { StreetLightAnalytics } from "@/components/analytics/StreetLightAnalytics";
import { TrafficAnalytics } from "@/components/analytics/TrafficAnalytics";
import { ParkingAnalytics } from "@/components/analytics/ParkingAnalytics";
import { EnvironmentalAnalytics } from "@/components/analytics/EnvironmentalAnalytics";
import { SecurityAnalytics } from "@/components/analytics/SecurityAnalytics";
import { fetchTrafficData, type LocationTrafficData } from "@/services/traffic";
import { fetchEnvironmentalData } from "@/services/aqi";
import { fetchParkingData, type LocationParkingData } from "@/services/parking";
import { fetchStreetLightData } from "@/services/streetlight";
import { fetchSecurityData, type SecurityData } from "@/services/security";
import { useCity } from "@/contexts/CityContext";

type AnalyticsSection = 'traffic' | 'lights' | 'parking' | 'environmental' | 'security';

interface EnvironmentalData {
  current: {
    temperature: number;
    humidity: number;
    aqi: {
      value: number;
      category: string;
    };
    co2: number;
  };
}

interface StreetLightData {
  current: {
    totalLights: number;
    activeLights: number;
    faultyLights: number;
  };
}

const sections = [
  { id: 'traffic', label: 'Traffic Flow' },
  { id: 'lights', label: 'Street Lights' },
  { id: 'parking', label: 'Parking' },
  { id: 'environmental', label: 'Environmental' },
  { id: 'security', label: 'Security' }
] as const;

export function AnalyticsPage() {
  const { selectedCity } = useCity();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<AnalyticsSection>('traffic');
  const [trafficData, setTrafficData] = useState<LocationTrafficData | null>(null);
  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalData | null>(null);
  const [parkingData, setParkingData] = useState<LocationParkingData | null>(null);
  const [streetLightData, setStreetLightData] = useState<StreetLightData | null>(null);
  const [securityData, setSecurityData] = useState<SecurityData | null>(null);

  // Fetch data for the active section
  useEffect(() => {
    const fetchSectionData = async () => {
      if (!selectedCity) return;

      try {
        switch (activeSection) {
          case 'traffic':
            const tData = await fetchTrafficData(selectedCity);
            setTrafficData(Array.isArray(tData) ? tData[0] : tData);
            break;
          case 'environmental':
            const eData = await fetchEnvironmentalData(selectedCity);
            setEnvironmentalData(eData);
            break;
          case 'parking':
            const pData = await fetchParkingData(selectedCity);
            setParkingData(Array.isArray(pData) ? pData[0] : pData);
            break;
          case 'lights':
            const lData = await fetchStreetLightData(selectedCity);
            setStreetLightData(lData);
            break;
          case 'security':
            const sData = await fetchSecurityData(selectedCity);
            setSecurityData(sData);
            break;
        }
      } catch (error) {
        console.error(`Error fetching ${activeSection} data:`, error);
      }
    };

    fetchSectionData();
  }, [activeSection, selectedCity]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && sections.some(s => s.id === tab)) {
      setActiveSection(tab as AnalyticsSection);
    }
  }, [searchParams]);

  const handleSectionChange = (section: AnalyticsSection) => {
    setActiveSection(section);
    // Preserve existing search parameter when changing sections
    const search = searchParams.get('search') || '';
    setSearchParams({ tab: section, ...(search ? { search } : {}) });
  };

  const renderAnalytics = () => {
    switch (activeSection) {
      case 'traffic':
        return <TrafficAnalytics />;
      case 'lights':
        return <StreetLightAnalytics />;
      case 'parking':
        return <ParkingAnalytics />;
      case 'environmental':
        return <EnvironmentalAnalytics />;
      case 'security':
        return <SecurityAnalytics />;
      default:
        return <TrafficAnalytics />;
    }
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-bold">Analytics & Reports</h1>
        <button
          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#FF4560] hover:bg-[#FF3550] text-white rounded-lg flex items-center justify-center sm:justify-start gap-2 transition-colors text-sm sm:text-base w-full sm:w-auto"
          onClick={() => {
            // Generate report based on active section
            const generateReport = () => {
              const now = new Date().toLocaleString();
              let reportContent = `Smart City Analytics Report\nGenerated on: ${now}\n\n`;

              switch (activeSection) {
                case 'traffic':
                  reportContent += `Traffic Analytics Report\n` +
                    `Current Vehicle Count: ${trafficData?.currentTraffic.vehicleCount || 0} vehicles/hour\n` +
                    `Peak Hour Count: ${trafficData?.peakHour.vehicleCount || 0} vehicles\n` +
                    `Peak Hour: ${trafficData?.peakHour.hour}:00\n` +
                    `Duration: ${Math.round((trafficData?.currentTraffic.duration || 0) / 60)} minutes\n\n`;
                  
                  if (trafficData?.hotspots?.length) {
                    reportContent += 'Traffic Hotspots:\n';
                    trafficData.hotspots.forEach(hotspot => {
                      reportContent += `${hotspot.name}:\n` +
                        `- Congestion Level: ${hotspot.congestionLevel * 100}%\n` +
                        `- Vehicle Count: ${hotspot.vehicleCount}\n`;
                    });
                  }
                  break;
                case 'environmental':
                  reportContent += `Environmental Analytics Report\n` +
                    `Temperature: ${environmentalData?.current.temperature || 0}°C\n` +
                    `Air Quality Index: ${environmentalData?.current.aqi.value || 0} (${environmentalData?.current.aqi.category || 'N/A'})\n` +
                    `Humidity: ${environmentalData?.current.humidity || 0}%\n` +
                    `CO₂ Levels: ${environmentalData?.current.co2 || 0} ppm\n`;
                  break;
                case 'parking':
                  reportContent += `Parking Analytics Report\n` +
                    `Total Spaces: ${parkingData?.current.totalSpaces || 0}\n` +
                    `Occupied Spaces: ${parkingData?.current.occupiedSpaces || 0}\n` +
                    `Current Occupancy Rate: ${parkingData?.current.occupancyRate || 0}%\n\n`;
                  
                  if (parkingData?.locations) {
                    reportContent += 'Location Details:\n';
                    parkingData.locations.forEach(loc => {
                      reportContent += `${loc.name}:\n` +
                        `- Spaces: ${loc.occupiedSpaces}/${loc.totalSpaces}\n` +
                        `- Occupancy: ${loc.occupancyRate}%\n`;
                    });
                  }
                  break;
                case 'lights':
                  reportContent += `Street Light Analytics Report\n` +
                    `Total Lights: ${streetLightData?.current.totalLights || 0}\n` +
                    `Active Lights: ${streetLightData?.current.activeLights || 0}\n` +
                    `Faulty Lights: ${streetLightData?.current.faultyLights || 0}\n` +
                    `Efficiency Rate: ${streetLightData?.current ? Math.round((streetLightData.current.activeLights / streetLightData.current.totalLights) * 100) : 0}%\n`;
                  break;
                case 'security':
                  reportContent += `Security Analytics Report\n` +
                    `Active Cameras: ${securityData?.current.activeCameras || 0}\n` +
                    `Active Alerts: ${securityData?.current.activeAlerts || 0}\n` +
                    `Current Incidents: ${securityData?.current.incidentCount || 0}\n\n`;
                  
                  if (securityData?.zones) {
                    reportContent += 'Zone Status:\n';
                    securityData.zones.forEach(zone => {
                      reportContent += `${zone.name}:\n` +
                        `- Risk Level: ${zone.riskLevel}\n` +
                        `- Active Cameras: ${zone.activeCameras}\n` +
                        `- Incidents: ${zone.incidentCount}\n`;
                    });
                  }
                  
                  if (securityData?.incidentTypes) {
                    reportContent += '\nIncident Distribution:\n';
                    securityData.incidentTypes.forEach(type => {
                      reportContent += `${type.type}: ${type.count} incidents\n`;
                    });
                  }
                  break;
              }

              // Create and download the report
              const blob = new Blob([reportContent], { type: 'text/plain' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `smart-city-${activeSection}-report-${new Date().toISOString().split('T')[0]}.txt`;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
            };

            generateReport();
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Download Report
        </button>
      </div>

      <Card className="p-1 overflow-x-auto">
        <div className="flex items-center bg-[#F4F7FE] rounded-lg p-1 min-w-max">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeSection === section.id
                  ? "bg-[#6C5DD3] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => handleSectionChange(section.id as AnalyticsSection)}
            >
              {section.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Analytics Content */}
      <div className="mt-4 sm:mt-6">
        {renderAnalytics()}
      </div>
    </div>
  );
}