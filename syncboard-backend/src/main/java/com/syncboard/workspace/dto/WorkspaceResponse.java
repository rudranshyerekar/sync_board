package com.syncboard.workspace.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class WorkspaceResponse {
    private Long id;
    private String name;
    private Long createdById;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
