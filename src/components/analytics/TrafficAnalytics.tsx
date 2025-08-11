import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from "@nivo/bar";
import { useCity } from "@/contexts/CityContext";
import { fetchTrafficData, type LocationTrafficData } from "@/services/traffic";

interface TrafficData {
  current: {
    congestionLevel: number;
    averageSpeed: number;
    vehicleCount: number;
    timestamp: string;
  };
  hourly: Array<{
    hour: string;
    congestionLevel: number;
    averageSpeed: number;
    vehicleCount: number;
  }>;
  junctions: Array<{
    name: string;
    congestionLevel: number;
    vehicleCount: number;
  }>;
}

// Convert service data to component format
const convertTrafficData = (data: LocationTrafficData): TrafficData => {
  // Calculate congestion level based on vehicle count (0-100%)
  const maxVehicles = Math.max(...data.hourlyData.map(h => h.vehicleCount));
  const getCongestionLevel = (count: number) => Math.min(100, Math.round((count / maxVehicles) * 100));
  
  // Calculate average speed (inverse relationship with congestion)
  const getSpeed = (congestion: number) => Math.max(10, Math.round(60 - (congestion * 0.5)));

  // Generate junction names based on location
  const junctionPrefixes: Record<string, string[]> = {
    "thane": ["Eastern Express Highway", "LBS Marg-Teen Hath Naka", "Ghodbunder Road", "Pokhran Road"],
    "borivali": ["Western Express Highway", "SV Road-National Park", "Link Road-IC Colony", "Station Road-East"],
    "kharghar": ["Central Park Signal", "Hiranandani Signal", "Railway Station", "Sector 7 Market"],
    "pune": ["FC Road-JM Road", "Shivaji Nagar Station", "Koregaon Park", "Hinjewadi Phase 1"],
    "nashik": ["College Road Signal", "Old Mumbai-Agra Road", "Gangapur Road", "Nashik Road Station"],
    "panvel": ["Old Panvel Market", "Kalamboli Junction", "Khandeshwar Signal", "New Panvel Station"]
  };

  const prefixes = junctionPrefixes[data.location.toLowerCase()] || ["Main Junction", "Market Square", "Station Area", "Business District"];

  return {
    current: {
      congestionLevel: getCongestionLevel(data.currentTraffic.vehicleCount),
      averageSpeed: getSpeed(getCongestionLevel(data.currentTraffic.vehicleCount)),
      vehicleCount: data.currentTraffic.vehicleCount,
      timestamp: data.currentTraffic.timestamp
    },
    hourly: data.hourlyData.map(h => {
      const congestion = getCongestionLevel(h.vehicleCount);
      return {
        hour: h.hour,
        congestionLevel: congestion,
        averageSpeed: getSpeed(congestion),
        vehicleCount: h.vehicleCount
      };
    }),
    junctions: prefixes.map((name, i) => ({
      name: `${name} Junction`,
      congestionLevel: getCongestionLevel(data.currentTraffic.vehicleCount * (1 + (i * 0.2 - 0.3))),
      vehicleCount: Math.round(data.currentTraffic.vehicleCount * (1 + (i * 0.2 - 0.3)))
    }))
  };
};

