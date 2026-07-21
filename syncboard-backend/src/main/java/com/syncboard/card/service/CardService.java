package com.syncboard.card.service;

import com.syncboard.board.entity.BoardColumn;
import com.syncboard.board.repository.BoardColumnRepository;
import com.syncboard.common.exception.BadRequestException;
import com.syncboard.common.exception.ResourceNotFoundException;
import com.syncboard.user.entity.User;
import com.syncboard.user.repository.UserRepository;
import com.syncboard.workspace.repository.WorkspaceMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import com.syncboard.card.entity.Card;
import com.syncboard.card.entity.CardPriority;
import com.syncboard.card.repository.CardRepository;
import com.syncboard.card.dto.CardRequest;
import com.syncboard.card.dto.CardResponse;


@Service
@RequiredArgsConstructor
public class CardService {

    private final CardRepository cardRepository;
    private final BoardColumnRepository boardColumnRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;

    @Transactional
    public CardResponse createCard(Long columnId, CardRequest request, String currentUserEmail) {
        BoardColumn column = boardColumnRepository.findById(columnId)
                .orElseThrow(() -> new ResourceNotFoundException("Column not found"));
        User user = userRepository.findByEmail(currentUserEmail).orElseThrow();
        Long workspaceId = column.getBoard().getWorkspace().getId();

        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, user.getId())) {
            throw new BadRequestException("Not a member of this workspace");
        }
        
        User assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = userRepository.findById(request.getAssigneeId())
                .orElseThrow(() -> new ResourceNotFoundException("Assignee not found"));
        }

        Card card = Card.builder()
                .column(column)
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority() != null ? request.getPriority() : CardPriority.MEDIUM)
                .assignee(assignee)
                .deadline(request.getDeadline())
                .position(request.getPosition() != null ? request.getPosition() : computeNextPosition(columnId))
                .build();

        return mapToResponse(cardRepository.save(card));
    }

    public List<CardResponse> getCards(Long columnId, String currentUserEmail) {
        BoardColumn column = boardColumnRepository.findById(columnId).orElseThrow();
        User user = userRepository.findByEmail(currentUserEmail).orElseThrow();
        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(column.getBoard().getWorkspace().getId(), user.getId())) {
            throw new BadRequestException("Not a member of this workspace");
        }

        return cardRepository.findByColumnIdOrderByPositionAsc(columnId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CardResponse updateCard(Long cardId, CardRequest request, String currentUserEmail) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found"));
        User user = userRepository.findByEmail(currentUserEmail).orElseThrow();
        Long workspaceId = card.getColumn().getBoard().getWorkspace().getId();

        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, user.getId())) {
            throw new BadRequestException("Not a member of this workspace");
        }

        // Entity version check for optimistic locking
        if (request.getVersion() != null && !request.getVersion().equals(card.getVersion())) {
            throw new org.springframework.orm.ObjectOptimisticLockingFailureException(Card.class, "Stale record");
        }

        card.setTitle(request.getTitle());
        card.setDescription(request.getDescription());
        if (request.getPriority() != null) {
            card.setPriority(request.getPriority());
        }
        if (request.getPosition() != null) {
            card.setPosition(request.getPosition());
        }
        if (request.getDeadline() != null) {
            card.setDeadline(request.getDeadline());
        }
        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId()).orElseThrow();
            card.setAssignee(assignee);
        } else {
            card.setAssignee(null); // Clear assignee if explicitly null
        }

        return mapToResponse(cardRepository.save(card));
    }

    @Transactional
    public void deleteCard(Long cardId, String currentUserEmail) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found"));
        User user = userRepository.findByEmail(currentUserEmail).orElseThrow();
        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(card.getColumn().getBoard().getWorkspace().getId(), user.getId())) {
            throw new BadRequestException("Not a member of this workspace");
        }

        cardRepository.delete(card);
    }
    
    // For drag-and-drop between columns
    @Transactional
    public CardResponse moveCard(Long cardId, Long targetColumnId, Double targetPosition, String currentUserEmail) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found"));
        User user = userRepository.findByEmail(currentUserEmail).orElseThrow();
        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(card.getColumn().getBoard().getWorkspace().getId(), user.getId())) {
            throw new BadRequestException("Not a member of this workspace");
        }
        
        BoardColumn targetColumn = boardColumnRepository.findById(targetColumnId).orElseThrow();
        card.setColumn(targetColumn);
        card.setPosition(targetPosition);
        
        return mapToResponse(cardRepository.save(card));
    }

    private Double computeNextPosition(Long columnId) {
        List<Card> cards = cardRepository.findByColumnIdOrderByPositionAsc(columnId);
        if (cards.isEmpty()) return 1000.0;
        return cards.get(cards.size() - 1).getPosition() + 1000.0;
    }

    private CardResponse mapToResponse(Card card) {
        com.syncboard.user.dto.UserResponse assigneeResponse = null;
        if (card.getAssignee() != null) {
            assigneeResponse = com.syncboard.user.dto.UserResponse.builder()
                    .id(card.getAssignee().getId())
                    .name(card.getAssignee().getName())
                    .email(card.getAssignee().getEmail())
                    .avatarUrl(card.getAssignee().getAvatarUrl())
                    .presenceStatus(card.getAssignee().getPresenceStatus())
                    .build();
        }

        return CardResponse.builder()
                .id(card.getId())
                .columnId(card.getColumn().getId())
                .title(card.getTitle())
                .description(card.getDescription())
                .priority(card.getPriority())
                .assigneeId(card.getAssignee() != null ? card.getAssignee().getId() : null)
                .assignee(assigneeResponse)
                .deadline(card.getDeadline())
                .position(card.getPosition())
                .version(card.getVersion())
                .createdAt(card.getCreatedAt())
                .updatedAt(card.getUpdatedAt())
                .build();
    }
}
