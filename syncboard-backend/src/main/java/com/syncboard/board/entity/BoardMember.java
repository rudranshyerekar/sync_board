package com.syncboard.board.entity;

import com.syncboard.common.BaseEntity;
import com.syncboard.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "board_member", indexes = {
        @Index(name = "idx_board_member_board_user", columnList = "board_id, user_id", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardMember extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id", nullable = false)
    private Board board;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
