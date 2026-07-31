package com.syncboard.workspace.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.syncboard.workspace.dto.InviteMemberRequest;
import com.syncboard.workspace.dto.UpdateRoleRequest;
import com.syncboard.workspace.dto.WorkspaceRequest;
import com.syncboard.workspace.dto.WorkspaceResponse;
import com.syncboard.workspace.service.WorkspaceService;


@RestController
@RequestMapping("/api/workspaces")
@RequiredArgsConstructor
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    @GetMapping("/{id}/members")
    public ResponseEntity<List<com.syncboard.workspace.dto.WorkspaceMemberResponse>> getMembers(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(workspaceService.getMembers(id, authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<WorkspaceResponse> createWorkspace(
            @Valid @RequestBody WorkspaceRequest request, 
            Authentication authentication) {
        return ResponseEntity.ok(workspaceService.createWorkspace(request, authentication.getName()));
    }

    @GetMapping
    public ResponseEntity<List<WorkspaceResponse>> getMyWorkspaces(Authentication authentication) {
        return ResponseEntity.ok(workspaceService.getMyWorkspaces(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkspaceResponse> getWorkspace(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(workspaceService.getWorkspace(id, authentication.getName()));
    }
    
    @PostMapping("/{id}/members")
    public ResponseEntity<Void> inviteMember(
            @PathVariable Long id,
            @Valid @RequestBody InviteMemberRequest request,
            Authentication authentication) {
        workspaceService.inviteMember(id, request, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/members/{userId}/role")
    public ResponseEntity<Void> updateRole(
            @PathVariable Long id,
            @PathVariable Long userId,
            @Valid @RequestBody UpdateRoleRequest request,
            Authentication authentication) {
        workspaceService.updateRole(id, userId, request, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long id,
            @PathVariable Long userId,
            Authentication authentication) {
        workspaceService.removeMember(id, userId, authentication.getName());
        return ResponseEntity.ok().build();
    }
}
