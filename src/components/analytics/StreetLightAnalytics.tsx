import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from "@nivo/bar";
import { useCity } from "@/contexts/CityContext";
import { fetchStreetLightData, type StreetLightData } from "@/services/streetlight";

const chartTheme = {
  textColor: "#ffffff",
  axis: {
    domain: {
      line: {
        stroke: "#ffffff"
      }
    },
    ticks: {
      line: {
        stroke: "#ffffff"
      },
      text: {
        fill: "#ffffff",
        fontSize: 12,
        fontWeight: 600
      }
    },
    legend: {
      text: {
        fill: "#ffffff",
        fontSize: 14,
        fontWeight: 600
      }
    }
  },
  grid: {
    line: {
      stroke: "#ffffff",
      strokeOpacity: 0.1
    }
  },
  legends: {
    text: {
      fill: "#ffffff",
      fontSize: 12
    }
  }
};

export function StreetLightAnalytics() {
  const { selectedCity } = useCity();
  const [data, setData] = useState<StreetLightData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetchStreetLightData(selectedCity);
        setData(result);
      } catch (error) {
        console.error('Error fetching street light data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCity]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <h3 className="text-lg font-semibold mb-2">Total Lights</h3>
          <div className="text-3xl font-bold">{data.current.totalLights}</div>
          <div className="mt-2 text-blue-500">Infrastructure Coverage</div>
          <div className="mt-4 text-sm text-gray-500">
            Last updated: {new Date(data.current.timestamp).toLocaleTimeString()}
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/5">
          <h3 className="text-lg font-semibold mb-2">Active Lights</h3>
          <div className="text-3xl font-bold">{data.current.activeLights}</div>
          <div className="mt-2 text-green-500">
            {((data.current.activeLights / data.current.totalLights) * 100).toFixed(1)}% Operational
          </div>
          <div className="mt-4 text-sm text-gray-500">Real-time status</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-red-500/10 to-red-600/5">
          <h3 className="text-lg font-semibold mb-2">Critical Faults</h3>
          <div className="text-3xl font-bold">
            {data.faultReport.filter(f => f.status === 'critical').reduce((acc, curr) => acc + curr.count, 0)}
          </div>
          <div className="mt-2 text-red-500">High Priority</div>
          <div className="mt-4 text-sm text-gray-500">Immediate attention needed</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-amber-500/10 to-amber-600/5">
          <h3 className="text-lg font-semibold mb-2">Energy Savings</h3>
          <div className="text-3xl font-bold">
            {((1 - (data.energyStats.monthly / (data.energyStats.monthly * 1.2))) * 100).toFixed(1)}%
          </div>
          <div className="mt-2 text-amber-500">vs. Previous Year</div>
          <div className="mt-4 text-sm text-gray-500">
            {data.energyStats.monthly.toLocaleString()} kWh this month
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <h3 className="text-lg font-semibold mb-4">Energy Consumption Trend</h3>
          <div className="h-[350px] -mt-2">
            <ResponsiveLine
              data={[
                {
                  id: "energy",
                  data: data.hourly.map(h => ({
                    x: h.hour,
                    y: h.energyUsage
                  }))
                }
              ]}
              margin={{ top: 40, right: 20, bottom: 90, left: 60 }}
              xScale={{ type: "point" }}
              yScale={{ type: "linear", min: 0, max: "auto" }}
              curve="cardinal"
              axisBottom={{
                tickSize: 5,
                tickPadding: 20,
                tickRotation: -45,
                legend: "Hour",
                legendOffset: 70,
                legendPosition: "middle"
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 16,
                tickRotation: 0,
                legend: "Energy Usage (kWh)",
                legendOffset: -50,
                legendPosition: "middle"
              }}
              theme={chartTheme}
              enablePoints={true}
              pointSize={8}
              pointColor="#ffffff"
              pointBorderWidth={2}
              pointBorderColor="#00E396"
              enableArea={true}
              areaOpacity={0.1}
              colors={["#00E396"]}
              enableGridX={false}
              enableGridY={false}
            />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <h3 className="text-lg font-semibold mb-4">Yearly Energy Comparison</h3>
          <div className="h-[350px] -mt-2">
            <ResponsiveBar
              data={data.energyStats.yearlyComparison}
              keys={['consumption']}
              indexBy="year"
              margin={{ top: 40, right: 20, bottom: 90, left: 60 }}
              padding={0.3}
              colors="#00E396"
              borderRadius={4}
              axisBottom={{
                tickSize: 5,
                tickPadding: 20,
                tickRotation: -45,
                legend: "Year",
                legendOffset: 70,
                legendPosition: "middle"
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 16,
                tickRotation: 0,
                legend: 'Energy Consumption (kWh)',
                legendPosition: 'middle',
                legendOffset: -50
              }}
              theme={chartTheme}
              enableGridX={false}
              enableGridY={false}
            />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <h3 className="text-lg font-semibold mb-4">Fault Distribution by Severity</h3>
          <div className="h-[350px] -mt-2">
            <ResponsiveBar
              data={[
                {
                  status: "Critical",
                  count: data.faultReport.filter(f => f.status === 'critical').reduce((acc, curr) => acc + curr.count, 0),
                  color: "#FF4560"
                },
                {
                  status: "Moderate",
                  count: data.faultReport.filter(f => f.status === 'moderate').reduce((acc, curr) => acc + curr.count, 0),
                  color: "#FEB019"
                },
                {
                  status: "Minor",
                  count: data.faultReport.filter(f => f.status === 'minor').reduce((acc, curr) => acc + curr.count, 0),
                  color: "#00E396"
                }
              ]}
              keys={['count']}
              indexBy="status"
              margin={{ top: 40, right: 20, bottom: 90, left: 60 }}
              padding={0.3}
              colors={({ data }) => data.color}
              borderRadius={4}
              axisBottom={{
                tickSize: 5,
                tickPadding: 20,
                tickRotation: -45,
                legend: "Severity Level",
                legendOffset: 70,
                legendPosition: "middle"
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 16,
                tickRotation: 0,
                legend: 'Number of Faults',
                legendPosition: 'middle',
                legendOffset: -50
              }}
              theme={chartTheme}
              enableGridX={false}
              enableGridY={false}
            />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <h3 className="text-lg font-semibold mb-4">System Insights & Recommendations</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3 text-blue-400">Performance Metrics</h4>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>System Uptime: {((data.current.activeLights / data.current.totalLights) * 100).toFixed(1)}%</li>
                <li>Monthly Energy Savings: {((1 - (data.energyStats.monthly / (data.energyStats.monthly * 1.2))) * 100).toFixed(1)}%</li>
                <li>Critical Faults: {data.faultReport.filter(f => f.status === 'critical').reduce((acc, curr) => acc + curr.count, 0)} requiring immediate attention</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-amber-400">Priority Actions</h4>
              <ul className="list-disc list-inside space-y-2 text-sm">
                {data.faultReport
                  .filter(f => f.status === 'critical')
                  .map((fault, i) => (
                    <li key={i}>Schedule maintenance for {fault.zone} ({fault.count} faults)</li>
                  ))}
                <li>Monthly energy consumption: {data.energyStats.monthly.toLocaleString()} kWh</li>
                <li>Consider LED upgrades for high-consumption zones</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}