export function TrafficAnalytics() {
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const { selectedCity } = useCity();
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Function to load speech synthesis voices with timeout
  const loadVoices = async (): Promise<SpeechSynthesisVoice[]> => {
    return new Promise((resolve, reject) => {
      const maxAttempts = 10;
      let attempts = 0;

      const attemptLoad = () => {
        let voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          resolve(voices);
        } else if (attempts >= maxAttempts) {
          reject(new Error('Failed to load voices after multiple attempts'));
        } else {
          attempts++;
          setTimeout(attemptLoad, 500);
        }
      };

      // Initial attempt
      attemptLoad();

      // Also listen for voiceschanged event
      window.speechSynthesis.onvoiceschanged = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          resolve(voices);
        }
      };
    });
  };

  const stopReading = () => {
    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (speechRef.current) {
        // Remove all event listeners
        speechRef.current.onend = null;
        speechRef.current.onerror = null;
        speechRef.current = null;
      }
      setIsReading(false);
      setSpeechError(null);
    } catch (err) {
      console.error('Error stopping speech synthesis:', err);
    }
  };

  useEffect(() => {
    // Cleanup speech synthesis when component unmounts
    return () => {
      stopReading();
    };
  }, []);

  const startReading = async () => {
    if (!trafficData) {
      setSpeechError('No traffic data available');
      return;
    }

    try {
      if (!window.speechSynthesis) {
        throw new Error('Speech synthesis not supported in your browser');
      }

      // Ensure any previous speech is properly stopped
      stopReading();
      
      // Reset state
      setIsReading(true);
      setSpeechError(null);

      // Create new speech utterance
      const speech = new SpeechSynthesisUtterance();
      
      // Load voices before configuring speech
      const voices = await loadVoices();
      
      // Configure speech settings with fallback voice selection
      speech.rate = 0.9;
      speech.pitch = 1.2;
      speech.volume = 1.0;

      // Try to find the best available voice
      let selectedVoice = null;
      
      // First try to find a female English voice
      selectedVoice = voices.find(voice =>
        voice.lang.startsWith('en') &&
        (voice.name.toLowerCase().includes('female') ||
         voice.name.toLowerCase().includes('woman') ||
         voice.name.toLowerCase().includes('samantha') ||
         voice.name.toLowerCase().includes('victoria'))
      );

      // Fallback to any English voice
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => voice.lang.startsWith('en'));
      }

      // Final fallback to any available voice
      if (!selectedVoice && voices.length > 0) {
        selectedVoice = voices[0];
      }

      if (!selectedVoice) {
        throw new Error('No speech synthesis voices available');
      }

      speech.voice = selectedVoice;
      speech.lang = selectedVoice.lang;

      // Generate speech text with proper null checks
      if (trafficData && trafficData.current && trafficData.hourly) {
        const congestionStatus = trafficData.current.congestionLevel > 70 ? 'Severe' :
          trafficData.current.congestionLevel > 40 ? 'Moderate' : 'Low';
        
        const speedStatus = trafficData.current.averageSpeed > 40 ? 'Normal' : 'Slow';
        
        const peakTraffic = trafficData.current.vehicleCount > 500
          ? ', indicating Peak traffic'
          : '';

        // Sort junctions by congestion level
        const sortedJunctions = [...trafficData.junctions].sort((a, b) => b.congestionLevel - a.congestionLevel);
        const junctionAnalysis = sortedJunctions
          .map(j => `${j.name} has ${j.congestionLevel} percent congestion with ${j.vehicleCount} vehicles.`)
          .join('. ');

        const congestionWarnings = sortedJunctions
          .filter(j => j.congestionLevel > 70)
          .map(j => `Avoid ${j.name} due to heavy congestion.`)
          .join(' ');

        const slowTrafficWarning = trafficData.current.averageSpeed < 30
          ? 'Slow moving traffic, consider alternate routes.'
          : '';

        const delayWarning = trafficData.current.vehicleCount > 500
          ? `Peak hour traffic, expect delays of ${Math.round(trafficData.current.vehicleCount / 50)} minutes.`
          : '';

        const bestTimeData = [...trafficData.hourly].sort((a, b) => a.congestionLevel - b.congestionLevel)[0];
        const bestTime = bestTimeData ? bestTimeData.hour : 'not available';

        speech.text = `
          Current Traffic Status:
          ${congestionStatus} congestion at ${trafficData.current.congestionLevel} percent across major junctions.
          Average speed is ${trafficData.current.averageSpeed} kilometers per hour, indicating ${speedStatus} traffic flow.
          ${trafficData.current.vehicleCount} vehicles currently in transit${peakTraffic}.
          
          Junction Analysis:
          ${junctionAnalysis}
          
          Recommendations:
          ${congestionWarnings}
          ${slowTrafficWarning}
          ${delayWarning}
          Best time to travel is at ${bestTime}.
        `.trim();

        speech.onend = () => {
          setIsReading(false);
          speechRef.current = null;
        };

        speech.onerror = (event) => {
          setSpeechError('Error during speech synthesis');
          setIsReading(false);
          speechRef.current = null;
          console.error('Speech synthesis error:', event);
        };

        // Add event listeners before speaking
        speech.onstart = () => {
          console.log('Speech synthesis started');
        };

        speech.onend = () => {
          setIsReading(false);
          speechRef.current = null;
          // Reset synthesis state
          window.speechSynthesis.cancel();
        };

        speech.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          const errorMessage = event.error === 'network'
            ? 'Network error occurred during speech synthesis'
            : event.error === 'interrupted'
            ? 'Speech synthesis was interrupted'
            : event.error === 'canceled'
            ? 'Speech synthesis was canceled'
            : 'Error during speech synthesis';
          
          setSpeechError(errorMessage);
          setIsReading(false);
          speechRef.current = null;
          // Reset synthesis state
          window.speechSynthesis.cancel();
        };

        // Store reference to current utterance
        speechRef.current = speech;

        // Attempt to speak with retry mechanism
        const maxRetries = 3;
        let retryCount = 0;

        const attemptSpeak = () => {
          try {
            window.speechSynthesis.cancel(); // Clear any existing speech
            window.speechSynthesis.speak(speech);
          } catch (err) {
            console.error('Speech synthesis attempt failed:', err);
            if (retryCount < maxRetries) {
              retryCount++;
              setTimeout(attemptSpeak, 1000); // Retry after 1 second
            } else {
              setSpeechError('Failed to start speech synthesis after multiple attempts');
              setIsReading(false);
              speechRef.current = null;
            }
          }
        };

        attemptSpeak();
      } else {
        setSpeechError('Traffic data is not fully loaded');
        setIsReading(false);
      }
    } catch (err) {
      setSpeechError(err instanceof Error ? err.message : 'Failed to start speech synthesis');
      setIsReading(false);
      console.error('Speech synthesis error:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchTrafficData(selectedCity);
        if (!Array.isArray(data)) {
          setTrafficData(convertTrafficData(data));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch traffic data');
        console.error('Error fetching traffic data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30 * 1000); // Update every 30 seconds
    return () => clearInterval(interval);

    // Add real-time status indicator
    const statusIndicator = document.createElement('div');
    statusIndicator.className = 'absolute top-2 right-2 flex items-center gap-2 text-xs bg-black/50 text-white px-2 py-1 rounded';
    statusIndicator.innerHTML = `
      <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
      Live Updates
    `;
    document.querySelector('.traffic-analytics')?.appendChild(statusIndicator);
  }, [selectedCity]);

  if (isLoading) {
    return <div>Loading traffic data...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!trafficData) {
    return <div>No traffic data available</div>;
  }

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

  return (
    <div className="space-y-6 traffic-analytics relative">
      <div className="absolute top-2 right-2 flex items-center gap-2 text-xs bg-black/50 text-white px-2 py-1 rounded z-10">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        Live Updates
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 relative">
          <h3 className="text-lg font-semibold mb-2">Congestion Level</h3>
          <div className="text-3xl font-bold flex items-center gap-3">
            {trafficData.current.congestionLevel}%
            <span className={`text-sm px-2 py-1 rounded ${
              trafficData.current.congestionLevel > 70 ? 'bg-red-500/20 text-red-500' :
              trafficData.current.congestionLevel > 40 ? 'bg-amber-500/20 text-amber-500' :
              'bg-green-500/20 text-green-500'
            }`}>
              {trafficData.current.congestionLevel > 70 ? 'Severe' :
               trafficData.current.congestionLevel > 40 ? 'Moderate' : 'Low'}
            </span>
          </div>
          <div className="mt-4 text-sm text-gray-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Updated {new Date(trafficData.current.timestamp).toLocaleTimeString()}
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 relative">
          <h3 className="text-lg font-semibold mb-2">Average Speed</h3>
          <div className="text-3xl font-bold flex items-center gap-3">
            {trafficData.current.averageSpeed} km/h
            <span className={`text-sm px-2 py-1 rounded ${
              trafficData.current.averageSpeed < 20 ? 'bg-red-500/20 text-red-500' :
              trafficData.current.averageSpeed < 40 ? 'bg-amber-500/20 text-amber-500' :
              'bg-green-500/20 text-green-500'
            }`}>
              {trafficData.current.averageSpeed < 20 ? 'Slow' :
               trafficData.current.averageSpeed < 40 ? 'Moderate' : 'Normal'}
            </span>
          </div>
          <div className="mt-4 text-sm text-gray-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Live Updates
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 relative">
          <h3 className="text-lg font-semibold mb-2">Vehicle Count</h3>
          <div className="text-3xl font-bold flex items-center gap-3">
            {trafficData.current.vehicleCount}
            <span className={`text-sm px-2 py-1 rounded ${
              trafficData.current.vehicleCount > 600 ? 'bg-red-500/20 text-red-500' :
              trafficData.current.vehicleCount > 400 ? 'bg-amber-500/20 text-amber-500' :
              'bg-green-500/20 text-green-500'
            }`}>
              {trafficData.current.vehicleCount > 600 ? 'Peak Hours' :
               trafficData.current.vehicleCount > 400 ? 'High Traffic' : 'Normal Flow'}
            </span>
          </div>
          <div className="mt-4 text-sm text-gray-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Live Updates
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
        <h3 className="text-lg font-semibold mb-2">Hourly Traffic Flow</h3>
        <div className="h-[400px]">
          <ResponsiveLine
            data={[
              {
                id: "congestion",
                data: trafficData.hourly.map(h => ({
                  x: h.hour,
                  y: h.congestionLevel
                }))
              }
            ]}
            margin={{ top: 40, right: 20, bottom: 70, left: 60 }}
            xScale={{ type: "point" }}
            yScale={{ type: "linear", min: 0, max: 100 }}
            curve="cardinal"
            axisBottom={{
              tickSize: 5,
              tickPadding: 12,
              tickRotation: -45,
              legend: "Hour of Day",
              legendOffset: 60,
              legendPosition: "middle"
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Congestion Level (%)",
              legendOffset: -50,
              legendPosition: "middle"
            }}
            enablePoints={true}
            pointSize={8}
            pointColor="#ffffff"
            enableSlices="x"
            sliceTooltip={({ slice }) => (
              <div className="bg-gray-800 text-white p-3 border border-gray-700 rounded shadow-lg">
                {slice.points.map(point => (
                  <div key={point.id}>
                    <strong>Hour: </strong>{String(point.data.x)}<br />
                    <strong>Congestion: </strong>{String(point.data.y)}%
                  </div>
                ))}
              </div>
            )}
            pointBorderWidth={2}
            pointBorderColor="#FF4560"
            enableArea={true}
            areaOpacity={0.1}
            colors={["#FF4560"]}
            enableGridX={false}
            enableGridY={false}
            theme={chartTheme}
          />
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
        <h3 className="text-lg font-semibold mb-4">Junction-wise Traffic Status</h3>
        <div className="h-[400px] -mt-2">
          <ResponsiveBar
            data={trafficData.junctions}
            keys={['congestionLevel']}
            indexBy="name"
            margin={{ top: 30, right: 20, bottom: 120, left: 60 }}
            padding={0.3}
            valueScale={{ type: 'linear' }}
            colors={({ data }) => {
              const level = data.congestionLevel as number;
              if (level <= 40) return '#00E396';
              if (level <= 70) return '#FEB019';
              return '#FF4560';
            }}
            borderRadius={4}
            enableGridX={false}
            enableGridY={false}
            theme={chartTheme}
            axisBottom={{
              tickSize: 5,
              tickPadding: 25,
              tickRotation: -25,
              legend: "Junction Name",
              legendOffset: 100,
              legendPosition: "middle"
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Congestion Level (%)',
              legendPosition: 'middle',
              legendOffset: -40
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor="#ffffff"
            label={d => `${d.value}%`}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <h3 className="text-lg font-semibold mb-4">Speed vs Vehicle Count</h3>
          <div className="h-[400px] -mt-2">
            <ResponsiveLine
              data={[
                {
                  id: "speed",
                  data: trafficData.hourly.map(h => ({
                    x: h.hour,
                    y: h.averageSpeed
                  })),
                  color: "#775DD0"
                },
                {
                  id: "vehicles",
                  data: trafficData.hourly.map(h => ({
                    x: h.hour,
                    y: h.vehicleCount / 10 // Scale down for better visualization
                  })),
                  color: "#00E396"
                }
              ]}
              margin={{ top: 20, right: 20, bottom: 120, left: 60 }}
              xScale={{ type: "point" }}
              yScale={{ type: "linear", min: "auto", max: "auto" }}
              theme={chartTheme}
              axisBottom={{
                tickSize: 5,
                tickPadding: 20,
                tickRotation: -45,
                legend: "Hour",
                legendOffset: 90,
                legendPosition: "middle",
                format: (value) => {
                  // Format hour values to be more readable
                  const hour = parseInt(value as string);
                  return `${hour}:00`;
                }
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "Speed (km/h) / Vehicle Count",
                legendOffset: -50,
                legendPosition: "middle"
              }}
              pointSize={8}
              pointColor="#ffffff"
              pointBorderWidth={2}
              pointBorderColor={{ from: "color" }}
              enableArea={false}
              enableGridX={false}
              enableGridY={false}
              enableSlices="x"
              sliceTooltip={({ slice }) => (
                <div className="bg-gray-800 text-white p-3 border border-gray-700 rounded shadow-lg">
                  {slice.points.map(point => (
                    <div key={point.id}>
                      <strong>Hour: </strong>{String(point.data.x)}<br />
                      <strong>{point.serieId === 'speed' ? 'Speed: ' : 'Vehicles: '}</strong>
                      {String(point.data.y)}{point.serieId === 'speed' ? ' km/h' : ''}
                    </div>
                  ))}
                </div>
              )}
              legends={[
                {
                  anchor: "bottom",
                  direction: "row",
                  justify: false,
                  translateY: 80,
                  itemsSpacing: 20,
                  itemWidth: 100,
                  itemHeight: 20,
                  symbolSize: 10,
                  symbolShape: "circle",
                  itemTextColor: "#ffffff",
                  effects: [
                    {
                      on: "hover",
                      style: {
                        itemTextColor: "#ffffff"
                      }
                    }
                  ]
                }
              ]}
            />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold">Real-Time Traffic Insights</h3>
            <div className="flex items-center gap-2">
              {speechError && (
                <span className="text-sm text-red-500">{speechError}</span>
              )}
              <button
                onClick={isReading ? stopReading : startReading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isReading
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
                disabled={!!speechError || !trafficData}
              >
                {isReading ? (
                  <>
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Stop Reading
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                    </svg>
                    Read Insights
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="space-y-8">
            <div>
              <h4 className="text-xl font-medium mb-4 flex items-center">
                <span className="w-3 h-3 rounded-full mr-2"
                  style={{
                    backgroundColor: trafficData.current.congestionLevel > 70 ? '#FF4560' :
                                   trafficData.current.congestionLevel > 40 ? '#FEB019' : '#00E396'
                  }}
                />
                Current Status
                <span className="ml-2 text-sm text-gray-400">
                  Updated {new Date(trafficData.current.timestamp).toLocaleTimeString()}
                </span>
              </h4>
              <ul className="list-disc list-inside space-y-3 text-base">
                <li>
                  {trafficData.current.congestionLevel > 70 ? 'Severe' :
                   trafficData.current.congestionLevel > 40 ? 'Moderate' : 'Low'} congestion
                  ({trafficData.current.congestionLevel}%) across major junctions
                </li>
                <li>
                  Average speed is {trafficData.current.averageSpeed} km/h
                  ({trafficData.current.averageSpeed > 40 ? 'Normal' : 'Slow'} traffic flow)
                </li>
                <li>
                  {trafficData.current.vehicleCount} vehicles currently in transit
                  {trafficData.current.vehicleCount > 500 ? ' (Peak traffic)' : ''}
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xl font-medium mb-4">Junction Analysis</h4>
              <ul className="list-disc list-inside space-y-3 text-base">
                {trafficData.junctions
                  .sort((a, b) => b.congestionLevel - a.congestionLevel)
                  .map(junction => (
                    <li key={junction.name} className="flex items-center">
                      <span className="w-2 h-2 rounded-full mr-2"
                        style={{
                          backgroundColor: junction.congestionLevel > 70 ? '#FF4560' :
                                         junction.congestionLevel > 40 ? '#FEB019' : '#00E396'
                        }}
                      />
                      {junction.name}: {junction.congestionLevel}% congestion
                      ({junction.vehicleCount} vehicles)
                    </li>
                  ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xl font-medium mb-4">Real-Time Recommendations</h4>
              <ul className="list-disc list-inside space-y-3 text-base">
                {trafficData.junctions
                  .filter(j => j.congestionLevel > 70)
                  .map(junction => (
                    <li key={junction.name} className="text-red-400">
                      Avoid {junction.name} - Heavy congestion detected
                    </li>
                  ))}
                {trafficData.current.averageSpeed < 30 && (
                  <li className="text-amber-400">
                    Slow moving traffic - Consider alternate routes
                  </li>
                )}
                {trafficData.current.vehicleCount > 500 && (
                  <li className="text-amber-400">
                    Peak hour traffic - Expect delays of {Math.round(trafficData.current.vehicleCount / 50)} minutes
                  </li>
                )}
                <li className="text-blue-400">
                  Best time to travel: {
                    trafficData.hourly
                      .sort((a, b) => a.congestionLevel - b.congestionLevel)[0].hour
                  }
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}