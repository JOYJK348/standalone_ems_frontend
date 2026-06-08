import { create } from 'zustand';
import { platformService } from '@/services/platformService';

export type NotificationType = 'success' | 'error' | 'info' | 'warning' | 'system';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    timestamp: Date;
    read: boolean;
    category?: string;
    actionUrl?: string;
    metadata?: any;
}

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    soundEnabled: boolean;
    lastFetchTime: Date | null;
    fetchNotifications: () => Promise<void>;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    clearAll: () => void;
    toggleSound: () => void;
    playNotificationSound: () => void;
}

// Create notification sound using Web Audio API
const playBeepSound = () => {
    try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

        // Create oscillator for the beep
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Set frequency for a pleasant notification beep
        oscillator.frequency.value = 880; // A5 note
        oscillator.type = 'sine';

        // Set volume envelope
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.1);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);

        // Play second beep after short delay
        setTimeout(() => {
            const osc2 = audioContext.createOscillator();
            const gain2 = audioContext.createGain();

            osc2.connect(gain2);
            gain2.connect(audioContext.destination);

            osc2.frequency.value = 1047; // C6 note (higher pitch)
            osc2.type = 'sine';

            gain2.gain.setValueAtTime(0, audioContext.currentTime);
            gain2.gain.linearRampToValueAtTime(0.25, audioContext.currentTime + 0.01);
            gain2.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);

            osc2.start(audioContext.currentTime);
            osc2.stop(audioContext.currentTime + 0.2);
        }, 150);

    } catch (error) {
        console.warn('Audio notification not supported:', error);
    }
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    soundEnabled: true,
    lastFetchTime: null,

    playNotificationSound: () => {
        if (get().soundEnabled) {
            playBeepSound();
        }
    },

    toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

    fetchNotifications: async () => {
        try {
            const previousCount = get().unreadCount;
            const data = await platformService.getNotifications();

            if (Array.isArray(data)) {
                const mapped: Notification[] = data.map((n: any) => ({
                    id: n.id.toString(),
                    title: n.title,
                    message: n.message,
                    type: (n.type?.toLowerCase() || 'info') as NotificationType,
                    category: n.category,
                    timestamp: new Date(n.created_at),
                    read: n.is_read,
                    actionUrl: n.action_url,
                    metadata: n.metadata
                }));

                const newUnreadCount = mapped.filter(n => !n.read).length;

                // Play sound if there are new notifications
                if (newUnreadCount > previousCount && get().lastFetchTime !== null) {
                    get().playNotificationSound();
                }

                set({
                    notifications: mapped,
                    unreadCount: newUnreadCount,
                    lastFetchTime: new Date()
                });
            }
        } catch (e) {
            console.error("Failed to fetch notifications", e);
        }
    },

    addNotification: (n) => set((state) => {
        const newNotification: Notification = {
            ...n,
            id: Math.random().toString(36).substring(7),
            timestamp: new Date(),
            read: false,
        };

        // Play notification sound for new real-time notifications
        if (state.soundEnabled) {
            playBeepSound();
        }

        const updatedNotifications = [newNotification, ...state.notifications].slice(0, 50);
        return {
            notifications: updatedNotifications,
            unreadCount: updatedNotifications.filter(x => !x.read).length
        };
    }),

    markAsRead: async (id) => {
        // Optimistic Update
        set((state) => {
            const updated = state.notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
            );
            return {
                notifications: updated,
                unreadCount: updated.filter(x => !x.read).length
            };
        });
        // API Call
        await platformService.markNotificationsRead([id]);
    },

    markAllAsRead: async () => {
        // Optimistic Update
        set((state) => {
            const updated = state.notifications.map(n => ({ ...n, read: true }));
            return {
                notifications: updated,
                unreadCount: 0
            };
        });
        // API Call
        await platformService.markNotificationsRead([], true);
    },

    clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));
