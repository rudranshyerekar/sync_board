package com.syncboard.board.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ColumnRequest {
    @NotBlank
    private String title;
    private Double position;
}
