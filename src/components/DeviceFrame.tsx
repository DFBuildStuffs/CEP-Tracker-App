import React from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

interface Props {
  isMobileFrame: boolean;
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<Props> = ({ isMobileFrame, children }) => {
  if (!isMobileFrame) {
    return <div className="w-full min-h-screen">{children}</div>;
  }

  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-4 sm:py-8 px-2 flex flex-col items-center justify-center transition-colors">
      <div className="w-full max-w-[420px] bg-white dark:bg-slate-900 rounded-[48px] shadow-2xl dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border-[8px] border-slate-300 dark:border-slate-800 overflow-hidden relative flex flex-col h-[890px]">
        {/* Mobile Top Speaker / Dynamic Island */}
        <div className="h-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-6 flex items-center justify-between z-30 select-none border-b border-slate-100 dark:border-slate-800/40">
          <span className="text-[11px] font-black text-slate-800 dark:text-slate-200">{timeString}</span>
          <div className="w-20 h-4 bg-slate-900 dark:bg-slate-950 rounded-full mx-auto flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-slate-700 dark:bg-slate-800 mr-2" />
          </div>
          <div className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Scrollable Mobile Viewport */}
        <div className="flex-1 overflow-y-auto scrollbar-none flex flex-col">
          {children}
        </div>

        {/* Home Indicator Bar */}
        <div className="h-4 bg-white/90 dark:bg-slate-900/90 flex items-center justify-center safe-area-pb z-30">
          <div className="w-32 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
        </div>
      </div>
    </div>
  );
};
