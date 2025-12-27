
import React from 'react';
import { Message } from '../types';

interface ChatBubbleProps {
  message: Message;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isAssistant = message.role === 'assistant';
  
  return (
    <div className={`flex w-full mb-6 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[85%] sm:max-w-[70%] px-5 py-4 rounded-3xl shadow-lg transition-all duration-300 ${
        isAssistant 
          ? 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700' 
          : 'bg-indigo-600 text-white rounded-tr-none'
      }`}>
        <p className={`text-sm md:text-base leading-relaxed ${isAssistant ? 'font-medium' : 'font-normal'}`}>
          {message.content}
        </p>
        <div className={`text-[10px] mt-2 opacity-40 ${isAssistant ? 'text-left' : 'text-right'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};
