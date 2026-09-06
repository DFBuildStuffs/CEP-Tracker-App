import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MilestoneNotification } from '../types';
import { notificationService } from '../utils/notifications';
import { sound } from '../utils/sound';
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  Volume2,
  VolumeX,
  Smartphone,
  Sparkles,
  Trophy,
  Flame,
  CheckCircle2,
  Clock,
  Send,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  notifications: MilestoneNotification[];
  onMarkAllRead: () => void;
  onClearAll: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  pushEnabled: boolean;
  onTogglePush: () => void;
}

export const NotificationCenterModal: React.FC<Props> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onClearAll,
  soundEnabled,
  onToggleSound,
  pushEnabled,
  onTogglePush,
}) => {
  const [permissionStatus, setPermissionStatus] = useState<string>(notificationService.getPermission());

  if (!isOpen) return null;

  const handleRequestNativePermission = async () => {
    const res = await notificationService.requestPermission();
    setPermissionStatus(res);
    if (res === 'granted') {
      sound.playMilestone();
    }
  };

  const getIcon = (type: MilestoneNotification['type']) => {
    switch (type) {
      case 'all_completed':
        return <Trophy className="w-5 h-5 text-amber-500" />;
      case 'pass_area':
      case 'pass_initial':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'streak':
        return <Flame className="w-5 h-5 text-orange-500" />;
      case 'timer':
        return <Clock className="w-5 h-5 text-sky-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Push Milestones</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {notifications.filter((n) => !n.read).length} unread alerts
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Controls Bar */}
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs bg-slate-50/40 dark:bg-slate-900/20 flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <button
                onClick={onToggleSound}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border font-semibold transition-all ${
                  soundEnabled
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>Sound {soundEnabled ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={onTogglePush}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border font-semibold transition-all ${
                  pushEnabled
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Push {pushEnabled ? 'Active' : 'Muted'}</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={onMarkAllRead}
                disabled={notifications.length === 0}
                className="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center space-x-1 disabled:opacity-40"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark Read</span>
              </button>
              <button
                onClick={onClearAll}
                disabled={notifications.length === 0}
                className="text-slate-500 hover:text-rose-500 flex items-center space-x-1 disabled:opacity-40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Native Permission Banner if not granted */}
          {permissionStatus !== 'granted' && permissionStatus !== 'unsupported' && (
            <div className="m-4 p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/60 dark:border-blue-800/40 flex items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Allow browser push notifications for milestone alerts
                </span>
              </div>
              <button
                onClick={handleRequestNativePermission}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors whitespace-nowrap shadow-sm"
              >
                Enable Push
              </button>
            </div>
          )}

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-30 stroke-[1.5]" />
                <p className="font-semibold text-sm">No notifications yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Complete CEP exams, keep study streaks, and finish sessions to trigger milestone pushes.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start space-x-3.5 ${
                    !item.read
                      ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/60 shadow-sm'
                      : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.title}</h4>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" title="Unread" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{item.message}</p>
                    <div className="flex items-center space-x-3 mt-2 text-[10px] text-slate-400 font-medium">
                      <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>•</span>
                      <span>{new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      {item.area && (
                        <>
                          <span>•</span>
                          <span className="text-blue-500 dark:text-blue-400 font-semibold truncate max-w-[140px]">{item.area}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
