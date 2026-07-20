package com.syncboard.board.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.syncboard.board.dto.BoardRequest;
import com.syncboard.board.dto.BoardResponse;
import com.syncboard.board.service.BoardService;


@RestController
@RequestMapping("/api/workspaces/{workspaceId}/boards")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    @PostMapping
    public ResponseEntity<BoardResponse> createBoard(
            @PathVariable Long workspaceId,
            @Valid @RequestBody BoardRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(boardService.createBoard(workspaceId, request, authentication.getName()));
    }

    @GetMapping
    public ResponseEntity<List<BoardResponse>> getBoards(
            @PathVariable Long workspaceId,
            Authentication authentication) {
        return ResponseEntity.ok(boardService.getBoards(workspaceId, authentication.getName()));
    }
}
