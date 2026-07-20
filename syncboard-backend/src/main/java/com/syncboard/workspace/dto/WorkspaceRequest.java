package com.syncboard.workspace.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class WorkspaceRequest {
    @NotBlank
    private String name;
}
