package com.syncboard.board.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.syncboard.board.dto.BoardRequest;
import com.syncboard.board.dto.BoardResponse;
import com.syncboard.board.service.BoardService;


@RestController
@RequestMapping("/api/boards/{boardId}")
@RequiredArgsConstructor
public class BoardSingleController {

    private final BoardService boardService;
    
    @GetMapping
    public ResponseEntity<BoardResponse> getBoard(
            @PathVariable Long boardId,
            Authentication authentication) {
        return ResponseEntity.ok(boardService.getBoard(boardId, authentication.getName()));
    }

    @GetMapping("/full")
    public ResponseEntity<com.syncboard.board.dto.FullBoardResponse> getFullBoard(
            @PathVariable Long boardId,
            Authentication authentication) {
        return ResponseEntity.ok(boardService.getFullBoard(boardId, authentication.getName()));
    }

    @PutMapping
    public ResponseEntity<BoardResponse> updateBoard(
            @PathVariable Long boardId,
            @Valid @RequestBody BoardRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(boardService.updateBoard(boardId, request, authentication.getName()));
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteBoard(
            @PathVariable Long boardId,
            Authentication authentication) {
        boardService.deleteBoard(boardId, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/members")
    public ResponseEntity<java.util.List<com.syncboard.user.dto.UserResponse>> getBoardMembers(
            @PathVariable Long boardId,
            Authentication authentication) {
        return ResponseEntity.ok(boardService.getBoardMembers(boardId, authentication.getName()));
    }

    @PostMapping("/members")
    public ResponseEntity<Void> addBoardMember(
            @PathVariable Long boardId,
            @RequestBody java.util.Map<String, Long> payload,
            Authentication authentication) {
        boardService.addBoardMember(boardId, payload.get("userId"), authentication.getName());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/members/{userId}")
    public ResponseEntity<Void> removeBoardMember(
            @PathVariable Long boardId,
            @PathVariable Long userId,
            Authentication authentication) {
        boardService.removeBoardMember(boardId, userId, authentication.getName());
        return ResponseEntity.ok().build();
    }
}
