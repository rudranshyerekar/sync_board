package com.syncboard.board.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import com.syncboard.board.entity.Board;


@Repository
public interface BoardRepository extends JpaRepository<Board, Long> {
    List<Board> findByWorkspaceIdOrderByPositionAsc(Long workspaceId);
}
