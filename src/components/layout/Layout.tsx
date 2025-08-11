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
      <div className="flex flex-1 overflow-hidden">
        <EnhancedSidebar 
          isOpen={isSidebarOpen} 
          onToggle={handleToggleSidebar} 
          selectedCity={selectedCity}
          onCitySelect={setSelectedCity}
          isCollapsed={isSidebarCollapsed}
        />
        <div className="flex-1 flex flex-col">
          <Header 
            onSidebarToggle={handleMobileSidebarToggle} 
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={handleToggleSidebar}
          />
          <main 
            className={`flex-1 transition-all duration-300 ease-in-out overflow-y-auto`}
            style={{
              marginLeft: isSidebarCollapsed ? '72px' : '280px',
              transition: 'margin-left 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
              paddingTop: '64px', // Height of the header
              height: '100vh',
            }}
          >
            <div className="w-full max-w-full min-h-[calc(100vh-64px)] px-4 md:px-6 py-4">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
