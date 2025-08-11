import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

interface TrendIndicatorProps {
  value: number;
  className?: string;
}

function TrendIndicator({ value, className }: TrendIndicatorProps) {
  if (value > 0) {
    return (
      <span className={cn("flex items-center text-red-500", className)}>
        <ArrowUp className="w-4 h-4 mr-1" />
        {Math.abs(value)}%
      </span>
    );
  } else if (value < 0) {
    return (
      <span className={cn("flex items-center text-green-500", className)}>
        <ArrowDown className="w-4 h-4 mr-1" />
        {Math.abs(value)}%
      </span>
    );
  }
  return (
    <span className={cn("flex items-center text-gray-400", className)}>
      <Minus className="w-4 h-4 mr-1" />
      {value}%
    </span>
  );
}

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  subtitle?: string;
  loading?: boolean;
}

export function StatCard({
  title,
  value,
  icon,
  trend = 0,
  subtitle,
  className,
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <div className={cn(
        "bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow",
        className
      )}>
        <div className="animate-pulse space-y-3">
          <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          {subtitle && <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
          {icon}
        </div>
        {trend !== undefined && (
          <div className="text-sm">
            <TrendIndicator value={trend} />
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </p>
        <div className="flex items-baseline mt-1">
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
        {subtitle && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
