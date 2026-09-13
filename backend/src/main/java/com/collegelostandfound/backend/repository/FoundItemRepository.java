package com.collegelostandfound.backend.repository;

import com.collegelostandfound.backend.entity.FoundItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoundItemRepository extends JpaRepository<FoundItem, Long> {

    List<FoundItem> findAllByOrderByCreatedAtDesc();

    List<FoundItem> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<FoundItem> findByStatus(String status);
}
