import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class RealWebSocketService {
  constructor() {
    this.client = null;
    this.subscribers = new Map(); // topic -> Array of callbacks
    this.hasConnectedOnce = false;
    this.onReconnectCallback = null;
  }

  setOnReconnect(callback) {
    this.onReconnectCallback = callback;
  }

  connect(token, onConnect) {
    if (this.client && this.client.connected) {
      console.log("[WebSocket] Already connected.");
      if (onConnect) onConnect();
      return;
    }

    console.log("[WebSocket] Connecting...");

    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: (str) => {
        // console.log("[STOMP Debug] " + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = (frame) => {
      console.log("[WebSocket] Connected successfully.");
      
      if (this.hasConnectedOnce) {
        console.log("[WebSocket] Reconnected to server. Resyncing state...");
        if (this.onReconnectCallback) this.onReconnectCallback();
      } else {
        this.hasConnectedOnce = true;
      }

      if (onConnect) onConnect();
      
      // Resubscribe to all active topics on reconnect
      this.subscribers.forEach((callbacks, topic) => {
        this.client.subscribe(topic, (message) => {
          if (message.body) {
            const payload = JSON.parse(message.body);
            callbacks.forEach(cb => cb(payload));
          }
        });
      });
    };

    this.client.onStompError = (frame) => {
      console.error('[WebSocket] Broker reported error: ' + frame.headers['message']);
      console.error('[WebSocket] Additional details: ' + frame.body);
    };

    this.client.activate();
  }

  disconnect() {
    console.log("[WebSocket] Disconnecting...");
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
    this.subscribers.clear();
  }

  subscribe(topic, callback) {
    console.log(`[WebSocket] Subscribing to ${topic}`);
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, []);
    }
    this.subscribers.get(topic).push(callback);

    if (this.client && this.client.connected) {
      this.client.subscribe(topic, (message) => {
        if (message.body) {
          const payload = JSON.parse(message.body);
          callback(payload);
        }
      });
    }
  }

  publish(destination, body) {
    if (this.client && this.client.connected) {
      console.log(`[WebSocket] Publishing to ${destination}:`, body);
      this.client.publish({
        destination: destination,
        body: JSON.stringify(body)
      });
    } else {
      console.warn(`[WebSocket] Cannot publish to ${destination}, not connected.`);
    }
  }
}

export const wsService = new RealWebSocketService();
