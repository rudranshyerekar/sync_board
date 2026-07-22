package com.syncboard.presence.controller;

import com.syncboard.presence.service.PresenceService;
import com.syncboard.user.entity.User;
import com.syncboard.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;
import java.util.Optional;

@Controller
@RequiredArgsConstructor
public class PresenceWebSocketController {

    private final PresenceService presenceService;
    private final UserRepository userRepository;

    @MessageMapping("/board/{boardId}/presence/heartbeat")
    public void handleHeartbeat(@DestinationVariable Long boardId, @Payload Map<String, Object> payload, Principal principal) {
        if (principal == null) return;
        
        Optional<User> userOpt = userRepository.findByEmail(principal.getName());
        if (userOpt.isEmpty()) return;

        String status = payload.getOrDefault("status", "online").toString();
        
        Long editingCardId = null;
        if (payload.containsKey("editingCardId") && payload.get("editingCardId") != null) {
            try {
                editingCardId = Long.valueOf(payload.get("editingCardId").toString());
            } catch (NumberFormatException ignored) {}
        }

        presenceService.updateHeartbeat(boardId, userOpt.get(), status, editingCardId);
    }

    @MessageMapping("/board/{boardId}/presence/leave")
    public void handleLeave(@DestinationVariable Long boardId, Principal principal) {
        if (principal == null) return;
        presenceService.removeUser(boardId, principal.getName());
    }
}
