import { useState, useRef } from 'react';
import { MessageSquare, Mic, X, Send, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateResponse, generateImageResponse } from '@/services/gemini';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
}

export function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateResponse(input);
      const assistantMessage: Message = {
        role: 'assistant',
        content: response
      };
      setMessages([...newMessages, assistantMessage]);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoice = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };

      if (isListening) {
        recognition.stop();
      } else {
        recognition.start();
      }
    } else {
      alert('Speech recognition is not supported in this browser.');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        const userMessage: Message = {
          role: 'user',
          content: 'Analyzing image...',
          image: reader.result as string
        };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);

        const response = await generateImageResponse('Analyze this image and describe what you see.', base64String);
        const assistantMessage: Message = {
          role: 'assistant',
          content: response
        };
        setMessages([...newMessages, assistantMessage]);
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing image:', error);
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="w-12 h-12 rounded-full bg-[#6C4DFF] hover:bg-[#5B3FE8] shadow-lg flex items-center justify-center"
      >
        <MessageSquare className="h-6 w-6 text-white" />
      </Button>
    );
  }

  return (
    <div className="absolute top-[calc(100%+1rem)] right-4 w-[450px] h-[500px] rounded-2xl overflow-hidden backdrop-blur-xl bg-black/20 border border-white/10 shadow-2xl flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between bg-[#6C4DFF]/10">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-[#6C4DFF]" />
          <span className="font-medium text-white">Nells AI Assistant</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="hover:bg-white/10"
        >
          <X className="h-4 w-4 text-white" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-white/50 mt-4">
            Hi! I'm Nells, your AI assistant. How can I help you today?
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-2.5 ${
                message.role === 'user'
                  ? 'bg-[#6C4DFF] text-white'
                  : 'bg-white/10 text-white'
              }`}
            >
              {message.image && (
                <img
                  src={message.image}
                  alt="Uploaded content"
                  className="max-w-full h-auto rounded-lg mb-2"
                />
              )}
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 text-white rounded-lg p-2.5">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-white/10 bg-[#6C4DFF]/5">
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Nells anything..."
              className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#6C4DFF]"
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
          </div>
          <div className="flex shrink-0 gap-1">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileUpload}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="hover:bg-white/10 w-9 h-9 shrink-0"
              disabled={isLoading}
            >
              <Image className="h-4 w-4 text-white" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleVoice}
              className={`hover:bg-white/10 w-9 h-9 shrink-0 ${isListening ? 'text-red-500' : 'text-white'}`}
              disabled={isLoading}
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleSend}
              className="bg-[#6C4DFF] hover:bg-[#5B3FE8] text-white w-9 h-9 shrink-0"
              disabled={isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}