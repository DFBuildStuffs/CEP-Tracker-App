import React from 'react';
import { UserAccount } from '../types';
import { Flame, Bell, Moon, Sun, Monitor, Smartphone, User } from 'lucide-react';
import { sound } from '../utils/sound';
import { getProgramTheme } from '../utils/programTheme';

interface Props {
  user: UserAccount;
  unreadCount: number;
  onOpenNotifications: () => void;
  onToggleTheme: () => void;
  onOpenAccountModal: () => void;
  isMobileFrame: boolean;
  onToggleFrame: () => void;
}

export const Header: React.FC<Props> = ({
  user,
  unreadCount,
  onOpenNotifications,
  onToggleTheme,
  onOpenAccountModal,
  isMobileFrame,
  onToggleFrame,
}) => {
  const theme = getProgramTheme(user.program);

  const getAvatarGradient = () => {
    switch (theme.code) {
      case 'BSCE':
        return 'from-orange-600 via-zinc-900 to-amber-500 shadow-orange-500/20';
      case 'BSABE':
        return 'from-emerald-600 via-teal-700 to-emerald-500 shadow-emerald-500/20';
      case 'BSECE':
      default:
        return 'from-blue-600 via-slate-950 to-blue-500 shadow-blue-500/20';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors shadow-xs">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: User / App Brand */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              sound.playTap();
              onOpenAccountModal();
            }}
            className="flex items-center space-x-2.5 p-1 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group text-left"
            title="Switch or manage account"
          >
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${getAvatarGradient()} text-white flex items-center justify-center font-bold text-sm shadow-md group-hover:scale-105 transition-transform`}>
              <User className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight truncate max-w-[140px]">
                  {user.userName}
                </span>
                <span className={`w-2 h-2 rounded-full ${theme.classes.badgeDot}`} />
              </div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>{theme.code} Scholar</span>
              </span>
            </div>
          </button>
        </div>

        {/* Center: Program Pill */}
        <div className="hidden md:flex items-center">
          <span className={`px-3.5 py-1 rounded-full text-xs font-bold border flex items-center gap-2 ${theme.classes.badge}`}>
            <span className={`w-2 h-2 rounded-full ${theme.classes.badgeDot} animate-pulse`} />
            <span>{theme.code} Track</span>
          </span>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center space-x-2">
          {/* Daily Study Streak Badge */}
          <div
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl border transition-all ${
              user.streak.count > 0
                ? 'bg-orange-500/10 dark:bg-orange-500/20 border-orange-500/30 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 opacity-60'
            }`}
            title={`${user.streak.count}-Day Active Study Streak`}
          >
            <Flame className={`w-4 h-4 ${user.streak.count > 0 ? 'text-orange-500 animate-bounce' : 'text-slate-400'}`} />
            <span className="font-extrabold text-xs">{user.streak.count}d</span>
          </div>

          {/* Real-time Push Notification Center Bell */}
          <button
            onClick={() => {
              sound.playTap();
              onOpenNotifications();
            }}
            className="relative p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Notification Center"
            aria-label="Open notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center shadow-md animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Device Frame View Toggle */}
          <button
            onClick={() => {
              sound.playTap();
              onToggleFrame();
            }}
            className="hidden lg:flex p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title={isMobileFrame ? 'Switch to Fluid Desktop View' : 'Switch to Native Mobile Frame View'}
            aria-label="Toggle device frame preview"
          >
            {isMobileFrame ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          </button>

          {/* Night / Day Mode Toggle */}
          <button
            onClick={() => {
              sound.playTap();
              onToggleTheme();
            }}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center border border-slate-200/50 dark:border-slate-700/50"
            title={user.themeMode === 'dark' ? 'Switch to Day Mode' : 'Switch to Night Mode'}
            aria-label={user.themeMode === 'dark' ? 'Switch to Day Mode' : 'Switch to Night Mode'}
          >
            {user.themeMode === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
