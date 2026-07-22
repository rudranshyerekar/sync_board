package com.syncboard.presence.service;

import com.syncboard.presence.model.UserSession;
import com.syncboard.user.entity.User;
import com.syncboard.websocket.controller.BoardWebSocketController.BroadcastMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class PresenceService {

    private final SimpMessagingTemplate messagingTemplate;

    // boardId -> (email -> UserSession)
    private final Map<Long, Map<String, UserSession>> boardSessions = new ConcurrentHashMap<>();

    public void updateHeartbeat(Long boardId, User user, String status, Long editingCardId) {
        boardSessions.putIfAbsent(boardId, new ConcurrentHashMap<>());
        Map<String, UserSession> usersOnBoard = boardSessions.get(boardId);

        UserSession session = UserSession.builder()
                .user(user)
                .status(status)
                .lastHeartbeat(Instant.now())
                .editingCardId(editingCardId)
                .build();

        usersOnBoard.put(user.getEmail(), session);

        broadcastPresence(boardId);
    }

    public void removeUser(Long boardId, String email) {
        if (boardSessions.containsKey(boardId)) {
            Map<String, UserSession> usersOnBoard = boardSessions.get(boardId);
            UserSession removed = usersOnBoard.remove(email);
            if (removed != null && removed.getEditingCardId() != null) {
                broadcastEditStop(boardId, removed.getEditingCardId(), removed.getUser());
            }
            broadcastPresence(boardId);
        }
    }

    private void broadcastPresence(Long boardId) {
        Map<String, UserSession> usersOnBoard = boardSessions.get(boardId);
        if (usersOnBoard == null) return;

        List<Map<String, Object>> activeUsers = new ArrayList<>();
        usersOnBoard.values().forEach(session -> {
            Map<String, Object> u = new HashMap<>();
            u.put("id", session.getUser().getId());
            u.put("name", session.getUser().getName());
            u.put("email", session.getUser().getEmail());
            u.put("avatarUrl", session.getUser().getAvatarUrl());
            u.put("status", session.getStatus());
            activeUsers.add(u);
        });

        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "PRESENCE_UPDATE");
        payload.put("users", activeUsers);

        messagingTemplate.convertAndSend("/topic/board/" + boardId + "/presence", payload);
    }

    private void broadcastEditStop(Long boardId, Long cardId, User user) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("cardId", cardId);
        payload.put("userEmail", user.getEmail());

        BroadcastMessage message = new BroadcastMessage();
        message.setType("CARD_EDITING_STOP");
        message.setPayload(payload);

        messagingTemplate.convertAndSend("/topic/board/" + boardId, message);
    }

    @Scheduled(fixedRate = 5000)
    public void evictStaleSessions() {
        Instant cutoff = Instant.now().minusSeconds(10); // 10 seconds threshold

        boardSessions.forEach((boardId, usersOnBoard) -> {
            boolean changed = false;
            for (Map.Entry<String, UserSession> entry : usersOnBoard.entrySet()) {
                if (entry.getValue().getLastHeartbeat().isBefore(cutoff)) {
                    log.info("Evicting stale session for user {} on board {}", entry.getKey(), boardId);
                    UserSession removed = usersOnBoard.remove(entry.getKey());
                    if (removed != null && removed.getEditingCardId() != null) {
                        broadcastEditStop(boardId, removed.getEditingCardId(), removed.getUser());
                    }
                    changed = true;
                }
            }
            if (changed) {
                broadcastPresence(boardId);
            }
        });
    }
}
