package com.syncboard.notification.service;

import com.syncboard.notification.dto.NotificationResponse;
import com.syncboard.notification.entity.Notification;
import com.syncboard.notification.entity.NotificationType;
import com.syncboard.notification.repository.NotificationRepository;
import com.syncboard.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Persist a notification and deliver it live to the recipient if connected.
     * Called by other services (CommentService, CardService) — never by a direct HTTP request.
     */
    @Transactional
    public void createAndDeliver(User recipient, NotificationType type, String message, Long referenceId, Long boardId) {
        Notification notification = Notification.builder()
                .recipient(recipient)
                .type(type)
                .message(message)
                .referenceId(referenceId)
                .boardId(boardId)
                .read(false)
                .build();

        Notification saved = notificationRepository.save(notification);

        // Deliver live to the connected user via their personal queue
        NotificationResponse response = mapToResponse(saved);
        try {
            messagingTemplate.convertAndSendToUser(
                    recipient.getEmail(),
                    "/queue/notifications",
                    response
            );
        } catch (Exception ex) {
            // User may not be connected — notification is persisted and will be fetched on next login
            log.debug("User {} is not connected; notification persisted for later delivery.", recipient.getEmail());
        }
    }

    public List<NotificationResponse> getNotifications(String email) {
        return notificationRepository
                .findByRecipientEmailOrderByCreatedAtDesc(email, PageRequest.of(0, 20))
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Long notificationId, String email) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getRecipient().getEmail().equals(email)) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        });
    }

    @Transactional
    public void markAllAsRead(String email) {
        List<Notification> unread = notificationRepository.findByRecipientEmailAndReadFalse(email);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    public long getUnreadCount(String email) {
        return notificationRepository.countByRecipientEmailAndReadFalse(email);
    }

    private NotificationResponse mapToResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .message(n.getMessage())
                .type(n.getType())
                .read(n.isRead())
                .referenceId(n.getReferenceId())
                .boardId(n.getBoardId())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
