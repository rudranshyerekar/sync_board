package com.syncboard.board.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class FullBoardResponse {
    private Long id;
    private Long workspaceId;
    private String title;
    private Double position;
    private String description;
    private com.syncboard.board.entity.BoardPrivacy privacy;
    private List<ColumnWithCardsResponse> columns;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
