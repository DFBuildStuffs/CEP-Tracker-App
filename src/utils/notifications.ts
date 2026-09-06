import { MilestoneNotification } from '../types';
import { sound } from './sound';

type NotificationListener = (notification: MilestoneNotification) => void;

class NotificationService {
  private listeners: Set<NotificationListener> = new Set();
  private hasRequestedPermission = false;

  subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async requestPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    try {
      this.hasRequestedPermission = true;
      return await Notification.requestPermission();
    } catch {
      return 'denied';
    }
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  getPermission(): NotificationPermission | 'unsupported' {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  }

  dispatchMilestone(
    payload: Omit<MilestoneNotification, 'id' | 'timestamp' | 'read'>,
    options?: { playAudio?: boolean; soundEnabled?: boolean; pushEnabled?: boolean }
  ): MilestoneNotification {
    const notification: MilestoneNotification = {
      ...payload,
      id: `milestone_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };

    // Play synthesized sound if enabled
    if (options?.soundEnabled !== false) {
      if (payload.type === 'all_completed') {
        sound.playGrandVictory();
      } else if (payload.type === 'pass_area' || payload.type === 'pass_initial' || payload.type === 'streak') {
        sound.playMilestone();
      } else if (payload.type === 'timer') {
        sound.playTimerComplete();
      } else {
        sound.playBell();
      }
    }

    // Attempt native browser push notification if permitted and enabled
    if (options?.pushEnabled !== false && this.isSupported() && Notification.permission === 'granted') {
      try {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
        });
      } catch (err) {
        console.warn('Push notification dispatch error:', err);
      }
    }

    // Notify all in-app subscribers (for reactive toasts and active badges)
    this.listeners.forEach((listener) => {
      try {
        listener(notification);
      } catch (e) {
        console.error('Notification listener error:', e);
      }
    });

    return notification;
  }
}

export const notificationService = new NotificationService();
