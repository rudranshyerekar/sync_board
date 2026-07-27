package com.syncboard.card.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import com.syncboard.card.entity.Card;


@Repository
public interface CardRepository extends JpaRepository<Card, Long> {
    List<Card> findByColumnIdOrderByPositionAsc(Long columnId);

    /**
     * Fetch workspaceId directly via JPQL — avoids navigating lazy proxies
     * (Card -> BoardColumn -> Board -> Workspace).
     */
    @Query("SELECT c.column.board.workspace.id FROM Card c WHERE c.id = :cardId")
    Optional<Long> findWorkspaceIdByCardId(@Param("cardId") Long cardId);
}

