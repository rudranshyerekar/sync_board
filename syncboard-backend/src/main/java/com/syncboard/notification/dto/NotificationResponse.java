package com.syncboard.notification.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.syncboard.notification.entity.NotificationType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {

    private Long id;
    private String message;
    private NotificationType type;
    @JsonProperty("isRead")
    private boolean read;
    private Long referenceId;
    private Long boardId;
    private LocalDateTime createdAt;
}
