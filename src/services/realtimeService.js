import { insforge } from './insforge';

class RealtimeService {
  constructor() {
    this.currentChannel = null;
    this.subscribed = false;
    this.connecting = false;
    this.listeners = new Map(); // event -> Set of callbacks
  }

  /**
   * Initialize and subscribe to user-scoped Realtime channel
   */
  async init(userId) {
    if (!userId) return;
    const channelName = `user:${userId}`;

    if (this.currentChannel === channelName && this.subscribed) {
      return;
    }

    this.currentChannel = channelName;

    try {
      if (!insforge.realtime.isConnected && !this.connecting) {
        this.connecting = true;
        await insforge.realtime.connect().catch((err) => {
          console.warn('Realtime connection notice:', err);
        });
        this.connecting = false;
      }

      const res = await insforge.realtime.subscribe(channelName).catch((err) => {
        console.warn('Realtime subscribe notice:', err);
        return { ok: false };
      });

      if (res?.ok) {
        this.subscribed = true;
      }
    } catch (err) {
      console.warn('Failed to initialize realtime channel:', err);
      this.connecting = false;
    }
  }

  /**
   * Listen for real-time events on the user channel
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());

      // Bind InsForge socket event
      insforge.realtime.on(event, (msg) => {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
          callbacks.forEach((cb) => {
            try {
              cb(msg?.data || msg);
            } catch (err) {
              console.error('Error in realtime listener callback:', err);
            }
          });
        }
      });
    }

    this.listeners.get(event).add(callback);

    // Return cleanup unsubscriber
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe a callback from an event
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  /**
   * Broadcast an event across all user's connected tabs/devices
   */
  async broadcast(event, data = {}) {
    if (!this.currentChannel) return;
    try {
      await insforge.realtime.publish(this.currentChannel, event, {
        ...data,
        timestamp: Date.now(),
      }).catch((err) => {
        console.warn('Realtime publish notice:', err);
      });
    } catch (err) {
      console.warn('Could not broadcast realtime message:', err);
    }
  }
}

export const realtimeService = new RealtimeService();
