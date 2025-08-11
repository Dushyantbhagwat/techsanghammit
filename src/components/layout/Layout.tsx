import { useState, useCallback } from "react";
import { EnhancedSidebar } from "./enhanced/EnhancedSidebar";
import { useCity } from "@/contexts/CityContext";
import { Header } from "./Header";
import { useTheme } from "@/contexts/ThemeContext";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { isDarkMode } = useTheme();
  const { selectedCity, setSelectedCity } = useCity();

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  }, [isSidebarCollapsed]);

  const handleMobileSidebarToggle = useCallback(() => {
    setIsSidebarOpen(!isSidebarOpen);
  }, [isSidebarOpen]);

  return (
    <div className={`h-screen flex flex-col bg-background text-foreground transition-colors duration-200 ${isDarkMode ? 'dark' : ''}`}>
      <Header 
        onSidebarToggle={handleMobileSidebarToggle} 
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={handleToggleSidebar}
      />
      <div className="flex flex-1 relative">
        <EnhancedSidebar 
          isOpen={isSidebarOpen} 
          onToggle={handleMobileSidebarToggle} 
          selectedCity={selectedCity}
          onCitySelect={setSelectedCity}
          isCollapsed={isSidebarCollapsed}
        />
        <main className={`flex-1 pt-20 transition-all duration-300 ${
          isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
        }`}>
          {children}
        </main>
      </div>
    </div>
  );
}
