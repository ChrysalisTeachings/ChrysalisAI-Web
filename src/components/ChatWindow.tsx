import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot } from 'lucide-react';
import { openaiService } from '../services/openai';

interface Message {
  content: string;
  isBot: boolean;
}

function formatAIResponse(text: string): string {
  text = text.replace(/\*\*(.*?)\*\*/g, (_, content) => content);
  text = text.replace(/(\d+\.)/g, '\n$1');
  text = text.replace(/([•])/g, '\n$1');
  text = text.replace(/\n{3,}/g, '\n\n');
  return text.trim();
}

function ThinkingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-2xl px-4 py-2 bg-gray-900 rounded-tl-sm">
        <div className="flex items-center gap-2 mb-1">
          <Bot className="w-4 h-4" />
          <span className="text-sm font-medium text-blue-300">Chrysalis AI Assistant</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <span>Thinking</span>
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    //scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      const initializeChat = async () => {
        try {
          const response = await openaiService.sendMessage("who are you and why are you here");
          setMessages([{ content: response, isBot: true }]);
        } catch (error) {
          console.error('Error initializing chat:', error);
          setMessages([{
            content: "Hello! I'm your Chrysalis AI Assistant. How can I help you today?",
            isBot: true,
          }]);
        } finally {
          setIsLoading(false);
        }
      };
      initializeChat();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    setMessages(prev => [...prev, { content: userMessage, isBot: false }]);

    try {
      const response = await openaiService.sendMessage(userMessage);
      const formattedResponse = formatAIResponse(response);
      setMessages(prev => [...prev, { content: formattedResponse, isBot: true }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev,
        {
          content: "I apologize, but I'm having trouble processing your request. Please try again later.",
          isBot: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg border border-gray-200 shadow-xl relative">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                message.isBot
                  ? 'bg-gray-900 rounded-tl-sm'
                  : 'bg-blue-900 rounded-tr-sm'
              }`}
            >
              {message.isBot && (
                <div className="flex items-center gap-2 mb-1">
                  <Bot className="w-4 h-4" />
                  <span className="text-sm font-medium text-blue-300">Chrysalis AI Assistant</span>
                </div>
              )}
              <p className="text-gray-100 whitespace-pre-line">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && <ThinkingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-200 p-4 bg-gray-50"
      >
        <div className="flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Chrysalis AI about the Chrysalis Teachings..."
            className="flex-1 bg-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300 text-black"
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`bg-blue-900 text-white rounded-lg px-4 py-2 transition-colors duration-200 flex items-center gap-2 ${
              isLoading 
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-blue-800'
            }`}
            disabled={isLoading}
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">{isLoading ? 'Sending...' : 'Send'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
