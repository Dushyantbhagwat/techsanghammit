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

type Language = 'en' | 'hi' | 'mr';

const translations = {
  en: {
    intro: "Hello! Here's your city status update for",
    traffic: "Current traffic conditions show",
    vehicles: "vehicles, indicating",
    congestion: {
      high: "high",
      moderate: "moderate",
      low: "low"
    },
    congestionSuffix: "congestion",
    aqi: "The Air Quality Index is",
    considered: "which is considered",
    co2: "CO2 levels are at",
    ppm: "PPM",
    temperature: "The temperature is",
    celsius: "degrees Celsius",
    healthAdvisory: "Health advisory: Please wear masks when going outside due to poor air quality",
    trafficAdvisory: "Traffic advisory: Consider using alternate routes or public transportation",
    weatherAdvisory: "Weather advisory: Stay hydrated and avoid prolonged sun exposure",
    status: {
      hazardous: "hazardous",
      unhealthy: "unhealthy",
      good: "good",
      criticallyHigh: "critically high",
      elevated: "elevated",
      normal: "normal",
      extremelyHot: "extremely hot",
      warm: "warm",
      comfortable: "comfortable"
    }
  },
  hi: {
    intro: "नमस्ते! यहाँ आपका शहर का स्थिति अपडेट है",
    traffic: "वर्तमान यातायात स्थिति में",
    vehicles: "वाहन हैं, जो दर्शाता है",
    congestion: {
      high: "अधिक",
      moderate: "मध्यम",
      low: "कम"
    },
    congestionSuffix: "भीड़",
    aqi: "वायु गुणवत्ता सूचकांक है",
    considered: "जो माना जाता है",
    co2: "CO2 का स्तर है",
    ppm: "पीपीएम",
    temperature: "तापमान है",
    celsius: "डिग्री सेल्सियस",
    healthAdvisory: "स्वास्थ्य सलाह: खराब वायु गुणवत्ता के कारण बाहर जाते समय मास्क पहनें",
    trafficAdvisory: "यातायात सलाह: वैकल्पिक मार्ग या सार्वजनिक परिवहन का उपयोग करें",
    weatherAdvisory: "मौसम सलाह: पर्याप्त पानी पीएं और धूप में अधिक समय न बिताएं",
    status: {
      hazardous: "खतरनाक",
      unhealthy: "अस्वस्थ",
      good: "अच्छा",
      criticallyHigh: "बहुत अधिक",
      elevated: "उच्च",
      normal: "सामान्य",
      extremelyHot: "बहुत गरम",
      warm: "गरम",
      comfortable: "सुखद"
    }
  },
  mr: {
    intro: "नमस्कार! येथे आपल्या शहराची स्थिती अपडेट आहे",
    traffic: "सध्याची वाहतूक स्थिती दर्शवते",
    vehicles: "वाहने, जे दर्शवते",
    congestion: {
      high: "जास्त",
      moderate: "मध्यम",
      low: "कमी"
    },
    congestionSuffix: "वर्दळ",
    aqi: "हवा गुणवत्ता निर्देशांक आहे",
    considered: "जे मानले जाते",
    co2: "CO2 ची पातळी आहे",
    ppm: "पीपीएम",
    temperature: "तापमान आहे",
    celsius: "अंश सेल्सिअस",
    healthAdvisory: "आरोग्य सल्ला: खराब हवेच्या गुणवत्तेमुळे बाहेर जाताना मास्क घाला",
    trafficAdvisory: "वाहतूक सल्ला: पर्यायी मार्ग किंवा सार्वजनिक वाहतूक वापरा",
    weatherAdvisory: "हवामान सल्ला: भरपूर पाणी प्या आणि उन्हात जास्त वेळ राहू नका",
    status: {
      hazardous: "धोकादायक",
      unhealthy: "अनारोग्यकारक",
      good: "चांगले",
      criticallyHigh: "अत्यंत जास्त",
      elevated: "वाढलेले",
      normal: "सामान्य",
      extremelyHot: "अत्यंत गरम",
      warm: "गरम",
      comfortable: "आरामदायक"
    }
  }
} as const;

