package com.syncboard.user.dto;

import lombok.Data;

@Data
public class UserUpdateRequest {
    private String name;
    // We can also allow email update if needed, but it might mess with login identity if not careful. Let's just do name and avatar for now.
    private String avatarUrl;
}
