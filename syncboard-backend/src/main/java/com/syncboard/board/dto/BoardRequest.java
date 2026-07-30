package com.syncboard.board.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BoardRequest {
    @NotBlank
    private String title;
    private Double position;
    private String description;
    private com.syncboard.board.entity.BoardPrivacy privacy;
    @Data
    public static class InitialColumnRequest {
        private String title;
        private String color;
    }
    private java.util.List<InitialColumnRequest> initialColumns;
    private java.util.List<Long> inviteeIds;
}
