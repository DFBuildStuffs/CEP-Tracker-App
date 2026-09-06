import React, { useState } from 'react';
import { UserAccount } from '../types';
import { sound } from '../utils/sound';
import { getProgramTheme } from '../utils/programTheme';
import {
  X,
  User,
  LogOut,
  UserPlus,
  Trash2,
  Check,
  Percent,
  Layers,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  savedUsers: UserAccount[];
  onSelectUser: (user: UserAccount) => void;
  onLogOut: () => void;
  onLoginAnotherAccount: () => void;
  onDeleteUser: (userId: string) => void;
}

export const UserProfileManagerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentUser,
  savedUsers,
  onSelectUser,
  onLogOut,
  onLoginAnotherAccount,
  onDeleteUser,
}) => {
  const [accountPendingDelete, setAccountPendingDelete] = useState<UserAccount | null>(null);

  if (!isOpen) return null;

  const theme = getProgramTheme(currentUser.program);

  const confirmDelete = () => {
    if (!accountPendingDelete) return;
    sound.playTap();
    onDeleteUser(accountPendingDelete.id);
    setAccountPendingDelete(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-2xl relative my-8 overflow-hidden text-slate-900 dark:text-white flex flex-col max-h-[90vh]">
        {/* Header with Close */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className={`w-11 h-11 rounded-2xl ${theme.classes.accentBg} text-white flex items-center justify-center font-bold shadow-md`}>
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  {currentUser.userName}
                </h2>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${theme.classes.badge}`}>
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentUser.program} Track • {currentUser.areas.length} Subject Areas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
          {/* Active Profile Info Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Passing Target
                </span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {currentUser.passTarget}%
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Maintaining Target
                </span>
                <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                  {currentUser.maintTarget}%
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <Layers className="w-3 h-3 text-blue-500" />
                Configured Areas ({currentUser.areas.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentUser.areas.map((area, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700/80 text-slate-800 dark:text-slate-200"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Saved Profiles / Accounts List (Can switch or delete) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Saved Accounts ({savedUsers.length})
              </span>
              <span className="text-[10px] text-slate-400">Tap to switch</span>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {savedUsers.map((u) => {
                const isActive = u.id === currentUser.id;
                return (
                  <div
                    key={u.id}
                    onClick={() => {
                      if (!isActive) {
                        sound.playTap();
                        onSelectUser(u);
                        onClose();
                      }
                    }}
                    className={`relative p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isActive
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 cursor-default'
                        : 'border-slate-200 dark:border-slate-800 hover:border-blue-400 bg-slate-50/70 dark:bg-slate-850 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0 pr-8">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                        {u.userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                            {u.userName}
                          </h4>
                          {isActive && (
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold flex items-center">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">
                          {u.program} • {u.areas.length} Areas
                        </p>
                      </div>
                    </div>

                    {/* Trash bin icon in the upper right of the existing account icon/card */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        sound.playTap();
                        setAccountPendingDelete(u);
                      }}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 border border-transparent hover:border-rose-200 dark:hover:border-rose-900 transition-all"
                      title={`Permanently delete account for ${u.userName}`}
                      aria-label="Delete this account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Warning Dialog before permanently deleting account */}
        {accountPendingDelete && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm p-6 flex flex-col justify-center items-center text-center animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center mb-3 border border-rose-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white">Permanently Delete Account?</h3>
            <p className="text-xs text-slate-300 max-w-sm mt-2 leading-relaxed">
              Are you sure you want to permanently delete profile <span className="font-bold text-white">"{accountPendingDelete.userName}"</span>? All recorded mock exam history, study logs, and milestones will be wiped permanently.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <button
                type="button"
                onClick={() => setAccountPendingDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-lg shadow-rose-600/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Permanently Delete</span>
              </button>
            </div>
          </div>
        )}

        {/* Bottom Bar: LOG OUT and LOGIN ANOTHER ACCOUNT on the BOTTOM LEFT as requested */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 flex-shrink-0">
          <div className="flex items-center gap-2">
            {/* Log Out on the bottom left */}
            <button
              type="button"
              onClick={() => {
                sound.playTap();
                onClose();
                onLogOut();
              }}
              className="px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98"
              title="Log out and return to CEP Tracker landing page"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>

            {/* Login another account on the bottom left */}
            <button
              type="button"
              onClick={() => {
                sound.playTap();
                onClose();
                onLoginAnotherAccount();
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-300 dark:border-slate-700 transition-all active:scale-98"
              title="Login or register another account"
            >
              <UserPlus className="w-3.5 h-3.5 text-blue-500" />
              <span>Login Another Account</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
