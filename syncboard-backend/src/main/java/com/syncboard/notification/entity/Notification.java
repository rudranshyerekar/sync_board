package com.syncboard.notification.entity;

import com.syncboard.common.BaseEntity;
import com.syncboard.user.entity.User;
import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "notification", indexes = {
        @Index(name = "idx_notification_recipient_unread", columnList = "recipient_id, is_read, created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @Lob
    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(name = "is_read", nullable = false)
    private boolean read;

    /**
     * The ID of the entity that triggered this notification (e.g. cardId).
     * Used by the frontend to deep-link to the relevant card.
     */
    @Column(name = "reference_id")
    private Long referenceId;

}
