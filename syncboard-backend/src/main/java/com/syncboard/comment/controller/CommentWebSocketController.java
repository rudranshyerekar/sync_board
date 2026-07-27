package com.syncboard.comment.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

/**
 * Handles ephemeral typing indicator events for the comment thread.
 * No persistence — pure relay to the card's typing topic.
 */
@Controller
@RequiredArgsConstructor
public class CommentWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Client publishes: /app/card/{cardId}/typing
     * Payload: { "event": "TYPING_START" | "TYPING_STOP", "userName": "Alice" }
     * Broadcasts to: /topic/card/{cardId}/typing
     */
    @MessageMapping("/card/{cardId}/typing")
    public void handleTyping(
            @DestinationVariable Long cardId,
            @Payload Map<String, Object> payload,
            Principal principal) {

        if (principal == null) return;

        Map<String, Object> event = new HashMap<>(payload);
        event.put("userEmail", principal.getName());

        messagingTemplate.convertAndSend("/topic/card/" + cardId + "/typing", event);
    }
}
