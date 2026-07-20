package com.syncboard.workspace.dto;

import com.syncboard.common.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InviteMemberRequest {
    @NotBlank
    @Email
    private String email;

    @NotNull
    private Role role;
}
