'use client';
import React, { useEffect, useState } from 'react';
import { Cpu } from 'lucide-react';

interface Props {
  isProcessing: boolean;
  strategy: string;
}

export const MainThreadHeartbeat: React.FC<Props> = ({ isProcessing, strategy }) => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    let animId: number;
    const update = () => {
      setFrame((prev) => (prev + 1) % 360);
      animId = requestAnimationFrame(update);
    };
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-3.5 rounded-2xl shadow-inner">
      <div className="relative flex items-center justify-center">
        <div 
          className="w-10 h-10 rounded-full border-4 border-blue-500/20 border-t-blue-500 transition-none"
          style={{ transform: `rotate(${frame}deg)` }}
        />
        <Cpu className="w-4 h-4 text-blue-400 absolute" />
      </div>
      <div>
        <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          Estado del Main Thread
          {isProcessing && strategy !== 'macrotask' && (
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
              CONGELADO
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-400 max-w-[210px] leading-tight">
          {strategy === 'macrotask' ? 'Gira fluido al ceder el hilo.' : 'Sufre congelamiento visual durante búsquedas.'}
        </p>
      </div>
    </div>
  );
};