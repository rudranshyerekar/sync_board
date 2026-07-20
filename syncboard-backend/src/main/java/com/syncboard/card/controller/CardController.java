package com.syncboard.card.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.syncboard.card.dto.CardRequest;
import com.syncboard.card.dto.CardResponse;
import com.syncboard.card.service.CardService;


@RestController
@RequestMapping("/api/columns/{columnId}/cards")
@RequiredArgsConstructor
public class CardController {

    private final CardService cardService;

    @PostMapping
    public ResponseEntity<CardResponse> createCard(
            @PathVariable Long columnId,
            @Valid @RequestBody CardRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(cardService.createCard(columnId, request, authentication.getName()));
    }

    @GetMapping
    public ResponseEntity<List<CardResponse>> getCards(
            @PathVariable Long columnId,
            Authentication authentication) {
        return ResponseEntity.ok(cardService.getCards(columnId, authentication.getName()));
    }
}
