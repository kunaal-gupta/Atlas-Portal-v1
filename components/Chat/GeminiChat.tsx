
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, Loader2 } from 'lucide-react';
import { sendMessageToGemini } from '../../services/geminiService';
import { ChatMessage } from '../../types';

const GeminiChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello! I am your Mozaic Portal Assistant. How can I help you today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const response = await sendMessageToGemini(messages, input);
    
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      {isOpen ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl w-[380px] h-[550px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 origin-bottom-right">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-600 to-indigo-600 p-4 flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Portal Assistant</h3>
                <div className="flex items-center text-[10px] text-white/70">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 animate-pulse"></div>
                  Powered by Gemini 3 Pro
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1.5 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-950/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-pink-600 text-white rounded-tr-none' 
                    : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start items-center space-x-2 text-slate-500">
                <div className="bg-slate-800 border border-slate-700 p-3 rounded-2xl rounded-tl-none flex items-center space-x-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-pink-500" />
                  <span className="text-[10px] font-medium italic tracking-wide">Assistant is thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-800 bg-slate-900">
            <div className="relative flex items-center">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask anything about resources..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-4 pr-12 text-xs outline-none focus:ring-1 focus:ring-pink-500 transition-all text-white placeholder-slate-600"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 p-2 text-pink-500 hover:text-pink-400 disabled:text-slate-700 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-2 text-[8px] text-center text-slate-600 uppercase tracking-widest font-bold">
              Secure Internal Portal AI
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-pink-600 to-indigo-600 p-4 rounded-full shadow-2xl hover:scale-110 transition-transform group relative border-2 border-white/10"
        >
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-950"></div>
          <Sparkles className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
        </button>
      )}
    </div>
  );
};

export default GeminiChat;
