package com.syncboard.presence.model;

import com.syncboard.user.entity.User;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class UserSession {
    private User user;
    private String status; // "online", "idle", "away"
    private Instant lastHeartbeat;
    private Long editingCardId; // Nullable
}
