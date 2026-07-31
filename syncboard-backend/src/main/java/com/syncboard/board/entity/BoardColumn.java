package com.syncboard.board.entity;

import com.syncboard.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "column_entity", indexes = {
        @Index(name = "idx_column_board_position", columnList = "board_id, position")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardColumn extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id", nullable = false)
    private Board board;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private Double position;

    @Column
    private String color;

    @Column(length = 1000)
    private String description;

    @OneToMany(mappedBy = "column", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private java.util.List<com.syncboard.card.entity.Card> cards = new java.util.ArrayList<>();
}
