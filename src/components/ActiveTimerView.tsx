import React, { useState, useEffect, useRef } from 'react';
import { ActiveSession, UserAccount } from '../types';
import { sound } from '../utils/sound';
import { getProgramTheme } from '../utils/programTheme';
import { Play, Pause, Square, Check, RotateCcw, Flame, Coffee } from 'lucide-react';

interface Props {
  user: UserAccount;
  onCompleteSession: (area: string, type: 'study' | 'mock', hours: number) => void;
}

export const ActiveTimerView: React.FC<Props> = ({ user, onCompleteSession }) => {
  const theme = getProgramTheme(user.program);

  // Session Configuration State
  const [sessionType, setSessionType] = useState<'study' | 'mock'>('study');
  const [selectedArea, setSelectedArea] = useState<string>(user.areas[0] || '');
  const [engine, setEngine] = useState<'pomodoro' | 'normal'>('pomodoro');
  const [customMinutes, setCustomMinutes] = useState<number>(60);

  // Active Running State
  const [session, setSession] = useState<ActiveSession | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user.areas.length > 0 && !selectedArea) {
      setSelectedArea(user.areas[0]);
    }
  }, [user.areas, selectedArea]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleStartTimer = () => {
    if (!selectedArea) return;
    const totalSecs = Math.max(1, customMinutes) * 60;
    const isPomo = sessionType === 'study' && engine === 'pomodoro';
    const initialInterval = isPomo ? Math.min(50 * 60, totalSecs) : totalSecs;

    sound.playTap();

    setSession({
      timerRunning: true,
      remainingSeconds: initialInterval,
      totalSeconds: totalSecs,
      elapsedSeconds: 0,
      engine: isPomo ? 'pomodoro' : 'normal',
      isStudyPhase: true,
      area: selectedArea,
      type: sessionType,
      intervalDuration: initialInterval,
    });
  };

  // Timer Tick Loop
  useEffect(() => {
    if (!session || !session.timerRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSession((prev) => {
        if (!prev || !prev.timerRunning) return prev;

        // Count down remaining interval
        if (prev.remainingSeconds > 1) {
          const newElapsed = prev.engine === 'normal' || prev.isStudyPhase ? prev.elapsedSeconds + 1 : prev.elapsedSeconds;
          return {
            ...prev,
            remainingSeconds: prev.remainingSeconds - 1,
            elapsedSeconds: newElapsed,
          };
        }

        // Interval finished!
        if (prev.engine === 'pomodoro') {
          sound.playBell();
          const nextPhase = !prev.isStudyPhase;
          const nextDuration = nextPhase ? 50 * 60 : 10 * 60;
          return {
            ...prev,
            isStudyPhase: nextPhase,
            remainingSeconds: nextDuration,
            intervalDuration: nextDuration,
            elapsedSeconds: prev.isStudyPhase ? prev.elapsedSeconds + 1 : prev.elapsedSeconds,
          };
        } else {
          // Normal timer finished
          sound.playTimerComplete();
          const finalHours = prev.elapsedSeconds / 3600;
          onCompleteSession(prev.area, prev.type, Math.max(finalHours, 0.01));
          return null;
        }
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session, onCompleteSession]);

  const togglePause = () => {
    if (!session) return;
    sound.playTap();
    setSession({ ...session, timerRunning: !session.timerRunning });
  };

  const handleAbort = () => {
    sound.playTap();
    if (timerRef.current) clearInterval(timerRef.current);
    setSession(null);
  };

  const handleManualComplete = () => {
    if (!session) return;
    sound.playTimerComplete();
    if (timerRef.current) clearInterval(timerRef.current);
    const hours = session.elapsedSeconds / 3600;
    onCompleteSession(session.area, session.type, Math.max(hours, 0.01));
    setSession(null);
  };

  // If session is running, render active countdown UI
  if (session) {
    const mins = Math.floor(session.remainingSeconds / 60);
    const secs = session.remainingSeconds % 60;
    const progress = session.intervalDuration > 0 ? (session.remainingSeconds / session.intervalDuration) * 100 : 0;
    const strokeDashoffset = 283 - (283 * progress) / 100;

    return (
      <div className="max-w-md mx-auto py-4 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center relative overflow-hidden transition-colors">
          {/* Phase Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
            {session.engine === 'pomodoro' ? (
              session.isStudyPhase ? (
                <>
                  <Flame className="w-3.5 h-3.5 text-orange-500" /> Focus Phase
                </>
              ) : (
                <>
                  <Coffee className="w-3.5 h-3.5 text-emerald-500" /> Break Time (10m)
                </>
              )
            ) : (
              <>
                <Flame className="w-3.5 h-3.5 text-blue-500" /> Continuous {session.type === 'mock' ? 'Mockboard' : 'Study'}
              </>
            )}
          </div>

          <h3 className="text-xl font-black text-slate-900 dark:text-white truncate max-w-xs mx-auto">{session.area}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Logged: {(session.elapsedSeconds / 60).toFixed(1)} mins • Mode: {session.engine}
          </p>

          {/* Circular SVG Timer */}
          <div className="relative w-64 h-64 mx-auto my-6 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                style={{ stroke: theme.primaryHex }}
                className="transition-all duration-500"
                strokeWidth="6"
                strokeDasharray="283"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white font-mono">
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </span>
              <span
                className={`text-[11px] font-extrabold tracking-widest uppercase mt-2 px-2.5 py-0.5 rounded-full ${
                  session.timerRunning
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 animate-pulse'
                }`}
              >
                {session.timerRunning ? 'RUNNING' : 'PAUSED'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={togglePause}
              className="flex-1 max-w-[120px] py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              {session.timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-500" />}
              <span>{session.timerRunning ? 'Pause' : 'Resume'}</span>
            </button>

            <button
              onClick={handleManualComplete}
              className="flex-1 max-w-[130px] py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Complete</span>
            </button>

            <button
              onClick={handleAbort}
              className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/60 font-bold transition-colors"
              title="Abort Session"
              aria-label="Abort Session"
            >
              <Square className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Session Setup Screen
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center space-x-3 mb-6">
          <div className={`w-12 h-12 rounded-2xl ${theme.classes.accentBgSubtle} flex items-center justify-center font-black`}>
            <Play className="w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Start Review Session</h2>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${theme.classes.badge}`}>
                {theme.code}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Configure your study block or timed mockboard drill</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Session Type Segment Control */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Session Type
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  sound.playTap();
                  setSessionType('study');
                }}
                className={`py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  sessionType === 'study'
                    ? `${theme.classes.accentBg} shadow-sm`
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Flame className="w-4 h-4" />
                <span>Study Review</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playTap();
                  setSessionType('mock');
                }}
                className={`py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  sessionType === 'mock'
                    ? `${theme.classes.accentBg} shadow-sm`
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                <span>Mockboard Exam</span>
              </button>
            </div>
          </div>

          {/* Area Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              CEP Area
            </label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm focus:outline-none"
            >
              {user.areas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          {/* Time & Engine Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Duration (Minutes)
              </label>
              <input
                type="number"
                min="1"
                max="360"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-black text-lg text-center focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Timer Engine
              </label>
              <select
                disabled={sessionType === 'mock'}
                value={sessionType === 'mock' ? 'normal' : engine}
                onChange={(e) => setEngine(e.target.value as 'pomodoro' | 'normal')}
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs sm:text-sm focus:outline-none disabled:opacity-50"
              >
                <option value="pomodoro">Pomodoro (50m Focus / 10m Break)</option>
                <option value="normal">Continuous Countdown</option>
              </select>
            </div>
          </div>

          {/* Launch Button */}
          <button
            type="button"
            onClick={handleStartTimer}
            className={`w-full mt-4 py-4 rounded-2xl ${theme.classes.accentBg} text-white font-black text-base flex items-center justify-center gap-2 shadow-xl ${theme.classes.buttonShadow} transition-all transform active:scale-98`}
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Launch Timer Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};
