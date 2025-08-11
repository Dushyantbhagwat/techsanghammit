import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Send, X, Loader2, MessageSquare } from 'lucide-react';
import { useCity } from '@/contexts/CityContext';
import { getCityIntelligence } from '@/services/cityIntelligence';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

// Function to get real-time city data from various services
const getCityData = async (city: string) => {
  // In a real app, these would be actual API calls to your services
  // For now, we'll return simulated real-time data
  return {
    traffic: {
      congestion: Math.floor(Math.random() * 30 + 40) + '%', // 40-70%
      averageSpeed: Math.floor(Math.random() * 20 + 25) + ' km/h', // 25-45 km/h
      vehicleCount: Math.floor(Math.random() * 300 + 400).toString(), // 400-700
    },
    parking: {
      available: Math.floor(Math.random() * 100 + 150).toString(), // 150-250
      total: '500',
      occupancy: Math.floor(Math.random() * 20 + 40) + '%', // 40-60%
    },
    environment: {
      aqi: Math.floor(Math.random() * 50 + 100).toString(), // 100-150
      temperature: Math.floor(Math.random() * 5 + 25) + '°C', // 25-30°C
      humidity: Math.floor(Math.random() * 20 + 50) + '%', // 50-70%
    },
    streetlights: {
      working: Math.floor(Math.random() * 5 + 95) + '%', // 95-100%
      faults: Math.floor(Math.random() * 10 + 5).toString(), // 5-15
      energy: Math.floor(Math.random() * 100 + 400) + ' kWh', // 400-500 kWh
    },
  };
};

export function ChatAssistant({ isOpen, onClose }: ChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { selectedCity } = useCity();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message when chat is opened
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: `Hello! I'm your city assistant for ${selectedCity}. I can help you with:
• Real-time traffic and parking information
• Environmental conditions and air quality
• Street lighting status
• Latest city updates and events
• General information about ${selectedCity}

What would you like to know?`
        }
      ]);
    }
  }, [isOpen, selectedCity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const cityData = await getCityData(selectedCity);
      const response = await getCityIntelligence(userMessage, selectedCity, cityData);
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I encountered an error while processing your request. Please try asking your question again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-[450px] z-50">
      <Card className="flex flex-col h-[600px] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-primary/5">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">City Assistant - {selectedCity}</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Gathering information...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t bg-primary/5">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your city..."
              className="flex-1 px-3 py-2 rounded-md border bg-white text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button type="submit" disabled={isLoading}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}