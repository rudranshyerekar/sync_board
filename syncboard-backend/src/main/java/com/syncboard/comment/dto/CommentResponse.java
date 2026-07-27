package com.syncboard.comment.dto;

import com.syncboard.user.dto.UserResponse;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CommentResponse {

    private Long id;
    private Long cardId;
    private String content;
    private UserResponse author;
    private LocalDateTime createdAt;
}
