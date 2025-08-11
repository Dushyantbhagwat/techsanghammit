import { useState } from "react";
import { Search, Sun, Moon, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Link, useNavigate } from "react-router-dom";
import { ChatAssistant } from "@/components/chat/ChatAssistant";

interface HeaderProps {
  onSidebarToggle: () => void;
}

export function Header({ onSidebarToggle }: HeaderProps) {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background border-b z-50 flex items-center px-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={onSidebarToggle}
        className="mr-2 md:hidden"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex items-center gap-2 w-auto sm:w-64">
        <span className="font-semibold text-foreground hidden sm:inline">Urban</span>
        <div className="w-8 h-8 bg-[#6C5DD3] rounded-lg flex items-center justify-center">
          <span className="text-white font-semibold">X</span>
        </div>
      </div>

      <div className="flex-1 flex items-center px-4">
        <div className="max-w-xl w-full relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 text-sm bg-muted/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          className="rounded-full w-10 h-10"
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5 text-yellow-500" />
          ) : (
            <Moon className="h-5 w-5 text-slate-700" />
          )}
        </Button>

        <ChatAssistant />

        <div className="relative">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="w-8 h-8 bg-[#6C5DD3] rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {user?.displayName?.[0] || user?.email?.[0] || 'U'}
              </span>
            </div>
          </div>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-background rounded-md shadow-lg py-1 z-50 border">
              <Link
                to="/settings"
                className="flex items-center px-4 py-2 text-sm hover:bg-muted"
                onClick={() => setIsDropdownOpen(false)}
              >
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm hover:bg-muted w-full text-left"
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