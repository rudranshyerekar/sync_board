package com.syncboard.card.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDateTime;
import com.syncboard.card.entity.CardPriority;


@Data
public class CardRequest {
    @NotBlank
    private String title;
    private String description;
    private CardPriority priority;
    private Long assigneeId;
    private LocalDateTime deadline;
    private Double position;
    private Long version;
}
