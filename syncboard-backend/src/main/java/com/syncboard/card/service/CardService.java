package com.syncboard.card.service;

import com.syncboard.board.entity.BoardColumn;
import com.syncboard.board.entity.BoardPrivacy;
import com.syncboard.board.repository.BoardColumnRepository;
import com.syncboard.board.repository.BoardMemberRepository;
import com.syncboard.common.exception.BadRequestException;
import com.syncboard.common.exception.ResourceNotFoundException;
import com.syncboard.notification.entity.NotificationType;
import com.syncboard.notification.service.NotificationService;
import com.syncboard.user.entity.User;
import com.syncboard.user.repository.UserRepository;
import com.syncboard.workspace.repository.WorkspaceMemberRepository;
import com.syncboard.activity.service.ActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
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
    private final BoardMemberRepository boardMemberRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;
    private final ActivityService activityService;

    // Setter injection with @Lazy to break the circular dependency with NotificationService
    private NotificationService notificationService;

    @Autowired
    public void setNotificationService(@Lazy NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /** Look up workspaceId via single JPQL query — avoids navigating lazy proxies */
    private Long getWorkspaceId(Long cardId) {
        return cardRepository.findWorkspaceIdByCardId(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found"));
    }

    @Transactional
    public CardResponse createCard(Long columnId, CardRequest request, String currentUserEmail) {
        BoardColumn column = boardColumnRepository.findById(columnId)
                .orElseThrow(() -> new ResourceNotFoundException("Column not found"));
        User user = userRepository.findByEmail(currentUserEmail).orElseThrow();
        Long workspaceId = column.getBoard().getWorkspace().getId();

        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, user.getId())) {
            throw new BadRequestException("Not a member of this workspace");
        }
        if (column.getBoard().getPrivacy() == BoardPrivacy.PRIVATE && !boardMemberRepository.existsByBoardIdAndUserId(column.getBoard().getId(), user.getId())) {
            throw new BadRequestException("Not a member of this private board");
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

        card = cardRepository.save(card);
        activityService.logActivity(column.getBoard().getWorkspace(), user, "Created card", "Created card \"" + card.getTitle() + "\" in column \"" + column.getTitle() + "\"");
        return mapToResponse(card);
    }

    public List<CardResponse> getCards(Long columnId, String currentUserEmail) {
        BoardColumn column = boardColumnRepository.findById(columnId).orElseThrow();
        User user = userRepository.findByEmail(currentUserEmail).orElseThrow();
        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(column.getBoard().getWorkspace().getId(), user.getId())) {
            throw new BadRequestException("Not a member of this workspace");
        }
        if (column.getBoard().getPrivacy() == BoardPrivacy.PRIVATE && !boardMemberRepository.existsByBoardIdAndUserId(column.getBoard().getId(), user.getId())) {
            throw new BadRequestException("Not a member of this private board");
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
        Long workspaceId = getWorkspaceId(cardId);

        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, user.getId())) {
            throw new BadRequestException("Not a member of this workspace");
        }
        if (card.getColumn().getBoard().getPrivacy() == BoardPrivacy.PRIVATE && !boardMemberRepository.existsByBoardIdAndUserId(card.getColumn().getBoard().getId(), user.getId())) {
            throw new BadRequestException("Not a member of this private board");
        }

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

        User previousAssignee = card.getAssignee();
        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId()).orElseThrow();
            card.setAssignee(assignee);
            boolean assigneeChanged = previousAssignee == null ||
                    !Objects.equals(previousAssignee.getId(), assignee.getId());
            if (assigneeChanged && !assignee.getEmail().equals(user.getEmail())) {
                String msg = String.format("%s assigned you to card \"%s\"",
                        user.getName(), card.getTitle());
                notificationService.createAndDeliver(assignee, NotificationType.ASSIGNMENT, msg, card.getId(), card.getColumn().getBoard().getId());
            }
        } else {
            card.setAssignee(null);
        }

        card = cardRepository.save(card);
        activityService.logActivity(card.getColumn().getBoard().getWorkspace(), user, "Updated card", "Updated details for card \"" + card.getTitle() + "\"");
        return mapToResponse(card);
    }

    @Transactional
    public void deleteCard(Long cardId, String currentUserEmail) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found"));
        User user = userRepository.findByEmail(currentUserEmail).orElseThrow();
        Long workspaceId = getWorkspaceId(cardId);
        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, user.getId())) {
            throw new BadRequestException("Not a member of this workspace");
        }
        if (card.getColumn().getBoard().getPrivacy() == BoardPrivacy.PRIVATE && !boardMemberRepository.existsByBoardIdAndUserId(card.getColumn().getBoard().getId(), user.getId())) {
            throw new BadRequestException("Not a member of this private board");
        }
        cardRepository.delete(card);
        activityService.logActivity(card.getColumn().getBoard().getWorkspace(), user, "Deleted card", "Deleted card \"" + card.getTitle() + "\"");
    }

    @Transactional
    public CardResponse moveCard(Long cardId, Long targetColumnId, Double targetPosition, String currentUserEmail) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found"));
        User user = userRepository.findByEmail(currentUserEmail).orElseThrow();
        Long workspaceId = getWorkspaceId(cardId);
        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, user.getId())) {
            throw new BadRequestException("Not a member of this workspace");
        }
        if (card.getColumn().getBoard().getPrivacy() == BoardPrivacy.PRIVATE && !boardMemberRepository.existsByBoardIdAndUserId(card.getColumn().getBoard().getId(), user.getId())) {
            throw new BadRequestException("Not a member of this private board");
        }

        BoardColumn targetColumn = boardColumnRepository.findById(targetColumnId).orElseThrow();
        if (targetColumn.getBoard().getPrivacy() == BoardPrivacy.PRIVATE && !boardMemberRepository.existsByBoardIdAndUserId(targetColumn.getBoard().getId(), user.getId())) {
            throw new BadRequestException("Not a member of target private board");
        }
        card.setColumn(targetColumn);
        card.setPosition(targetPosition);
// Completion notification
String targetTitle = targetColumn.getTitle().toLowerCase();
if (targetTitle.contains("done") || targetTitle.contains("complet")) {
    if (card.getAssignee() != null &&
            !card.getAssignee().getEmail().equals(user.getEmail())) {

        String msg = String.format("%s moved \"%s\" to %s",
                user.getName(), card.getTitle(), targetColumn.getTitle());

        notificationService.createAndDeliver(
                card.getAssignee(),
                NotificationType.COMPLETION,
                msg,
                card.getId(),
                targetColumn.getBoard().getId()
        );
    }
}

card = cardRepository.save(card);

activityService.logActivity(
        targetColumn.getBoard().getWorkspace(),
        user,
        "Moved card",
        "Moved card \"" + card.getTitle() +
        "\" to column \"" + targetColumn.getTitle() + "\""
);

return mapToResponse(card);
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
                .commentCount(card.getCommentCount() != null ? card.getCommentCount() : 0)
                .createdAt(card.getCreatedAt())
                .updatedAt(card.getUpdatedAt())
                .build();
    }
}
