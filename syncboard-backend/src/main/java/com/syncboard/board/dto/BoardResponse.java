package com.syncboard.board.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class BoardResponse {
    private Long id;
    private Long workspaceId;
    private String title;
    private Double position;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
