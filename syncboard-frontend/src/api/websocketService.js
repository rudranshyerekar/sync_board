import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class RealWebSocketService {
  constructor() {
    this.client = null;
    // topic -> Set of callbacks (deduplicated by reference)
    this.subscribers = new Map();
    // topic -> actual STOMP subscription object (for cleanup)
    this.stompSubs = new Map();
    this.hasConnectedOnce = false;
    this.onReconnectCallback = null;
  }

  setOnReconnect(callback) {
    this.onReconnectCallback = callback;
  }

  connect(token, onConnect) {
    if (this.client && this.client.connected) {
      console.log('[WebSocket] Already connected.');
      if (onConnect) onConnect();
      return;
    }

    console.log('[WebSocket] Connecting...');

    this.client = new Client({
      webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws'),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: () => {},
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = (frame) => {
      console.log('[WebSocket] Connected.');

      if (this.hasConnectedOnce) {
        console.log('[WebSocket] Reconnected. Resyncing...');
        if (this.onReconnectCallback) this.onReconnectCallback();
      } else {
        this.hasConnectedOnce = true;
      }

      // Resubscribe ALL registered topics on every (re)connect
      this.subscribers.forEach((callbacks, topic) => {
        this._doSubscribe(topic, callbacks);
      });

      if (onConnect) onConnect();
    };

    this.client.onStompError = (frame) => {
      console.error('[WebSocket] STOMP error:', frame.headers['message'], frame.body);
    };

    this.client.activate();
  }

  /** Internal: create a single STOMP subscription for a topic that fans out to all callbacks */
  _doSubscribe(topic, callbacks) {
    // Unsubscribe old STOMP sub if exists (avoids duplicates on reconnect)
    if (this.stompSubs.has(topic)) {
      try { this.stompSubs.get(topic).unsubscribe(); } catch (_) {}
    }
    const stompSub = this.client.subscribe(topic, (message) => {
      if (message.body) {
        let payload;
        try { payload = JSON.parse(message.body); } catch (_) { return; }
        callbacks.forEach(cb => cb(payload));
      }
    });
    this.stompSubs.set(topic, stompSub);
  }

  disconnect() {
    console.log('[WebSocket] Disconnecting...');
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
    this.subscribers.clear();
    this.stompSubs.clear();
    this.hasConnectedOnce = false;
  }

  /**
   * Register a callback for a topic.
   * If already connected, immediately creates the STOMP subscription.
   * On reconnect, all registered topics are re-subscribed automatically.
   */
  subscribe(topic, callback) {
    console.log(`[WebSocket] subscribe → ${topic}`);
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, []);
    }
    const callbacks = this.subscribers.get(topic);

    // Avoid duplicate callbacks for the same topic (e.g. HMR re-mount)
    if (!callbacks.includes(callback)) {
      callbacks.push(callback);
    }

    // If already connected, wire up the STOMP subscription immediately
    if (this.client && this.client.connected) {
      this._doSubscribe(topic, callbacks);
    }
  }

  /**
   * Remove a specific callback from a topic.
   * If no callbacks remain, unsubscribes from the STOMP broker too.
   */
  unsubscribe(topic, callback) {
    if (!this.subscribers.has(topic)) return;
    const callbacks = this.subscribers.get(topic).filter(cb => cb !== callback);
    if (callbacks.length === 0) {
      this.subscribers.delete(topic);
      if (this.stompSubs.has(topic)) {
        try { this.stompSubs.get(topic).unsubscribe(); } catch (_) {}
        this.stompSubs.delete(topic);
      }
    } else {
      this.subscribers.set(topic, callbacks);
      // Rewire the fan-out with updated callback list
      if (this.client && this.client.connected) {
        this._doSubscribe(topic, callbacks);
      }
    }
  }

  publish(destination, body) {
    if (this.client && this.client.connected) {
      this.client.publish({
        destination,
        body: JSON.stringify(body),
      });
    } else {
      console.warn(`[WebSocket] Cannot publish to ${destination} — not connected.`);
    }
  }

  get isConnected() {
    return !!(this.client && this.client.connected);
  }
}

export const wsService = new RealWebSocketService();
