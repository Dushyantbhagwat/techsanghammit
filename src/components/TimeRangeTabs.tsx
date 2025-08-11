import { cn } from "@/lib/utils";

interface TimeRangeTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function TimeRangeTabs({ activeTab, setActiveTab }: TimeRangeTabsProps) {
  const tabs = [
    { id: "DAY", label: "24H" },
    { id: "WK", label: "Week" },
    { id: "MO", label: "Month" },
    { id: "YR", label: "Year" }
  ];

  return (
    <div className="flex items-center justify-center sm:justify-end bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-full sm:w-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={cn(
            "px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors",
            activeTab === tab.id 
              ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm" 
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
          )}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
