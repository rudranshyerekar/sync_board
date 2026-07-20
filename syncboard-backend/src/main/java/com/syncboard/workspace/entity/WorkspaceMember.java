package com.syncboard.workspace.entity;

import com.syncboard.common.BaseEntity;
import com.syncboard.common.Role;
import com.syncboard.user.entity.User;
import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "workspace_member", indexes = {
        @Index(name = "idx_workspace_member_user_workspace", columnList = "user_id, workspace_id", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkspaceMember extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
}
