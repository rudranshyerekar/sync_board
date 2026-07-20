package com.syncboard.card.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.syncboard.card.dto.CardRequest;
import com.syncboard.card.dto.CardResponse;
import com.syncboard.card.service.CardService;


@RestController
@RequestMapping("/api/cards/{cardId}")
@RequiredArgsConstructor
public class CardSingleController {

    private final CardService cardService;

    @PutMapping
    public ResponseEntity<CardResponse> updateCard(
            @PathVariable Long cardId,
            @Valid @RequestBody CardRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(cardService.updateCard(cardId, request, authentication.getName()));
    }
    
    @PatchMapping("/move")
    public ResponseEntity<CardResponse> moveCard(
            @PathVariable Long cardId,
            @RequestParam Long targetColumnId,
            @RequestParam Double position,
            Authentication authentication) {
        return ResponseEntity.ok(cardService.moveCard(cardId, targetColumnId, position, authentication.getName()));        
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteCard(
            @PathVariable Long cardId,
            Authentication authentication) {
        cardService.deleteCard(cardId, authentication.getName());
        return ResponseEntity.ok().build();
    }
}
