package com.syncboard.activity.repository;

import com.syncboard.activity.entity.Activity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {

    Page<Activity> findByWorkspaceIdOrderByCreatedAtDesc(Long workspaceId, Pageable pageable);

}
