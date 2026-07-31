package com.syncboard.websocket.controller;

import com.syncboard.user.entity.User;
import com.syncboard.user.repository.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;
import java.util.Optional;

@Controller
@RequiredArgsConstructor
public class BoardWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;

    @MessageMapping("/board/{boardId}/card/move")
    public void handleCardMove(@DestinationVariable Long boardId, @Payload Map<String, Object> payload, Principal principal) {
        // In a dual-path design, the client persists via REST and broadcasts the visual move via STOMP.
        // We relay the message to all subscribers so they can perform the optimistic UI update.
        
        BroadcastMessage message = new BroadcastMessage();
        message.setType("CARD_MOVED");
        message.setPayload(payload);
        
        messagingTemplate.convertAndSend("/topic/board/" + boardId, message);
    }

    @MessageMapping("/board/{boardId}/edit/start")
    public void handleEditStart(@DestinationVariable Long boardId, @Payload Map<String, Object> payload, Principal principal) {
        // The payload typically contains cardId. We attach the user info.
        // For simplicity in this relay, we expect the frontend to send { cardId }
        // We augment it with the principal's name if needed, but since we are relaying,
        // we can just pass what the client sent or construct a proper message.
        
        Map<String, Object> enhancedPayload = new java.util.HashMap<>(payload);
        
        // Ensure user details are available for the "Currently edited by..." indicator
        if (principal != null && !enhancedPayload.containsKey("user")) {
            Optional<User> userOpt = userRepository.findByEmail(principal.getName());
            if (userOpt.isPresent()) {
                User dbUser = userOpt.get();
                Map<String, Object> userMap = new java.util.HashMap<>();
                userMap.put("id", dbUser.getId());
                userMap.put("name", dbUser.getName());
                userMap.put("avatarUrl", dbUser.getAvatarUrl());
                enhancedPayload.put("user", userMap);
            }
        }
        
        BroadcastMessage message = new BroadcastMessage();
        message.setType("CARD_EDITING_START");
        message.setPayload(enhancedPayload);
        
        messagingTemplate.convertAndSend("/topic/board/" + boardId, message);
    }

    @MessageMapping("/board/{boardId}/edit/stop")
    public void handleEditStop(@DestinationVariable Long boardId, @Payload Map<String, Object> payload, Principal principal) {
        BroadcastMessage message = new BroadcastMessage();
        message.setType("CARD_EDITING_STOP");
        message.setPayload(payload);
        
        messagingTemplate.convertAndSend("/topic/board/" + boardId, message);
    }

    @MessageMapping("/board/{boardId}/sync")
    public void handleBoardSync(@DestinationVariable Long boardId, @Payload Map<String, Object> payload) {
        // Relays a generic BOARD_SYNC event so other clients know to re-fetch the board
        BroadcastMessage message = new BroadcastMessage();
        message.setType("BOARD_SYNC");
        message.setPayload(payload);
        
        messagingTemplate.convertAndSend("/topic/board/" + boardId, message);
    }

    @Data
    public static class BroadcastMessage {
        private String type;
        private Object payload;
    }
}
