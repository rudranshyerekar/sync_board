package com.syncboard.board.repository;

import com.syncboard.board.entity.BoardMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import java.util.Optional;

@Repository
public interface BoardMemberRepository extends JpaRepository<BoardMember, Long> {
    boolean existsByBoardIdAndUserId(Long boardId, Long userId);
    List<BoardMember> findByBoardId(Long boardId);
    Optional<BoardMember> findByBoardIdAndUserId(Long boardId, Long userId);
}
