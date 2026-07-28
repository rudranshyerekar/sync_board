package com.syncboard.activity.service;

import com.syncboard.activity.dto.ActivityResponse;
import com.syncboard.activity.entity.Activity;
import com.syncboard.activity.repository.ActivityRepository;
import com.syncboard.user.dto.UserResponse;
import com.syncboard.user.entity.User;
import com.syncboard.workspace.entity.Workspace;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepository activityRepository;

    @Transactional
    public void logActivity(Workspace workspace, User user, String action, String description) {
        Activity activity = Activity.builder()
                .workspace(workspace)
                .user(user)
                .action(action)
                .description(description)
                .build();
        activityRepository.save(activity);
    }

    @Transactional(readOnly = true)
    public Page<ActivityResponse> getActivities(Long workspaceId, Pageable pageable) {
        return activityRepository.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId, pageable)
                .map(this::mapToResponse);
    }

    private ActivityResponse mapToResponse(Activity activity) {
        User user = activity.getUser();
        UserResponse userResponse = UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                // presenceStatus is usually ephemeral and fetched from PresenceService, but here we can just leave it null or as the entity has it if we don't care in the activity log.
                .build();

        return ActivityResponse.builder()
                .id(activity.getId())
                .workspaceId(activity.getWorkspace().getId())
                .user(userResponse)
                .action(activity.getAction())
                .description(activity.getDescription())
                .createdAt(activity.getCreatedAt())
                .build();
    }
}
