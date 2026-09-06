import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserAccount } from '../types';
import { sound } from '../utils/sound';
import { Lock, Unlock, X, Trash2, Delete } from 'lucide-react';

interface Props {
  user: UserAccount | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userId: string) => void;
  onDeleteAccount: (userId: string) => void;
}

export const PinModal: React.FC<Props> = ({ user, isOpen, onClose, onSuccess, onDeleteAccount }) => {
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [errorShake, setErrorShake] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (!isOpen || !user) return null;

  const handleKeyPress = (digit: string) => {
    if (enteredPin.length >= 6) return;
    sound.playKeypad();
    const newPin = enteredPin + digit;
    setEnteredPin(newPin);

    // Auto verify when 6 digits entered
    if (newPin.length === 6) {
      if (newPin === user.pin) {
        sound.playMilestone();
        setTimeout(() => {
          onSuccess(user.id);
          setEnteredPin('');
        }, 150);
      } else {
        // Error shake
        sound.playTap();
        setErrorShake(true);
        setTimeout(() => {
          setErrorShake(false);
          setEnteredPin('');
        }, 500);
      }
    }
  };

  const handleDeleteDigit = () => {
    sound.playTap();
    setEnteredPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        animate={errorShake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl text-center relative"
      >
        <button
          onClick={() => {
            onClose();
            setEnteredPin('');
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl transition-colors"
          aria-label="Close PIN modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lock Avatar */}
        <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl mx-auto mb-3 border-2 border-blue-500/20">
          <Lock className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-black text-slate-900 dark:text-white truncate px-2">{user.userName}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Enter your 6-digit PIN to access this account</p>

        {/* PIN Indicators Dots */}
        <div className="flex justify-center space-x-3 my-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                i < enteredPin.length
                  ? errorShake
                    ? 'bg-rose-500 border-rose-500 scale-110'
                    : 'bg-blue-600 border-blue-600 scale-110 shadow-sm shadow-blue-500/40'
                  : 'border-slate-300 dark:border-slate-700 bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* Tactile Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto mb-5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              className="w-16 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-xl hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 active:scale-95 transition-all shadow-sm"
            >
              {digit}
            </button>
          ))}

          {/* Bottom row */}
          <button
            type="button"
            onClick={() => setEnteredPin('')}
            className="w-16 h-14 rounded-2xl text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="w-16 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-xl hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 active:scale-95 transition-all shadow-sm"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleDeleteDigit}
            className="w-16 h-14 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            aria-label="Delete digit"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Delete Account Link */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          {!showConfirmDelete ? (
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center justify-center gap-1 mx-auto py-1 px-3 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete this account</span>
            </button>
          ) : (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-900/40 text-xs">
              <p className="font-bold text-rose-600 dark:text-rose-400 mb-2">Permanently delete account?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="flex-1 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onDeleteAccount(user.id)}
                  className="flex-1 py-1.5 rounded-xl bg-rose-600 text-white font-bold shadow-sm"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
