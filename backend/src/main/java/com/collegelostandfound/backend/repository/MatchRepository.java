package com.collegelostandfound.backend.repository;

import com.collegelostandfound.backend.entity.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {

    List<Match> findByLostItemIdOrderByMatchScoreDesc(Long lostItemId);

    List<Match> findByFoundItemIdOrderByMatchScoreDesc(Long foundItemId);

    Optional<Match> findByLostItemIdAndFoundItemId(Long lostItemId, Long foundItemId);
}
