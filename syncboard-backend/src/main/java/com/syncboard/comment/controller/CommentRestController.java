package com.syncboard.comment.controller;

import com.syncboard.comment.dto.CommentRequest;
import com.syncboard.comment.dto.CommentResponse;
import com.syncboard.comment.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CommentRestController {

    private final CommentService commentService;

    /**
     * Post a new comment on a card.
     * POST /api/cards/{cardId}/comments
     */
    @PostMapping("/api/cards/{cardId}/comments")
    public ResponseEntity<CommentResponse> postComment(
            @PathVariable Long cardId,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        CommentResponse response = commentService.postComment(cardId, request.getContent(), userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get all comments for a card (ordered oldest-first).
     * GET /api/cards/{cardId}/comments
     */
    @GetMapping("/api/cards/{cardId}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(
            @PathVariable Long cardId,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(commentService.getComments(cardId, userDetails.getUsername()));
    }

    /**
     * Delete own comment.
     * DELETE /api/comments/{commentId}
     */
    @DeleteMapping("/api/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal UserDetails userDetails) {

        commentService.deleteComment(commentId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
