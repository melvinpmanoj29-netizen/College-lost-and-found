package com.collegelostandfound.backend.repository;

import com.collegelostandfound.backend.entity.FoundItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface FoundItemRepository extends JpaRepository<FoundItem, Long>, JpaSpecificationExecutor<FoundItem> {

    List<FoundItem> findAllByOrderByCreatedAtDesc();

    List<FoundItem> findByStatusNotInOrderByCreatedAtDesc(Collection<String> statuses);

    List<FoundItem> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<FoundItem> findByStatus(String status);
}
