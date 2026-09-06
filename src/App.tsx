import React, { useState, useEffect, useCallback } from 'react';
import { UserAccount, MilestoneNotification, CEPExamRecord, JournalEntry, ScheduledExam } from './types';
import { loadDatabase, saveDatabase } from './utils/storage';
import { notificationService } from './utils/notifications';
import { sound } from './utils/sound';

import { Header } from './components/Header';
import { BottomTabBar, TabId } from './components/BottomTabBar';
import { PushNotificationToast } from './components/PushNotificationToast';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { HomeView } from './components/HomeView';
import { ActiveTimerView } from './components/ActiveTimerView';
import { InteractiveCharts } from './components/InteractiveCharts';
import { CepReportsView } from './components/CepReportsView';
import { JournalView } from './components/JournalView';
import { SchedulerView } from './components/SchedulerView';
import { MotivationsView } from './components/MotivationsView';
import { GeminiChatView } from './components/GeminiChatView';
import { AccountPageView } from './components/AccountPageView';
import { UserProfileManagerModal } from './components/UserProfileManagerModal';
import { VictoryModal } from './components/VictoryModal';
import { DeviceFrame } from './components/DeviceFrame';
import { ProgramType } from './types';

export default function App() {
  const [db, setDb] = useState(() => loadDatabase());
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);

  // Modals state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isVictoryOpen, setIsVictoryOpen] = useState(false);

  // Active push notification toast
  const [activeToast, setActiveToast] = useState<MilestoneNotification | null>(null);

  // Current active user - null when logged out or no active selection
  const activeUser = db.activeUserId
    ? db.users.find((u) => u.id === db.activeUserId) || null
    : null;

  // Sync theme mode on user change
  useEffect(() => {
    if (activeUser) {
      const root = document.documentElement;
      if (activeUser.themeMode === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [activeUser]);

  // Subscribe to real-time notification push events
  useEffect(() => {
    const unsubscribe = notificationService.subscribe((notification) => {
      setActiveToast(notification);
    });
    return () => unsubscribe();
  }, []);

  // Persist DB updates
  const updateActiveUser = useCallback((updater: (prev: UserAccount) => UserAccount) => {
    setDb((prevDb) => {
      if (!prevDb.activeUserId) return prevDb;
      const updatedUsers = prevDb.users.map((u) => {
        if (u.id === prevDb.activeUserId) {
          return updater(u);
        }
        return u;
      });
      const nextDb = { ...prevDb, users: updatedUsers };
      saveDatabase(nextDb);
      return nextDb;
    });
  }, []);

  // Toggle Dark/Light Theme
  const handleToggleTheme = () => {
    if (!activeUser) return;
    updateActiveUser((user) => ({
      ...user,
      themeMode: user.themeMode === 'dark' ? 'light' : 'dark',
    }));
  };

  // Toggle Sound
  const handleToggleSound = () => {
    if (!activeUser) return;
    updateActiveUser((user) => ({
      ...user,
      soundEnabled: !user.soundEnabled,
    }));
  };

  // Toggle Push
  const handleTogglePush = () => {
    if (!activeUser) return;
    updateActiveUser((user) => ({
      ...user,
      pushEnabled: !user.pushEnabled,
    }));
  };

  // Complete a Study or Mockboard Session
  const handleCompleteSession = (area: string, type: 'study' | 'mock', hours: number) => {
    if (!activeUser) return;

    // Check streak update
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    let newStreakCount = activeUser.streak.count || 0;
    const lastDate = activeUser.streak.lastStudyDate;

    let streakMilestoneTitle: string | null = null;

    if (!lastDate) {
      newStreakCount = 1;
      streakMilestoneTitle = 'Day 1 Streak Started! 🔥';
    } else {
      const diffDays = Math.round((today - lastDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        newStreakCount += 1;
        streakMilestoneTitle = `${newStreakCount}-Day Study Streak Conquered! 🔥`;
      } else if (diffDays > 1) {
        newStreakCount = 1;
        streakMilestoneTitle = 'Study Streak Reignited! 🔥';
      }
    }

    const prevHours = (activeUser.studyHours[area] || 0) + (activeUser.mockHours[area] || 0);
    const newTotal = prevHours + hours;

    // Trigger session complete push milestone
    const timerNotif = notificationService.dispatchMilestone(
      {
        title: `${type === 'study' ? 'Study Block' : 'Mockboard Exam'} Finished! ⏱️`,
        message: `Successfully recorded ${hours.toFixed(1)} hours for ${area}. Outstanding focus!`,
        type: 'timer',
        area,
      },
      {
        soundEnabled: activeUser.soundEnabled,
        pushEnabled: activeUser.pushEnabled,
      }
    );

    // Optional streak milestone
    let streakNotif: MilestoneNotification | null = null;
    if (streakMilestoneTitle) {
      streakNotif = notificationService.dispatchMilestone(
        {
          title: streakMilestoneTitle,
          message: `You have completed sessions on ${newStreakCount} consecutive review days.`,
          type: 'streak',
          badge: `${newStreakCount} Days`,
        },
        {
          soundEnabled: activeUser.soundEnabled,
          pushEnabled: activeUser.pushEnabled,
        }
      );
    }

    updateActiveUser((user) => {
      const newStudyHours = { ...user.studyHours };
      const newMockHours = { ...user.mockHours };

      if (type === 'study') {
        newStudyHours[area] = (newStudyHours[area] || 0) + hours;
      } else {
        newMockHours[area] = (newMockHours[area] || 0) + hours;
      }

      const notifs = [timerNotif, ...(streakNotif ? [streakNotif] : []), ...user.notifications];

      return {
        ...user,
        studyHours: newStudyHours,
        mockHours: newMockHours,
        streak: {
          count: newStreakCount,
          lastStudyDate: today,
        },
        notifications: notifs.slice(0, 40),
      };
    });
  };

  // Add Exam Score and evaluate passing milestones
  const handleAddExamRecord = (area: string, record: Omit<CEPExamRecord, 'id'>) => {
    if (!activeUser) return;

    const existingRecords = activeUser.cepRecords[area] || [];
    let hadPassedInitial = false;
    existingRecords.forEach((r) => {
      if (!hadPassedInitial && r.pct >= activeUser.passTarget) hadPassedInitial = true;
      else if (hadPassedInitial && r.pct < activeUser.maintTarget) hadPassedInitial = false;
    });

    const newRecord: CEPExamRecord = {
      ...record,
      id: `rec_${Date.now()}`,
    };
    const updatedRecords = [...existingRecords, newRecord];

    // Evaluate new passing state
    let nowPassedInitial = false;
    updatedRecords.forEach((r) => {
      if (!nowPassedInitial && r.pct >= activeUser.passTarget) nowPassedInitial = true;
      else if (nowPassedInitial && r.pct < activeUser.maintTarget) nowPassedInitial = false;
    });

    const isAreaPassed = updatedRecords.length >= 6 && nowPassedInitial;

    const notifsToAdd: MilestoneNotification[] = [];

    // Milestone 1: Initial Pass Reached for the first time
    if (!hadPassedInitial && nowPassedInitial) {
      const passInitialNotif = notificationService.dispatchMilestone(
        {
          title: `Passing Target Hit in ${area}! 🎯`,
          message: `Scored ${newRecord.pct}% (exceeding initial pass target of ${activeUser.passTarget}%). You are now in maintenance status!`,
          type: 'pass_initial',
          area,
        },
        {
          soundEnabled: activeUser.soundEnabled,
          pushEnabled: activeUser.pushEnabled,
        }
      );
      notifsToAdd.push(passInitialNotif);
    }

    // Milestone 2: Area Conquered!
    if (isAreaPassed && existingRecords.length < 6) {
      const areaPassedNotif = notificationService.dispatchMilestone(
        {
          title: `CEP Area Conquered: ${area}! 🏆`,
          message: `Completed all 6 exams with passing criteria satisfied!`,
          type: 'pass_area',
          area,
        },
        {
          soundEnabled: activeUser.soundEnabled,
          pushEnabled: activeUser.pushEnabled,
        }
      );
      notifsToAdd.push(areaPassedNotif);
    }

    // Milestone 3: Check if ALL areas are now conquered
    let allConquered = true;
    activeUser.areas.forEach((a) => {
      const aRecords = a === area ? updatedRecords : activeUser.cepRecords[a] || [];
      let aPassed = false;
      aRecords.forEach((r) => {
        if (!aPassed && r.pct >= activeUser.passTarget) aPassed = true;
        else if (aPassed && r.pct < activeUser.maintTarget) aPassed = false;
      });
      if (!(aRecords.length >= 6 && aPassed)) {
        allConquered = false;
      }
    });

    if (allConquered && !activeUser.hasCompletedAll) {
      const victoryNotif = notificationService.dispatchMilestone(
        {
          title: `ALL CEP AREAS CONQUERED! 🎓👑`,
          message: `Grand Victory! Every single competency area has been mastered. You are fully board exam ready!`,
          type: 'all_completed',
        },
        {
          soundEnabled: activeUser.soundEnabled,
          pushEnabled: activeUser.pushEnabled,
        }
      );
      notifsToAdd.push(victoryNotif);
      setIsVictoryOpen(true);
    }

    updateActiveUser((user) => ({
      ...user,
      hasCompletedAll: allConquered,
      cepRecords: {
        ...user.cepRecords,
        [area]: updatedRecords,
      },
      notifications: [...notifsToAdd, ...user.notifications].slice(0, 40),
    }));
  };

  // Delete latest exam score
  const handleDeleteLatestRecord = (area: string) => {
    updateActiveUser((user) => {
      const records = [...(user.cepRecords[area] || [])];
      if (records.length === 0) return user;
      records.pop();
      return {
        ...user,
        cepRecords: {
          ...user.cepRecords,
          [area]: records,
        },
      };
    });
  };

  // Add Journal Entry
  const handleAddJournalEntry = (entry: Omit<JournalEntry, 'id' | 'date'>) => {
    updateActiveUser((user) => {
      const newEntry: JournalEntry = {
        ...entry,
        id: `j_${Date.now()}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };
      return {
        ...user,
        journalEntries: [newEntry, ...user.journalEntries],
      };
    });
  };

  // Delete Journal Entry
  const handleDeleteJournalEntry = (id: string) => {
    updateActiveUser((user) => ({
      ...user,
      journalEntries: user.journalEntries.filter((j) => j.id !== id),
    }));
  };

  // Add Exam
  const handleAddExam = (exam: Omit<ScheduledExam, 'id'>) => {
    updateActiveUser((user) => {
      const newExam: ScheduledExam = {
        ...exam,
        id: `exam_${Date.now()}`,
      };
      return {
        ...user,
        exams: [...user.exams, newExam],
      };
    });
  };

  // Delete Exam
  const handleDeleteExam = (id: string) => {
    updateActiveUser((user) => ({
      ...user,
      exams: user.exams.filter((e) => e.id !== id),
    }));
  };



  // Select existing account
  const handleSelectUser = (user: UserAccount) => {
    setDb((prev) => {
      const updated = { ...prev, activeUserId: user.id };
      saveDatabase(updated);
      return updated;
    });
    setIsProfileModalOpen(false);
  };

  // Create new account and proceed to home
  const handleCreateAccount = (newUser: UserAccount) => {
    setDb((prev) => {
      const updated = {
        users: [...prev.users, newUser],
        activeUserId: newUser.id,
      };
      saveDatabase(updated);
      return updated;
    });
    setActiveTab('home');
    setIsProfileModalOpen(false);
  };

  // Log Out: clear active user session to show CEP Tracker initial page
  const handleLogOut = () => {
    setDb((prev) => {
      const updated = { ...prev, activeUserId: null };
      saveDatabase(updated);
      return updated;
    });
    setIsProfileModalOpen(false);
  };

  // Login another account: return to CEP Tracker landing page
  const handleLoginAnotherAccount = () => {
    setDb((prev) => {
      const updated = { ...prev, activeUserId: null };
      saveDatabase(updated);
      return updated;
    });
    setIsProfileModalOpen(false);
  };

  // Delete existing account
  const handleDeleteAccount = (userId: string) => {
    setDb((prev) => {
      const updatedUsers = prev.users.filter((u) => u.id !== userId);
      const nextActive = prev.activeUserId === userId ? (updatedUsers[0]?.id || null) : prev.activeUserId;
      const updated = { users: updatedUsers, activeUserId: nextActive };
      saveDatabase(updated);
      return updated;
    });
  };

  // Mark all notifications read
  const handleMarkAllRead = () => {
    updateActiveUser((user) => ({
      ...user,
      notifications: user.notifications.map((n) => ({ ...n, read: true })),
    }));
  };

  // Clear all notifications
  const handleClearAllNotifications = () => {
    updateActiveUser((user) => ({
      ...user,
      notifications: [],
    }));
  };

  if (!activeUser) {
    return (
      <AccountPageView
        savedUsers={db.users}
        onSelectUser={handleSelectUser}
        onCreateAccount={handleCreateAccount}
        onDeleteAccount={handleDeleteAccount}
      />
    );
  }

  const unreadCount = activeUser.notifications.filter((n) => !n.read).length;

  const getAccentColor = () => {
    switch (activeUser.program) {
      case 'BS ABE':
        return 'bg-emerald-500';
      case 'BSCE':
        return 'bg-amber-500';
      case 'BSeCe':
      default:
        return 'bg-blue-600';
    }
  };

  return (
    <DeviceFrame isMobileFrame={isMobileFrame}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col font-sans">
        {/* Real-time Push Notification Toast */}
        <PushNotificationToast
          notification={activeToast}
          onDismiss={() => setActiveToast(null)}
          onOpenCenter={() => setIsNotificationsOpen(true)}
        />

        {/* Top Header */}
        <Header
          user={activeUser}
          unreadCount={unreadCount}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onToggleTheme={handleToggleTheme}
          onOpenAccountModal={() => setIsProfileModalOpen(true)}
          isMobileFrame={isMobileFrame}
          onToggleFrame={() => setIsMobileFrame(!isMobileFrame)}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 mb-20">
          {activeTab === 'home' && (
            <HomeView
              user={activeUser}
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenNotifications={() => setIsNotificationsOpen(true)}
              onOpenAccountModal={() => setIsProfileModalOpen(true)}
            />
          )}

          {activeTab === 'timer' && (
            <ActiveTimerView user={activeUser} onCompleteSession={handleCompleteSession} />
          )}

          {activeTab === 'analytics' && <InteractiveCharts user={activeUser} />}

          {activeTab === 'reports' && (
            <CepReportsView
              user={activeUser}
              onAddRecord={handleAddExamRecord}
              onDeleteLatestRecord={handleDeleteLatestRecord}
            />
          )}

          {activeTab === 'gemini' && <GeminiChatView user={activeUser} />}

          {activeTab === 'journal' && (
            <JournalView
              user={activeUser}
              onAddEntry={handleAddJournalEntry}
              onDeleteEntry={handleDeleteJournalEntry}
            />
          )}

          {activeTab === 'scheduler' && (
            <SchedulerView
              user={activeUser}
              onAddExam={handleAddExam}
              onDeleteExam={handleDeleteExam}
            />
          )}

          {activeTab === 'motivations' && <MotivationsView />}
        </main>

        {/* Bottom Mobile Tab Bar */}
        <BottomTabBar
          activeTab={activeTab}
          onChangeTab={(tab) => setActiveTab(tab)}
          program={activeUser.program}
        />

        {/* Modals */}
        <NotificationCenterModal
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          notifications={activeUser.notifications}
          onMarkAllRead={handleMarkAllRead}
          onClearAll={handleClearAllNotifications}
          soundEnabled={activeUser.soundEnabled}
          onToggleSound={handleToggleSound}
          pushEnabled={activeUser.pushEnabled}
          onTogglePush={handleTogglePush}
        />

        {/* User Profile & Account Manager Modal (Log Out and Login Another Account on Bottom Left) */}
        <UserProfileManagerModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={activeUser}
          savedUsers={db.users}
          onSelectUser={handleSelectUser}
          onLogOut={handleLogOut}
          onLoginAnotherAccount={handleLoginAnotherAccount}
          onDeleteUser={handleDeleteAccount}
        />

        <VictoryModal
          isOpen={isVictoryOpen}
          onClose={() => setIsVictoryOpen(false)}
          userName={activeUser.userName}
          program={activeUser.program}
        />
      </div>
    </DeviceFrame>
  );
}
