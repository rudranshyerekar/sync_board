package com.syncboard.comment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CommentRequest {

    @NotBlank(message = "Comment content must not be blank")
    @Size(max = 5000, message = "Comment must not exceed 5000 characters")
    private String content;
}
