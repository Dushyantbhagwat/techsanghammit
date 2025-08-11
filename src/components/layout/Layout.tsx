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
    <div className={`h-screen flex flex-col bg-background text-foreground transition-colors duration-200 ${isDarkMode ? 'dark' : ''}`}>
      <Header onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-1 relative">
        <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 px-4 md:px-6 lg:px-8 pt-4">
          {children}
        </main>
      </div>
    </div>
  );
}