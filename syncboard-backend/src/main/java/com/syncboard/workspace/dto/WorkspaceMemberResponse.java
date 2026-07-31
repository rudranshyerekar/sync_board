package com.syncboard.workspace.dto;

import com.syncboard.common.Role;
import com.syncboard.user.dto.UserResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WorkspaceMemberResponse {
    private Long id; // maps to userId for frontend compatibility
    private Role role;
    private UserResponse user;
}
