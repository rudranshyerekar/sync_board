package com.syncboard.activity.entity;

import com.syncboard.common.BaseEntity;
import com.syncboard.user.entity.User;
import com.syncboard.workspace.entity.Workspace;
import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "activity", indexes = {
        @Index(name = "idx_activity_workspace_created_at", columnList = "workspace_id, created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Activity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String action;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

}
