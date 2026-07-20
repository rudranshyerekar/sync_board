package com.syncboard.board.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.syncboard.board.service.BoardColumnService;
import com.syncboard.board.dto.ColumnRequest;
import com.syncboard.board.dto.ColumnResponse;


@RestController
@RequestMapping("/api/boards/{boardId}/columns")
@RequiredArgsConstructor
public class BoardColumnController {

    private final BoardColumnService columnService;

    @PostMapping
    public ResponseEntity<ColumnResponse> createColumn(
            @PathVariable Long boardId,
            @Valid @RequestBody ColumnRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(columnService.createColumn(boardId, request, authentication.getName()));
    }

    @GetMapping
    public ResponseEntity<List<ColumnResponse>> getColumns(
            @PathVariable Long boardId,
            Authentication authentication) {
        return ResponseEntity.ok(columnService.getColumns(boardId, authentication.getName()));
    }
}
