import { cn } from "@/lib/utils";

const formatCityName = (city: string) => {
  return city.charAt(0).toUpperCase() + city.slice(1);
};
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Clock,
  MapPin,
  Bell,
  Settings,
  FileText,
  ChevronRight,
  Camera,
  AlertTriangle,
  Building2,
  Car,
  Siren,
} from "lucide-react";
import { useState } from "react";
import { useCity } from "@/contexts/CityContext";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Clock, label: "DASHBOARD", path: "/dashboard" },
  { icon: MapPin, label: "MAP VIEW", path: "/map" },
  { icon: Camera, label: "CAMERA MONITORING", path: "/cameras" },
  { icon: Car, label: "PARKING", path: "/parking" },
  { icon: Siren, label: "AMBULANCE DETECTION", path: "/ambulance" },
  { icon: Bell, label: "ALERTS", path: "/alerts" },
  { icon: Building2, label: "CITY UPDATES", path: "/city-updates" },
  { icon: FileText, label: "ANALYTICS", path: "/analytics" },
  { icon: AlertTriangle, label: "HAZARDS", path: "/hazards" },
  { icon: Settings, label: "SETTINGS", path: "/settings" },
];

const denseAreas = [
  "thane",
  "borivali",
  "kharghar",
  "pune",
  "delhi-ncr",
  "panvel"
] as const;

const alertTypes = [
  { type: "Critical", color: "bg-red-500", severity: "red" },
  { type: "Warning", color: "bg-yellow-500", severity: "yellow" },
  { type: "Info", color: "bg-green-500", severity: "green" }
];

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAreasExpanded, setIsAreasExpanded] = useState(true);
  const { selectedCity, setSelectedCity } = useCity();
  const [isParkingExpanded, setIsParkingExpanded] = useState(true);

  const handleAlertTypeClick = (severity: string) => {
    navigate(`/alerts?type=${severity}`);
  };

  return (
    <div className="h-full">
      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onToggle}
        />
      )}
      <aside
        className={cn(
          "fixed md:relative h-full w-[85vw] md:w-64 bg-[#6C5DD3] dark:bg-[#4A3E99] transition-transform duration-300 ease-in-out overflow-y-hidden hover:overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent",
          !isOpen && "transform -translate-x-full"
        )}
      >
        <div className="flex flex-col h-full text-white">
          {/* Location Selection */}
          <div className="p-3 border-b border-white/10">
            <button
              onClick={() => setIsAreasExpanded(!isAreasExpanded)}
              className="flex items-center justify-between w-full text-sm font-medium"
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Large Metropolitan Area</span>
              </div>
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform",
                isAreasExpanded && "transform rotate-180"
              )} />
            </button>
            
            {isAreasExpanded && (
              <div className="mt-2 ml-6 space-y-0.5">
                {denseAreas.map((area) => (
                  <div
                    key={area}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-white/10",
                      selectedCity === area && "bg-white/10"
                    )}
                    onClick={() => setSelectedCity(area)}
                  >
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-sm">{formatCityName(area)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-0.5">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  location.pathname === item.path
                    ? "bg-white/20 dark:bg-white/30"
                    : "hover:bg-white/10"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Alerts Filter */}
          <div className="p-3 border-t border-white/10">
            <div className="text-sm font-medium mb-1">Alerts type</div>
            <div className="space-y-0.5">
              {alertTypes.map((alert) => {
                // Dynamic count based on time and alert type
                const now = new Date();
                const hour = now.getHours();
                let count = 0;

                if (alert.severity === 'red') {
                  count = hour >= 7 && hour <= 9 || hour >= 17 && hour <= 19 ? 2 + Math.floor(Math.random() * 3) : Math.floor(Math.random() * 2);
                } else if (alert.severity === 'yellow') {
                  count = hour >= 8 && hour <= 18 ? 5 + Math.floor(Math.random() * 5) : 2 + Math.floor(Math.random() * 3);
                } else {
                  count = 1 + Math.floor(Math.random() * 2);
                }

                return (
                  <div
                    key={alert.type}
                    className="flex items-center justify-between cursor-pointer hover:bg-white/10 px-2 py-1.5 rounded transition-colors"
                    onClick={() => handleAlertTypeClick(alert.severity)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn("h-2 w-2 rounded-full", alert.color)} />
                      <span className="text-sm">{alert.type}</span>
                    </div>
                    <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Parking Availability */}
          <div className="p-3 border-t border-white/10">
            <button
              onClick={() => setIsParkingExpanded(!isParkingExpanded)}
              className="flex items-center justify-between w-full text-sm font-medium"
            >
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4" />
                <span>Parking Availability</span>
              </div>
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform",
                isParkingExpanded && "transform rotate-180"
              )} />
            </button>
            
            {isParkingExpanded && (
              <div className="mt-2 ml-6 space-y-0.5">
                <div className="flex items-center gap-2 px-2 py-1 rounded">
                  <span className="text-sm">No Parking Available</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}