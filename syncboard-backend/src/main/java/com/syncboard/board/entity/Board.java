package com.syncboard.board.entity;

import com.syncboard.common.BaseEntity;
import com.syncboard.workspace.entity.Workspace;
import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "board", indexes = {
        @Index(name = "idx_board_workspace_position", columnList = "workspace_id, position")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Board extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private Double position;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BoardPrivacy privacy = BoardPrivacy.WORKSPACE;

    @OneToMany(mappedBy = "board", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private java.util.List<BoardColumn> columns = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "board", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private java.util.List<BoardMember> members = new java.util.ArrayList<>();
}
