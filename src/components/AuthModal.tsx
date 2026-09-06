import React from 'react';
import { UserAccount } from '../types';
import { sound } from '../utils/sound';
import { GraduationCap, Lock, Plus, Check, X, User } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  users: UserAccount[];
  activeUserId: string | null;
  onSelectUser: (user: UserAccount) => void;
  onOpenCreate: () => void;
}

export const AuthModal: React.FC<Props> = ({
  isOpen,
  onClose,
  users,
  activeUserId,
  onSelectUser,
  onOpenCreate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-2 font-black">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">Scholar Accounts</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Switch profile or start a new tracking journal</p>
        </div>

        {/* Grid of Accounts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {users.map((user) => {
            const isActive = user.id === activeUserId;
            return (
              <div
                key={user.id}
                onClick={() => {
                  sound.playTap();
                  onSelectUser(user);
                }}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative group flex items-center space-x-3 ${
                  isActive
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-blue-400'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-sm">
                  <User className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-1">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">{user.userName}</h4>
                    {isActive && <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 font-semibold">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>{user.program}</span>
                  </p>
                </div>
              </div>
            );
          })}

          {/* Create Account Tile */}
          {users.length < 4 && (
            <button
              onClick={() => {
                sound.playTap();
                onClose();
                onOpenCreate();
              }}
              className="p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 bg-transparent hover:bg-blue-50/40 dark:hover:bg-blue-950/20 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex flex-col items-center justify-center transition-all min-h-[86px]"
            >
              <Plus className="w-6 h-6 mb-1" />
              <span className="text-xs font-bold">New Account</span>
            </button>
          )}
        </div>

        {users.length >= 4 && (
          <p className="text-[11px] text-center text-slate-400 font-semibold">Maximum limit of 4 accounts reached.</p>
        )}
      </div>
    </div>
  );
};
