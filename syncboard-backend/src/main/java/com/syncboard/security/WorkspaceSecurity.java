package com.syncboard.security;

import com.syncboard.common.Role;
import com.syncboard.user.entity.User;
import com.syncboard.user.repository.UserRepository;
import com.syncboard.workspace.entity.WorkspaceMember;
import com.syncboard.workspace.repository.WorkspaceMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component("workspaceSecurity")
@RequiredArgsConstructor
public class WorkspaceSecurity {

    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;

    public boolean isMember(Long workspaceId, String email) {
        if (workspaceId == null || email == null) {
            return false;
        }
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isEmpty()) {
            return false;
        }
        return workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, user.get().getId());
    }

    public boolean isAdminOrOwner(Long workspaceId, String email) {
        if (workspaceId == null || email == null) {
            return false;
        }
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isEmpty()) {
            return false;
        }
        Optional<WorkspaceMember> member = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, user.get().getId());
        if (member.isEmpty()) {
            return false;
        }
        Role role = member.get().getRole();
        return role == Role.OWNER || role == Role.ADMIN;
    }
}
