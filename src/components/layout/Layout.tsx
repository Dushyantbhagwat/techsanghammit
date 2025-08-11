import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useTheme } from "@/contexts/ThemeContext";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen bg-background text-foreground transition-colors duration-200 ${isDarkMode ? 'dark' : ''}`}>
      <Header onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <main
        className={`pt-16 transition-all duration-300
          ${isSidebarOpen ? "md:pl-64" : "pl-0"}
          px-4 md:px-6 lg:px-8
          ${isSidebarOpen ? "sm:pl-0 md:pl-64" : "pl-0"}
        `}
      >
        {children}
      </main>
    </div>
  );
}