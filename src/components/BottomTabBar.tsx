import React from 'react';
import { motion } from 'motion/react';
import {
  Home,
  Clock,
  BarChart3,
  ClipboardCheck,
  BookOpen,
  Calendar,
  Sparkles,
  Bot,
} from 'lucide-react';
import { sound } from '../utils/sound';
import { getProgramTheme } from '../utils/programTheme';

export type TabId = 'home' | 'timer' | 'analytics' | 'reports' | 'journal' | 'scheduler' | 'gemini' | 'motivations';

interface Props {
  activeTab: TabId;
  onChangeTab: (tab: TabId) => void;
  program?: string;
}

interface TabItem {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const BottomTabBar: React.FC<Props> = ({ activeTab, onChangeTab, program }) => {
  const theme = getProgramTheme(program);

  const tabs: TabItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'timer', label: 'Timer', icon: Clock },
    { id: 'analytics', label: 'Visuals', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: ClipboardCheck },
    { id: 'gemini', label: 'Gemini', icon: Bot },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'scheduler', label: 'Exams', icon: Calendar },
    { id: 'motivations', label: 'Quotes', icon: Sparkles },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 safe-area-pb transition-colors shadow-lg">
      <div className="max-w-xl mx-auto px-2 py-2 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playTap();
                onChangeTab(tab.id);
              }}
              className="relative py-1 px-2 sm:px-3 rounded-2xl flex flex-col items-center transition-all flex-1 text-center"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className={`absolute inset-0 rounded-2xl opacity-15 dark:opacity-25 ${theme.classes.progressBar}`}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <div
                className={`relative z-10 transition-transform p-1 ${
                  isActive
                    ? `${theme.classes.accentText} scale-110`
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5 transition-transform" />
              </div>
              <span
                className={`text-[10px] font-extrabold tracking-tight relative z-10 transition-colors ${
                  isActive
                    ? theme.classes.accentText
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
