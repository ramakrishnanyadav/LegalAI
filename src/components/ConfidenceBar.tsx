import React, { useEffect, useState } from 'react';

interface ConfidenceBarProps {
  score: number; // 0 to 1
  showLabel?: boolean;
}

export const ConfidenceBar: React.FC<ConfidenceBarProps> = ({ score, showLabel = true }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // Animate on mount
    const timeout = setTimeout(() => {
      setWidth(Math.max(0, Math.min(100, score * 100)));
    }, 100);
    return () => clearTimeout(timeout);
  }, [score]);

  const getColor = (s: number) => {
    if (s >= 0.8) return 'bg-emerald-500';
    if (s >= 0.5) return 'bg-amber-400';
    return 'bg-red-400';
  };

  const percent = Math.round(score * 100);

  return (
    <div className="flex items-center gap-3 w-full">
      <div 
        className="flex-1 h-[6px] bg-secondary rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div 
          className={`h-full ${getColor(score)} transition-all duration-600 ease-out`}
          style={{ width: `${width}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-medium w-10 text-right">
          {percent}%
        </span>
      )}
    </div>
  );
};
