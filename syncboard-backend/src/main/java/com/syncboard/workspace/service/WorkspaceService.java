package com.syncboard.workspace.service;

import com.syncboard.common.Role;
import com.syncboard.common.exception.BadRequestException;
import com.syncboard.common.exception.ResourceNotFoundException;
import com.syncboard.user.entity.User;
import com.syncboard.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import com.syncboard.workspace.dto.InviteMemberRequest;
import com.syncboard.workspace.dto.UpdateRoleRequest;
import com.syncboard.workspace.entity.Workspace;
import com.syncboard.workspace.entity.WorkspaceMember;
import com.syncboard.workspace.repository.WorkspaceMemberRepository;
import com.syncboard.workspace.repository.WorkspaceRepository;
import com.syncboard.workspace.dto.WorkspaceRequest;
import com.syncboard.workspace.dto.WorkspaceResponse;


@Service
@RequiredArgsConstructor
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;

    @Transactional
    public WorkspaceResponse createWorkspace(WorkspaceRequest request, String currentUserEmail) {
        User creator = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Workspace workspace = Workspace.builder()
                .name(request.getName())
                .createdBy(creator)
                .build();

        Workspace saved = workspaceRepository.save(workspace);

        WorkspaceMember ownerMember = WorkspaceMember.builder()
                .workspace(saved)
                .user(creator)
                .role(Role.OWNER)
                .build();

        workspaceMemberRepository.save(ownerMember);

        return mapToResponse(saved);
    }

    public List<WorkspaceResponse> getMyWorkspaces(String currentUserEmail) {
        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return workspaceRepository.findByMembersUserId(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public WorkspaceResponse getWorkspace(Long workspaceId, String currentUserEmail) {
        Workspace workspace = getWorkspaceIfMember(workspaceId, currentUserEmail);
        return mapToResponse(workspace);
    }
    
    @Transactional
    public void inviteMember(Long workspaceId, InviteMemberRequest request, String currentUserEmail) {
        Workspace workspace = getWorkspaceIfMember(workspaceId, currentUserEmail);
        User currentUser = userRepository.findByEmail(currentUserEmail).orElseThrow();
        
        WorkspaceMember currentMember = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspace.getId(), currentUser.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Member not found"));
            
        if (currentMember.getRole() != Role.OWNER && currentMember.getRole() != Role.ADMIN) {
            throw new BadRequestException("Only Owner or Admin can invite members");
        }
        
        User invitee = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new ResourceNotFoundException("Invitee not found with email: " + request.getEmail()));
            
        if (workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspace.getId(), invitee.getId())) {
             throw new BadRequestException("User is already a member of this workspace");
        }
        
        WorkspaceMember newMember = WorkspaceMember.builder()
            .workspace(workspace)
            .user(invitee)
            .role(request.getRole())
            .build();
            
        workspaceMemberRepository.save(newMember);
    }

    private Workspace getWorkspaceIfMember(Long workspaceId, String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));

        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspace.getId(), user.getId())) {
            throw new ResourceNotFoundException("Workspace not found or unauthorized");
        }

        return workspace;
    }

    private WorkspaceResponse mapToResponse(Workspace workspace) {
        return WorkspaceResponse.builder()
                .id(workspace.getId())
                .name(workspace.getName())
                .createdById(workspace.getCreatedBy().getId())
                .createdAt(workspace.getCreatedAt())
                .updatedAt(workspace.getUpdatedAt())
                .build();
    }
    @Transactional
    public void updateRole(Long workspaceId, Long userId, UpdateRoleRequest request, String currentUserEmail) {
        Workspace workspace = getWorkspaceIfMember(workspaceId, currentUserEmail);
        User currentUser = userRepository.findByEmail(currentUserEmail).orElseThrow();

        WorkspaceMember currentMember = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspace.getId(), currentUser.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Member not found"));

        if (currentMember.getRole() != Role.OWNER && currentMember.getRole() != Role.ADMIN) {
            throw new BadRequestException("Only Owner or Admin can update roles");
        }

        WorkspaceMember targetMember = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspace.getId(), userId)
            .orElseThrow(() -> new ResourceNotFoundException("Target user is not a member of this workspace"));

        if (targetMember.getRole() == Role.OWNER && currentMember.getRole() != Role.OWNER) {
            throw new BadRequestException("Admins cannot change Owner role");
        }

        targetMember.setRole(request.getRole());
        workspaceMemberRepository.save(targetMember);
    }

    @Transactional
    public void removeMember(Long workspaceId, Long userId, String currentUserEmail) {
        Workspace workspace = getWorkspaceIfMember(workspaceId, currentUserEmail);
        User currentUser = userRepository.findByEmail(currentUserEmail).orElseThrow();

        WorkspaceMember currentMember = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspace.getId(), currentUser.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Member not found"));

        if (currentMember.getRole() != Role.OWNER && currentMember.getRole() != Role.ADMIN) {
            throw new BadRequestException("Only Owner or Admin can remove members");
        }

        WorkspaceMember targetMember = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspace.getId(), userId)
            .orElseThrow(() -> new ResourceNotFoundException("Target user is not a member of this workspace"));

        if (targetMember.getRole() == Role.OWNER) {
             throw new BadRequestException("Cannot remove the Owner of the workspace");
        }

        workspaceMemberRepository.delete(targetMember);
    }
}
