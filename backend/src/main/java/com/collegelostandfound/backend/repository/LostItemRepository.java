package com.collegelostandfound.backend.repository;

import com.collegelostandfound.backend.entity.LostItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Repository
public interface LostItemRepository extends JpaRepository<LostItem, Long>, JpaSpecificationExecutor<LostItem> {

    List<LostItem> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<LostItem> findAllByOrderByCreatedAtDesc();

    List<LostItem> findByStatusNotInOrderByCreatedAtDesc(Collection<String> statuses);

    List<LostItem> findByExpiryDateBeforeAndStatusAndIsArchivedFalse(LocalDateTime dateTime, String status);

    List<LostItem> findByStatusNot(String status);
}
