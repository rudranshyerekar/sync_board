package com.syncboard.board.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.syncboard.board.service.BoardColumnService;
import com.syncboard.board.dto.ColumnRequest;
import com.syncboard.board.dto.ColumnResponse;


@RestController
@RequestMapping("/api/columns/{columnId}")
@RequiredArgsConstructor
public class BoardColumnSingleController {

    private final BoardColumnService columnService;

    @PutMapping
    public ResponseEntity<ColumnResponse> updateColumn(
            @PathVariable Long columnId,
            @Valid @RequestBody ColumnRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(columnService.updateColumn(columnId, request, authentication.getName()));
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteColumn(
            @PathVariable Long columnId,
            Authentication authentication) {
        columnService.deleteColumn(columnId, authentication.getName());
        return ResponseEntity.ok().build();
    }
}
