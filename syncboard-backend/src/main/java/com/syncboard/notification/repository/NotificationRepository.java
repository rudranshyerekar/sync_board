package com.syncboard.notification.repository;

import com.syncboard.notification.entity.Notification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientEmailOrderByCreatedAtDesc(String email, Pageable pageable);

    long countByRecipientEmailAndReadFalse(String email);

    List<Notification> findByRecipientEmailAndReadFalse(String email);
}
