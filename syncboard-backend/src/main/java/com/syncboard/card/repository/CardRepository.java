package com.syncboard.card.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import com.syncboard.card.entity.Card;


@Repository
public interface CardRepository extends JpaRepository<Card, Long> {
    List<Card> findByColumnIdOrderByPositionAsc(Long columnId);
}
