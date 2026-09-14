package com.collegelostandfound.backend.repository;

import com.collegelostandfound.backend.entity.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {

    List<Claim> findByClaimantIdOrderByCreatedAtDesc(Long claimantId);

    boolean existsByLostItemIdAndFoundItemIdAndClaimantId(Long lostItemId, Long foundItemId, Long claimantId);

    Optional<Claim> findByLostItemIdAndFoundItemIdAndClaimantId(Long lostItemId, Long foundItemId, Long claimantId);

    List<Claim> findByFoundItemId(Long foundItemId);
}