export function VoiceAssistant({ data }: VoiceAssistantProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoiceReady, setIsVoiceReady] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  const generateMessage = useCallback((lang: Language) => {
    const t = translations[lang];
    const messages = [
      `${t.intro} ${data.time} ${lang === 'en' ? 'on' : ''} ${data.date}.`,
      `${t.traffic} ${data.traffic.vehicleCount} ${t.vehicles} ${t.congestion[data.traffic.congestionLevel as keyof typeof t.congestion]} ${t.congestionSuffix}.`,
      `${t.aqi} ${data.aqi.value}, ${t.considered} ${t.status[data.aqi.category as keyof typeof t.status]}.`,
      `${t.co2} ${data.co2.value} ${t.ppm}, ${t.status[data.co2.status.replace(' ', '') as keyof typeof t.status]}.`,
      `${t.temperature} ${data.temperature.value} ${t.celsius}, ${t.status[data.temperature.status.replace(' ', '') as keyof typeof t.status]}.`
    ];

    if (data.aqi.value > 150) {
      messages.push(t.healthAdvisory);
    }
    if (data.traffic.congestionLevel === "high") {
      messages.push(t.trafficAdvisory);
    }
    if (data.temperature.value > 35) {
      messages.push(t.weatherAdvisory);
    }

    return messages.join(' ');
  }, [data]);

  useEffect(() => {
    const initVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      let preferredVoice: SpeechSynthesisVoice | null = null;

      // Try to find a voice for the selected language
      if (selectedLanguage === 'hi') {
        preferredVoice = voices.find(voice => voice.lang.startsWith('hi')) || null;
      } else if (selectedLanguage === 'mr') {
        preferredVoice = voices.find(voice => voice.lang.startsWith('mr')) || null;
      }

      // Fallback to English female voice if preferred language voice not found
      if (!preferredVoice) {
        preferredVoice = voices.find(voice => 
          voice.lang.startsWith('en') && (
            voice.name.toLowerCase().includes('female') ||
            voice.name.includes('Samantha') ||
            voice.name.includes('Victoria') ||
            voice.name.includes('Karen') ||
            voice.name.includes('Moira')
          )
        ) || voices.find(voice => voice.lang.startsWith('en')) || null;
      }

      if (preferredVoice) {
        selectedVoiceRef.current = preferredVoice;
        setIsVoiceReady(true);
      } else {
        selectedVoiceRef.current = null;
        setIsVoiceReady(false);
      }
    };

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
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
  }, [selectedLanguage]);

  const speak = useCallback(() => {
    if (!isVoiceReady || !selectedVoiceRef.current) return;

    window.speechSynthesis.cancel();

    const newUtterance = new SpeechSynthesisUtterance(generateMessage(selectedLanguage));
    
    newUtterance.voice = selectedVoiceRef.current;
    newUtterance.rate = 0.9;
    newUtterance.pitch = 1.1;
    newUtterance.volume = 1.0;
    
    // Set language even if specific voice is not available
    newUtterance.lang = selectedLanguage === 'hi' ? 'hi-IN' : 
                       selectedLanguage === 'mr' ? 'mr-IN' : 
                       'en-IN';
    
    newUtterance.onstart = () => setIsSpeaking(true);
    newUtterance.onend = () => setIsSpeaking(false);
    newUtterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
    };

    utteranceRef.current = newUtterance;
    window.speechSynthesis.speak(newUtterance);
  }, [generateMessage, isVoiceReady, selectedLanguage]);

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
        <div className="flex items-center gap-2">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value as Language)}
            className="px-3 py-2 bg-black text-white border border-gray-800 rounded-md text-sm hover:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSpeaking}
          >
            <option value="en" className="bg-black text-white">English</option>
            <option value="hi" className="bg-black text-white">हिंदी</option>
            <option value="mr" className="bg-black text-white">मराठी</option>
          </select>
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