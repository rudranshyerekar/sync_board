package com.syncboard.activity.controller;

import com.syncboard.activity.dto.ActivityResponse;
import com.syncboard.activity.service.ActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/activities")
@RequiredArgsConstructor
public class ActivityRestController {

    private final ActivityService activityService;

    @GetMapping
    @PreAuthorize("@workspaceSecurity.isMember(#workspaceId, authentication.name)")
    public ResponseEntity<Page<ActivityResponse>> getWorkspaceActivities(
            @PathVariable Long workspaceId,
            Pageable pageable) {
        return ResponseEntity.ok(activityService.getActivities(workspaceId, pageable));
    }
}
