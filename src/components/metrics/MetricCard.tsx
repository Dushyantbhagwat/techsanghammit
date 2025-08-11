import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  details?: {
    label: string;
    value: string | number;
    color?: string;
  }[];
  className?: string;
  readMoreLink?: string;
  analyticsSection?: string;
}

export function MetricCard({
  icon,
  title,
  value,
  subtitle,
  details,
  className,
  readMoreLink,
  analyticsSection
}: MetricCardProps) {
  const linkTo = analyticsSection 
    ? `/analytics?section=${analyticsSection}`
    : readMoreLink || '#';

  return (
    <Card className={cn("p-4 sm:p-6 hover:shadow-lg transition-shadow", className)}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <div className="w-10 sm:w-auto">{icon}</div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <div className="flex flex-wrap items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-semibold">{value}</span>
              {subtitle && (
                <span className="text-xs sm:text-sm text-gray-500">{subtitle}</span>
              )}
            </div>
          </div>
        </div>
        {(readMoreLink || analyticsSection) && (
          <Link
            to={linkTo}
            className="text-xs text-[#6C5DD3] hover:underline flex items-center gap-1 sm:self-start"
          >
            <span className="hidden sm:inline">Read more</span>
            <span className="sm:hidden">More</span>
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        )}
      </div>

      {details && (
        <div className="mt-3 sm:mt-4 space-y-2">
          {details.map((detail, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-xs sm:text-sm"
            >
              <span className="text-gray-500">{detail.label}</span>
              <span className={cn("font-medium", detail.color)}>{detail.value}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}