import { Button } from "@/components/ui/button"
import { MetricCard } from "@/components/metrics/MetricCard"
import { Link } from "react-router-dom"

export function HomePage() {
  const metrics = [
    {
      title: "Air Quality Index",
      value: "65",
      details: [
        { 
          label: "Status",
          value: "Moderate",
          color: "text-amber-500"
        }
      ]
    },
    {
      title: "Traffic Congestion",
      value: "35%",
      details: [
        {
          label: "Status",
          value: "Low",
          color: "text-green-500"
        }
      ]
    },
    {
      title: "Active Alerts",
      value: "2",
      details: [
        {
          label: "Status",
          value: "Warning",
          color: "text-red-500"
        }
      ]
    }
  ]

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            details={metric.details}
            icon={<div className="h-8 w-8 bg-[#6C5DD3]/10 rounded-full" />}
          />
        ))}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link to="/dashboard">View Dashboard</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
          <Link to="/analytics">Access Reports</Link>
        </Button>
      </div>
    </div>
  )
}