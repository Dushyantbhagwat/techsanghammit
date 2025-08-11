import { useState, useCallback } from "react";
import { Search, Sun, Moon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Link, useNavigate, useLocation } from "react-router-dom";

export function Header() {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    
    // Check for specific keywords to determine navigation
    const queryLower = query.toLowerCase();
    if (queryLower.includes('environmental') || queryLower.includes('aqi') || queryLower.includes('pollution')) {
      navigate(`/analytics?tab=environmental&search=${encodeURIComponent(query)}`);
    } else if (queryLower.includes('traffic') || queryLower.includes('vehicle')) {
      navigate(`/analytics?tab=traffic&search=${encodeURIComponent(query)}`);
    } else if (queryLower.includes('parking')) {
      navigate(`/analytics?tab=parking&search=${encodeURIComponent(query)}`);
    } else if (queryLower.includes('security') || queryLower.includes('camera')) {
      navigate(`/analytics?tab=security&search=${encodeURIComponent(query)}`);
    } else if (queryLower.includes('streetlight') || queryLower.includes('light')) {
      navigate(`/analytics?tab=streetlight&search=${encodeURIComponent(query)}`);
    } else {
      // Handle search based on current route if no specific keywords match
      const currentPath = location.pathname;
      if (currentPath.includes('/camera')) {
        navigate(`/camera?search=${encodeURIComponent(query)}`);
      } else if (currentPath.includes('/analytics')) {
        navigate(`/analytics?search=${encodeURIComponent(query)}`);
      } else if (currentPath.includes('/alerts')) {
        navigate(`/alerts?search=${encodeURIComponent(query)}`);
      } else {
        navigate(`/dashboard?search=${encodeURIComponent(query)}`);
      }
    }
  }, [location.pathname, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDropdownLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background border-b z-50 flex items-center px-4 transition-colors duration-200">
      {/* Logo */}
      <div className="flex items-center gap-2 w-64 h-full pr-4">
        <span className="font-semibold text-foreground">Urban</span>
        <div className="w-8 h-8 bg-[#6C5DD3] rounded-lg flex items-center justify-center">
          <span className="text-white font-semibold">X</span>
        </div>
      </div>

      {/* Search */}
      <div className="flex-1 flex items-center px-4">
        <div className="max-w-xl w-full relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-muted/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:border-transparent text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 pl-4 h-full">
        {/* Logout Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="rounded-full w-10 h-10 hover:bg-muted"
          title="Logout"
        >
          <LogOut className="h-5 w-5 text-muted-foreground" />
        </Button>

        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          className="rounded-full w-10 h-10 hover:bg-muted"
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5 text-yellow-500" />
          ) : (
            <Moon className="h-5 w-5 text-slate-700" />
          )}
        </Button>

        {/* User Profile */}
        <div className="relative">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="flex items-center gap-1">
              <div className="w-8 h-8 bg-[#6C5DD3] rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {user?.displayName ? user.displayName[0].toUpperCase() : user?.email[0].toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-foreground">
                {user?.displayName || user?.email}
              </span>
            </div>
            <Button variant="ghost" size="sm" className="hover:bg-muted">
              <svg
                className={`h-4 w-4 text-muted-foreground transform transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </Button>
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-background rounded-md shadow-lg py-1 z-50 border">
              <Link
                to="/settings"
                className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted"
                onClick={() => setIsDropdownOpen(false)}
              >
                Settings
              </Link>
              <button
                onClick={handleDropdownLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted w-full text-left"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}