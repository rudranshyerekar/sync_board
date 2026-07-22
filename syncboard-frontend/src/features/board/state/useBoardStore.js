import { create } from 'zustand';
import { boardApi } from '../../../api/boardApi';
import { cardApi } from '../../../api/cardApi';
import { wsService } from '../../../api/websocketService';

export const useBoardStore = create((set, get) => ({
  board: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedCardId: null,
  activeUsers: [],
  editingCards: {}, // { cardId: user }

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCard: (cardId) => set({ selectedCardId: cardId }),

  fetchBoard: async (boardId) => {
    set({ isLoading: true, error: null });
    try {
      // Fetch entire board hierarchy (board + columns + cards) in 1 request
      const fullBoard = await boardApi.getFullBoard(boardId);
      set({ board: fullBoard, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || err.message, isLoading: false });
    }
  },

  createColumn: async (boardId, payload) => {
    try {
      const data = typeof payload === 'string' ? { title: payload } : payload;
      await boardApi.createColumn(boardId, data);
      get().fetchBoard(boardId);
    } catch (err) {
      console.error("Failed to create column:", err);
      alert("Failed to create column.");
    }
  },

  updateBoard: async (boardId, title) => {
    try {
      await boardApi.updateBoard(boardId, { title });
      get().fetchBoard(boardId);
    } catch (err) {
      console.error("Failed to update board:", err);
      alert("Failed to rename board.");
    }
  },

  updateColumn: async (columnId, title) => {
    try {
      await boardApi.updateColumn(columnId, { title });
      get().fetchBoard(get().board?.id);
    } catch (err) {
      console.error("Failed to update column:", err);
      alert("Failed to rename column.");
    }
  },

  deleteColumn: async (columnId) => {
    try {
      await boardApi.deleteColumn(columnId);
      get().fetchBoard(get().board?.id);
    } catch (err) {
      console.error("Failed to delete column:", err);
      alert("Failed to delete column.");
    }
  },

  createCard: async (columnId, payload) => {
    try {
      const data = typeof payload === 'string' ? { title: payload } : payload;
      await cardApi.createCard(columnId, data);
      const boardId = get().board?.id;
      if (boardId) {
        get().fetchBoard(boardId);
      }
    } catch (err) {
      console.error("Failed to create card:", err);
      alert("Failed to create card.");
    }
  },

  updateCard: async (cardId, cardData) => {
    try {
      await cardApi.updateCard(cardId, cardData);
      const boardId = get().board?.id;
      if (boardId) {
        get().fetchBoard(boardId);
      }
    } catch (err) {
      console.error("Failed to update card:", err);
      alert("Failed to update card. Changes have been reverted.");
      get().fetchBoard(get().board?.id);
    }
  },

  deleteCard: async (cardId) => {
    try {
      await cardApi.deleteCard(cardId);
      get().fetchBoard(get().board?.id);
    } catch (err) {
      console.error("Failed to delete card:", err);
      alert("Failed to delete card.");
    }
  },

  // --- Real-time Sync (Phase 3 & 4) ---
  initRealTimeSync: (boardId) => {
    const token = localStorage.getItem('accessToken');
    wsService.connect(token, () => {
      // 1. Subscribe to Presence
      wsService.subscribe(`/topic/board/${boardId}/presence`, (message) => {
        if (message.type === 'PRESENCE_UPDATE') {
          set({ activeUsers: message.users });
        }
      });

      // 2. Subscribe to Board Events (Moves, Edits)
      wsService.subscribe(`/topic/board/${boardId}`, (message) => {
        const state = get();
        
        switch (message.type) {
          case 'CARD_MOVED': {
            // An external user moved a card. We apply the same optimistic logic locally.
            const { cardId, sourceColId, targetColId, newIndex } = message.payload;
            state.moveCardOptimistic(cardId, sourceColId, targetColId, newIndex);
            break;
          }
            
          case 'CARD_EDITING_START':
            set((prev) => ({
              editingCards: {
                ...prev.editingCards,
                [message.payload.cardId]: message.payload.user
              }
            }));
            break;
            
          case 'CARD_EDITING_STOP':
            set((prev) => {
              const newEditing = { ...prev.editingCards };
              delete newEditing[message.payload.cardId];
              return { editingCards: newEditing };
            });
            break;
        }
      });
    });
  },

  disconnectRealTimeSync: () => {
    wsService.disconnect();
    set({ activeUsers: [], editingCards: {} });
  },

  // Broadcast that LOCAL user started editing
  publishEditStart: (cardId) => {
    wsService.publish(`/app/board/${get().board?.id}/edit/start`, { cardId });
  },

  // Broadcast that LOCAL user stopped editing
  publishEditStop: (cardId) => {
    wsService.publish(`/app/board/${get().board?.id}/edit/stop`, { cardId });
  },

  // Optimistic update for dragging cards
  moveCardOptimistic: (cardId, sourceColId, targetColId, newIndex) => {
    set((state) => {
      if (!state.board) return state;

      const newBoard = JSON.parse(JSON.stringify(state.board)); // Deep clone for safety
      
      const sourceCol = newBoard.columns.find(c => c.id === sourceColId);
      const targetCol = newBoard.columns.find(c => c.id === targetColId);
      
      if (!sourceCol || !targetCol) return state;

      const cardIndex = sourceCol.cards.findIndex(c => c.id === cardId);
      if (cardIndex === -1) return state;

      const [card] = sourceCol.cards.splice(cardIndex, 1);
      targetCol.cards.splice(newIndex, 0, card);

      return { board: newBoard };
    });
  },

  // Sync with backend after optimistic update
  syncMoveCard: async (cardId, sourceColId, targetColId, newIndex) => {
    try {
      const state = get();
      const targetCol = state.board.columns.find(c => c.id === targetColId);
      
      let newPosition = 1000.0;
      const cards = targetCol.cards;
      
      if (cards.length > 1) {
        if (newIndex === 0) {
           newPosition = (cards[1].position || 1000.0) / 2.0;
        } else if (newIndex === cards.length - 1) {
           newPosition = (cards[cards.length - 2].position || 1000.0) + 1000.0;
        } else {
           const prevPos = cards[newIndex - 1].position || 1000.0;
           const nextPos = cards[newIndex + 1].position || 2000.0;
           newPosition = (prevPos + nextPos) / 2.0;
        }
      }

      await cardApi.moveCard(cardId, targetColId, newPosition);
      // Publish the visual move to STOMP so other clients can animate it
      wsService.publish(`/app/board/${get().board?.id}/card/move`, {
        cardId, sourceColId, targetColId, newIndex
      });
      // Optional: re-fetch to ensure sync
      // get().fetchBoard(get().board.id);
    } catch (err) {
      console.error("Failed to sync card move:", err);
      alert("Failed to move card. Changes have been reverted.");
      // Trigger a re-fetch to repair state on failure
      get().fetchBoard(get().board?.id);
    }
  }
}));
