import { useEffect, useState, useCallback, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Volume2, VolumeX } from 'lucide-react';

interface VoiceAssistantProps {
  data: {
    time: string;
    date: string;
    traffic: {
      vehicleCount: number;
      congestionLevel: string;
    };
    aqi: {
      value: number;
      category: string;
    };
    co2: {
      value: number;
      status: string;
    };
    temperature: {
      value: number;
      status: string;
    };
  };
}

export function VoiceAssistant({ data }: VoiceAssistantProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoiceReady, setIsVoiceReady] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  const generateMessage = useCallback(() => {
    const messages = [
      `Hello! Here's your city status update for ${data.time} on ${data.date}.`,
      `Current traffic conditions show ${data.traffic.vehicleCount} vehicles, indicating ${data.traffic.congestionLevel} congestion.`,
      `The Air Quality Index is ${data.aqi.value}, which is considered ${data.aqi.category}.`,
      `CO2 levels are at ${data.co2.value} PPM, ${data.co2.status}.`,
      `The temperature is ${data.temperature.value} degrees Celsius, ${data.temperature.status}.`
    ];

    // Add dynamic tips based on conditions
    if (data.aqi.value > 150) {
      messages.push("Health advisory: Please wear masks when going outside due to poor air quality.");
    }
    if (data.traffic.congestionLevel === "high") {
      messages.push("Traffic advisory: Consider using alternate routes or public transportation.");
    }
    if (data.temperature.value > 35) {
      messages.push("Weather advisory: Stay hydrated and avoid prolonged sun exposure.");
    }

    return messages.join(' ');
  }, [data]);

  // Initialize speech synthesis and voice selection
  useEffect(() => {
    const initVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      // Try to find a female English voice
      const femaleVoice = voices.find(voice => 
        voice.lang.startsWith('en') && (
          voice.name.toLowerCase().includes('female') ||
          voice.name.includes('Samantha') ||
          voice.name.includes('Victoria') ||
          voice.name.includes('Karen') ||
          voice.name.includes('Moira')
        )
      ) || voices.find(voice => voice.lang.startsWith('en')); // Fallback to any English voice

      if (femaleVoice) {
        selectedVoiceRef.current = femaleVoice;
        setIsVoiceReady(true);
      }
    };

    // Handle voice initialization
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Chrome loads voices asynchronously
      if (window.speechSynthesis.getVoices().length > 0) {
        initVoice();
      }
      window.speechSynthesis.onvoiceschanged = initVoice;
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback(() => {
    if (!isVoiceReady || !selectedVoiceRef.current) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Create new utterance
    const newUtterance = new SpeechSynthesisUtterance(generateMessage());
    
    // Configure voice parameters
    newUtterance.voice = selectedVoiceRef.current;
    newUtterance.rate = 0.9;  // Slightly slower for better clarity
    newUtterance.pitch = 1.1; // Slightly higher pitch for female voice
    newUtterance.volume = 1.0; // Maximum volume
    
    // Event handlers
    newUtterance.onstart = () => setIsSpeaking(true);
    newUtterance.onend = () => setIsSpeaking(false);
    newUtterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
    };

    utteranceRef.current = newUtterance;
    window.speechSynthesis.speak(newUtterance);
  }, [generateMessage, isVoiceReady]);

  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      speak();
    }
  };

  if (!('speechSynthesis' in window)) {
    return null;
  }

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Voice Assistant</h3>
          <p className="text-sm text-gray-500">
            {isVoiceReady 
              ? "Click to hear city status update" 
              : "Initializing voice..."}
          </p>
        </div>
        <button
          onClick={toggleSpeech}
          disabled={!isVoiceReady}
          className={`p-3 rounded-full transition-colors ${
            !isVoiceReady 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : isSpeaking 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
          }`}
          aria-label={isSpeaking ? 'Stop speaking' : 'Start speaking'}
        >
          {isSpeaking ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
        </button>
      </div>
      <div className="mt-4 text-sm">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Traffic Status:</span>
            <span className={`font-medium ${
              data.traffic.congestionLevel === 'high' ? 'text-red-500' :
              data.traffic.congestionLevel === 'moderate' ? 'text-yellow-500' :
              'text-green-500'
            }`}>
              {data.traffic.congestionLevel.charAt(0).toUpperCase() + data.traffic.congestionLevel.slice(1)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Air Quality:</span>
            <span className={`font-medium ${
              data.aqi.value > 150 ? 'text-red-500' :
              data.aqi.value > 100 ? 'text-yellow-500' :
              'text-green-500'
            }`}>
              {data.aqi.category}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Temperature:</span>
            <span className={`font-medium ${
              data.temperature.value > 35 ? 'text-red-500' :
              data.temperature.value > 30 ? 'text-yellow-500' :
              'text-green-500'
            }`}>
              {data.temperature.value}°C
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}