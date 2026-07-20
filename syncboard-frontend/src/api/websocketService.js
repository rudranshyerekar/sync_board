// src/api/websocketService.js

// Mock Users for real-time simulation
const mockUsers = [
  { id: 'user-2', name: 'Sneha Patil', avatarUrl: 'https://i.pravatar.cc/150?u=sneha', status: 'online' },
  { id: 'user-3', name: 'Rohit Sharma', avatarUrl: 'https://i.pravatar.cc/150?u=rohit', status: 'online' },
  { id: 'user-4', name: 'Ananya Desai', avatarUrl: 'https://i.pravatar.cc/150?u=ananya', status: 'idle' }
];

class MockWebSocketService {
  constructor() {
    this.subscribers = new Map();
    this.simulationInterval = null;
  }

  connect(token, onConnect) {
    console.log("[WebSocket] Connecting...");
    setTimeout(() => {
      console.log("[WebSocket] Connected successfully.");
      onConnect();
      this.startSimulation();
    }, 800);
  }

  disconnect() {
    console.log("[WebSocket] Disconnecting...");
    if (this.simulationInterval) clearInterval(this.simulationInterval);
    this.subscribers.clear();
  }

  subscribe(topic, callback) {
    console.log(`[WebSocket] Subscribed to ${topic}`);
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, []);
    }
    this.subscribers.get(topic).push(callback);

    // If subscribing to presence, immediately send current presence state
    if (topic.endsWith('/presence')) {
      setTimeout(() => {
        this.emit(topic, { type: 'PRESENCE_UPDATE', users: mockUsers });
      }, 500);
    }
  }

  publish(destination, body) {
    console.log(`[WebSocket] Published to ${destination}:`, body);
    
    // Simulate server broadcasting the event back to subscribers
    // If it's an EDIT_START event, broadcast it to the board topic
    if (destination.includes('/edit')) {
      const topic = destination.replace('/app', '/topic'); // standard STOMP pattern
      setTimeout(() => {
        this.emit(topic, body);
      }, 200);
    }
  }

  emit(topic, payload) {
    const callbacks = this.subscribers.get(topic);
    if (callbacks) {
      callbacks.forEach(cb => cb(payload));
    }
  }

  // --- MOCK SIMULATION ENGINE ---
  // This simulates other users doing things on the board
  startSimulation() {
    if (this.simulationInterval) return;

    this.simulationInterval = setInterval(() => {
      const topic = '/topic/board/board-1';
      
      // Randomly simulate an event every 10 seconds
      const eventType = Math.random();
      
      if (eventType > 0.7) {
        // Simulate someone moving a card
        this.emit(topic, {
          type: 'CARD_MOVED',
          payload: {
            cardId: 'card-1',
            sourceColId: 'col-todo',
            targetColId: 'col-progress',
            newIndex: 0
          }
        });
      } else if (eventType > 0.4) {
        // Simulate someone starting to edit a card
        this.emit(topic, {
          type: 'CARD_EDITING_START',
          payload: {
            cardId: 'card-4',
            userId: 'user-2',
            user: mockUsers[0]
          }
        });
        
        // Stop editing after 5 seconds
        setTimeout(() => {
          this.emit(topic, {
            type: 'CARD_EDITING_STOP',
            payload: { cardId: 'card-4', userId: 'user-2' }
          });
        }, 5000);
      }
    }, 10000);
  }
}

export const wsService = new MockWebSocketService();
