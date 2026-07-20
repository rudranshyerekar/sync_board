package com.syncboard.comment.entity;

import com.syncboard.card.entity.Card;
import com.syncboard.common.BaseEntity;
import com.syncboard.user.entity.User;
import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "comment", indexes = {
        @Index(name = "idx_comment_card_created_at", columnList = "card_id, created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_id", nullable = false)
    private Card card;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Lob
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

}
