package com.syncboard.comment.service;

import com.syncboard.card.entity.Card;
import com.syncboard.card.repository.CardRepository;
import com.syncboard.comment.dto.CommentResponse;
import com.syncboard.comment.entity.Comment;
import com.syncboard.comment.repository.CommentRepository;
import com.syncboard.common.exception.BadRequestException;
import com.syncboard.common.exception.ResourceNotFoundException;
import com.syncboard.notification.entity.NotificationType;
import com.syncboard.notification.service.NotificationService;
import com.syncboard.user.dto.UserResponse;
import com.syncboard.user.entity.User;
import com.syncboard.user.repository.UserRepository;
import com.syncboard.workspace.repository.WorkspaceMemberRepository;
import com.syncboard.activity.service.ActivityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentService {

    private final CommentRepository commentRepository;
    private final CardRepository cardRepository;
    private final UserRepository userRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;
    private final ActivityService activityService;

    // Matches @emailPrefix — e.g. "@alice" in a comment links to alice@...
    private static final Pattern MENTION_PATTERN = Pattern.compile("@(\\w+)");

    /** Single JPQL query to get workspaceId — avoids navigating lazy proxies */
    private Long getWorkspaceId(Long cardId) {
        return cardRepository.findWorkspaceIdByCardId(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found"));
    }

    @Transactional
    public CommentResponse postComment(Long cardId, String content, String authorEmail) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found"));

        User author = userRepository.findByEmail(authorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Long workspaceId = getWorkspaceId(cardId);
        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, author.getId())) {
            throw new BadRequestException("Not a member of this workspace");
        }

        Comment comment = Comment.builder()
                .card(card)
                .author(author)
                .content(content)
                .build();

        Comment saved = commentRepository.save(comment);
        CommentResponse response = mapToResponse(saved);

        // Broadcast new comment to all clients viewing this card
        Map<String, Object> event = new HashMap<>();
        event.put("type", "COMMENT_ADDED");
        event.put("payload", response);
        messagingTemplate.convertAndSend("/topic/card/" + cardId + "/comments", event);

        // Process @mentions and fire notifications
        processMentions(content, author, card, workspaceId, cardId);

        activityService.logActivity(card.getColumn().getBoard().getWorkspace(), author, "Added comment", "Commented on card \"" + card.getTitle() + "\"");

        return response;
    }

    public List<CommentResponse> getComments(Long cardId, String currentUserEmail) {
        cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found"));
        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Long workspaceId = getWorkspaceId(cardId);
        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, user.getId())) {
            throw new BadRequestException("Not a member of this workspace");
        }

        return commentRepository.findByCardIdOrderByCreatedAtAsc(cardId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteComment(Long commentId, String currentUserEmail) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        if (!comment.getAuthor().getEmail().equals(currentUserEmail)) {
            throw new BadRequestException("You can only delete your own comments");
        }

        Long cardId = comment.getCard().getId();
        activityService.logActivity(comment.getCard().getColumn().getBoard().getWorkspace(), comment.getAuthor(), "Deleted comment", "Deleted a comment on card \"" + comment.getCard().getTitle() + "\"");
        commentRepository.delete(comment);

        // Broadcast deletion so live viewers remove the comment from UI
        Map<String, Object> event = new HashMap<>();
        event.put("type", "COMMENT_DELETED");
        Map<String, Object> payload = new HashMap<>();
        payload.put("commentId", commentId);
        payload.put("cardId", cardId);
        event.put("payload", payload);
        messagingTemplate.convertAndSend("/topic/card/" + cardId + "/comments", event);
    }

    /**
     * Parse @emailPrefix mentions and deliver notifications to matched workspace members.
     * E.g. "@alice" will match any workspace member whose email starts with "alice".
     */
    private void processMentions(String content, User author, Card card, Long workspaceId, Long cardId) {
        Matcher matcher = MENTION_PATTERN.matcher(content);
        while (matcher.find()) {
            String prefix = matcher.group(1).toLowerCase();
            userRepository.findByEmailStartingWithIgnoreCase(prefix).stream()
                    .filter(u -> !u.getId().equals(author.getId()))
                    .filter(u -> workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, u.getId()))
                    .findFirst()
                    .ifPresent(mentioned -> {
                        String msg = String.format("%s mentioned you in a comment on card \"%s\"",
                                author.getName(), card.getTitle());
                        notificationService.createAndDeliver(mentioned, NotificationType.MENTION, msg, cardId, card.getColumn().getBoard().getId());
                    });
        }
    }

    private CommentResponse mapToResponse(Comment comment) {
        UserResponse authorResponse = UserResponse.builder()
                .id(comment.getAuthor().getId())
                .name(comment.getAuthor().getName())
                .email(comment.getAuthor().getEmail())
                .avatarUrl(comment.getAuthor().getAvatarUrl())
                .presenceStatus(comment.getAuthor().getPresenceStatus())
                .build();

        return CommentResponse.builder()
                .id(comment.getId())
                .cardId(comment.getCard().getId())
                .content(comment.getContent())
                .author(authorResponse)
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
