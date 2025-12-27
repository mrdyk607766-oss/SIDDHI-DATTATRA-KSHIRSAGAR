
import React from 'react';

interface BrainMeterProps {
  charge: number;
}

const BrainMeter: React.FC<BrainMeterProps> = ({ charge }) => {
  const percentage = Math.min(100, Math.max(0, charge));
  
  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-md mx-auto p-4 glass rounded-2xl">
      <div className="flex justify-between w-full text-xs font-semibold text-slate-400 uppercase tracking-widest">
        <span>Brain Energy</span>
        <span>{percentage}%</span>
      </div>
      <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
        <div 
          className="h-full transition-all duration-1000 ease-out relative"
          style={{ 
            width: `${percentage}%`,
            background: `linear-gradient(90deg, #3b82f6 0%, #a855f7 ${percentage}%)`,
            boxShadow: percentage > 80 ? '0 0 15px rgba(168, 85, 247, 0.5)' : 'none'
          }}
        >
          {percentage > 0 && (
            <div className="absolute right-0 top-0 h-full w-2 bg-white/30 animate-pulse" />
          )}
        </div>
      </div>
      <p className="text-[10px] text-slate-500 italic mt-1">
        {percentage < 30 ? "Warm up your neurons..." : 
         percentage < 60 ? "Deep processing initiated..." : 
         percentage < 90 ? "High frequency thinking detected!" : 
         "Maximum brain capacity approaching!"}
      </p>
    </div>
  );
};

export default BrainMeter;
