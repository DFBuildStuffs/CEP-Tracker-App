import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Crown, Sparkles, X } from 'lucide-react';
import { sound } from '../utils/sound';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  program: string;
}

export const VictoryModal: React.FC<Props> = ({ isOpen, onClose, userName, program }) => {
  useEffect(() => {
    if (isOpen) {
      sound.playGrandVictory();

      // Confetti burst
      const duration = 4 * 1000;
      const animationEnd = Date.now() + duration;
      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
        if (Date.now() < animationEnd) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-8 border-2 border-amber-400 shadow-2xl text-center space-y-6 relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-36 h-36 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl transition-colors"
          aria-label="Close victory modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center mx-auto shadow-2xl shadow-amber-400/40 relative">
          <Trophy className="w-12 h-12 fill-current" />
          <div className="absolute -top-2 -right-2 bg-slate-950 text-amber-400 p-1.5 rounded-full border border-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <div>
          <span className="text-xs font-black uppercase tracking-widest text-amber-500 block mb-1">
            Grand Milestone Achieved
          </span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">
            Congratulations, {userName}!
          </h2>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
            You have successfully conquered <span className="font-extrabold text-blue-600 dark:text-blue-400">all CEP Areas</span> for {program}!
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed text-left">
          "Your discipline, countless study hours, and tenacity have brought you to full readiness. You have proven your competency across every subject. Keep this sharp confidence and go claim your engineering license!"
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition-all active:scale-98"
        >
          <Crown className="w-5 h-5" />
          <span>Claim Victory & Continue</span>
        </button>
      </div>
    </div>
  );
};
