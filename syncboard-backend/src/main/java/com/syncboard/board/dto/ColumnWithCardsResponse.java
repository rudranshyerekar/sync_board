package com.syncboard.board.dto;

import com.syncboard.card.dto.CardResponse;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ColumnWithCardsResponse {
    private Long id;
    private Long boardId;
    private String title;
    private Double position;
    private String color;
    private String description;
    private List<CardResponse> cards;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
