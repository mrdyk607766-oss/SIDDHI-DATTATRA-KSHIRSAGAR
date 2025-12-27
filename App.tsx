
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message, BrainState } from './types';
import { socraticAI } from './services/geminiService';
import BrainMeter from './components/BrainMeter';
import { ChatBubble } from './components/ChatBubble';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [concept, setConcept] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [brainCharge, setBrainCharge] = useState(10);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim()) return;

    setIsTyping(true);
    setIsStarted(true);
    
    try {
      const initialResponse = await socraticAI.startNewSession(concept);
      const assistantMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: initialResponse || 'How can I help you learn today?',
        timestamp: Date.now(),
      };
      setMessages([assistantMsg]);
    } catch (error) {
      console.error(error);
      setIsStarted(false);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    setInput('');
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // Get AI response
      const response = await socraticAI.sendMessage(userText);
      
      // Async background evaluation of "brain charge"
      const lastAssistantMsg = messages.filter(m => m.role === 'assistant').slice(-1)[0]?.content || '';
      socraticAI.evaluateBrainCharge(userText, lastAssistantMsg).then(boost => {
        setBrainCharge(prev => Math.min(100, prev + boost));
      });

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response || 'Interesting. Tell me more.',
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isStarted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0f172a]">
        <div className="max-w-md w-full glass p-8 rounded-3xl text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="space-y-4">
            <div className="w-20 h-20 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-2xl shadow-indigo-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Socratic Spark</h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              Don't just read about it. Master it by answering questions.
            </p>
          </div>

          <form onSubmit={handleStart} className="space-y-4">
            <input
              type="text"
              placeholder="What do you want to master?"
              className="w-full px-6 py-4 bg-slate-900 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-center"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={!concept.trim()}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-900/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Thinking
            </button>
            <p className="text-xs text-slate-500 mt-4">
              Try: Quantum Entanglement, Stoicism, or Recursion.
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a]">
      {/* Header */}
      <header className="sticky top-0 z-20 glass border-b border-slate-800 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { setIsStarted(false); setMessages([]); setBrainCharge(10); }}
              className="p-2 hover:bg-slate-800 rounded-xl transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h2 className="text-lg font-bold text-white line-clamp-1">{concept}</h2>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] text-slate-400 uppercase tracking-tighter">Live Session</span>
              </div>
            </div>
          </div>
          <div className="hidden sm:block w-64">
             <BrainMeter charge={brainCharge} />
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
             <span className="text-xs font-bold text-indigo-400">?</span>
          </div>
        </div>
        <div className="sm:hidden mt-2">
            <BrainMeter charge={brainCharge} />
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-3xl mx-auto flex flex-col">
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
          {isTyping && (
            <div className="flex justify-start mb-6">
              <div className="bg-slate-800 border border-slate-700 px-5 py-4 rounded-3xl rounded-tl-none flex items-center gap-2">
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </main>

      {/* Bottom Input */}
      <footer className="p-4 sm:p-6 glass border-t border-slate-800">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSend} className="relative flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Your thought..."
              disabled={isTyping}
              className="w-full py-4 pl-6 pr-14 bg-slate-900 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-xl transition-all shadow-lg shadow-indigo-900/20 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
          <div className="flex justify-between items-center mt-3 text-[10px] text-slate-500 px-2 uppercase tracking-widest font-medium">
             <span>Socratic Mode Active</span>
             <span className="text-indigo-400">Gemini 3 Flash</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
