import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MilestoneNotification } from '../types';
import { Bell, CheckCircle2, Flame, Trophy, Clock, AlertTriangle, X } from 'lucide-react';

interface Props {
  notification: MilestoneNotification | null;
  onDismiss: () => void;
  onOpenCenter: () => void;
}

export const PushNotificationToast: React.FC<Props> = ({ notification, onDismiss, onOpenCenter }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 300);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [notification, onDismiss]);

  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'all_completed':
        return <Trophy className="w-5 h-5 text-amber-400" />;
      case 'pass_area':
      case 'pass_initial':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'streak':
        return <Flame className="w-5 h-5 text-orange-400 animate-pulse" />;
      case 'timer':
        return <Clock className="w-5 h-5 text-sky-400" />;
      case 'exam_soon':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      default:
        return <Bell className="w-5 h-5 text-primary-400" />;
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.94 }}
          transition={{ type: 'spring', damping: 22, stiffness: 350 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md"
        >
          <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 shadow-2xl rounded-2xl p-3.5 text-slate-100 flex items-start space-x-3 cursor-pointer hover:border-slate-500 transition-colors">
            <div className="p-2 rounded-xl bg-slate-800/90 border border-slate-700 flex-shrink-0 mt-0.5">
              {getIcon()}
            </div>
            <div
              className="flex-1 min-w-0 pr-1"
              onClick={() => {
                onOpenCenter();
                onDismiss();
              }}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-primary-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Push Milestone
                </span>
                <span className="text-[10px] text-slate-400">Just now</span>
              </div>
              <h4 className="text-sm font-bold text-white truncate mt-0.5">{notification.title}</h4>
              <p className="text-xs text-slate-300 line-clamp-2 mt-0.5 leading-relaxed">{notification.message}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setVisible(false);
                setTimeout(onDismiss, 300);
              }}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors flex-shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
