import { cn } from "@/lib/utils";

interface ParkingVisualizationProps {
  total: number;
  occupied: number;
  className?: string;
}

export function ParkingVisualization({ total, occupied, className }: ParkingVisualizationProps) {
  const available = total - occupied;
  const occupancyPercentage = Math.round((occupied / total) * 100);
  
  // Determine the color based on occupancy percentage
  const getOccupancyColor = (percentage: number) => {
    if (percentage < 40) return 'bg-green-400';
    if (percentage < 70) return 'bg-amber-400';
    return 'bg-red-400';
  };

  return (
    <div className={cn("w-full space-y-3", className)}>
      {/* Occupancy Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-500",
            getOccupancyColor(occupancyPercentage)
          )}
          style={{ width: `${occupancyPercentage}%` }}
        />
      </div>
      
      {/* Mini Parking Lot Visualization */}
      <div className="grid grid-cols-10 gap-1.5">
        {Array.from({ length: total }).map((_, index) => (
          <div 
            key={index}
            className={cn(
              "h-3 rounded-sm transition-colors",
              index < occupied 
                ? 'bg-red-400' 
                : 'bg-green-400',
              {
                'opacity-50': index % 2 === 0
              }
            )}
          />
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-400 rounded-sm mr-1" />
          <span>{available} Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-400 rounded-sm mr-1" />
          <span>{occupied} Occupied</span>
        </div>
      </div>
    </div>
  );
}
