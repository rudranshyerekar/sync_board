package com.syncboard.card.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import com.syncboard.card.entity.CardPriority;


import com.syncboard.user.dto.UserResponse;

@Data
@Builder
public class CardResponse {
    private Long id;
    private Long columnId;
    private String title;
    private String description;
    private CardPriority priority;
    private Long assigneeId;
    private UserResponse assignee;
    private LocalDateTime deadline;
    private Double position;
    private Long version;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
