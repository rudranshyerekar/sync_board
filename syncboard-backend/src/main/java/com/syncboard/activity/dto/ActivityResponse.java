package com.syncboard.activity.dto;

import com.syncboard.user.dto.UserResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityResponse {
    private Long id;
    private Long workspaceId;
    private UserResponse user;
    private String action;
    private String description;
    private LocalDateTime createdAt;
}
