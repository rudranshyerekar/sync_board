package com.syncboard.security;

import com.syncboard.common.Role;
import com.syncboard.user.entity.User;
import com.syncboard.user.repository.UserRepository;
import com.syncboard.workspace.entity.WorkspaceMember;
import com.syncboard.workspace.repository.WorkspaceMemberRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class WorkspaceSecurityTest {

    @Mock
    private WorkspaceMemberRepository workspaceMemberRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private WorkspaceSecurity workspaceSecurity;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder().id(1L).email("user@example.com").build();
    }

    @Test
    void testIsMember_WhenMemberExists_ReturnsTrue() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(testUser));
        when(workspaceMemberRepository.existsByWorkspaceIdAndUserId(10L, 1L)).thenReturn(true);

        assertTrue(workspaceSecurity.isMember(10L, "user@example.com"));
    }

    @Test
    void testIsMember_WhenNotMember_ReturnsFalse() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(testUser));
        when(workspaceMemberRepository.existsByWorkspaceIdAndUserId(10L, 1L)).thenReturn(false);

        assertFalse(workspaceSecurity.isMember(10L, "user@example.com"));
    }

    @Test
    void testIsAdminOrOwner_WhenRoleIsOwner_ReturnsTrue() {
        WorkspaceMember ownerMember = WorkspaceMember.builder().role(Role.OWNER).build();
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(testUser));
        when(workspaceMemberRepository.findByWorkspaceIdAndUserId(10L, 1L)).thenReturn(Optional.of(ownerMember));

        assertTrue(workspaceSecurity.isAdminOrOwner(10L, "user@example.com"));
    }

    @Test
    void testIsAdminOrOwner_WhenRoleIsMember_ReturnsFalse() {
        WorkspaceMember standardMember = WorkspaceMember.builder().role(Role.MEMBER).build();
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(testUser));
        when(workspaceMemberRepository.findByWorkspaceIdAndUserId(10L, 1L)).thenReturn(Optional.of(standardMember));

        assertFalse(workspaceSecurity.isAdminOrOwner(10L, "user@example.com"));
    }
}
