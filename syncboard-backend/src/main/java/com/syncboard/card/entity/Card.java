package com.syncboard.card.entity;

import com.syncboard.board.entity.BoardColumn;
import com.syncboard.common.BaseEntity;
import com.syncboard.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;


@Entity
@Table(name = "card", indexes = {
        @Index(name = "idx_card_column_position", columnList = "column_id, position"),
        @Index(name = "idx_card_assignee", columnList = "assignee_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Card extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "column_id", nullable = false)
    private BoardColumn column;

    @Column(nullable = false)
    private String title;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private CardPriority priority;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id")
    private User assignee;

    @Column(columnDefinition = "DATETIME(6)")
    private LocalDateTime deadline;

    @Column(nullable = false)
    private Double position;

    @Version
    private Long version;

    @org.hibernate.annotations.Formula("(SELECT COUNT(*) FROM comment c WHERE c.card_id = id)")
    private Integer commentCount;

    @OneToMany(mappedBy = "card", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private java.util.List<com.syncboard.comment.entity.Comment> comments = new java.util.ArrayList<>();
}
