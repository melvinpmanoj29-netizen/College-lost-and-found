package com.collegelostandfound.backend.dto.response;

import com.collegelostandfound.backend.entity.Match;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class MatchResponse {

    private Long id;
    private Long lostItemId;
    private Long foundItemId;
    private BigDecimal matchScore;
    private String matchStatus;
    private LocalDateTime createdAt;

    public MatchResponse() {
    }

    public static MatchResponse fromEntity(Match match) {
        if (match == null) {
            return null;
        }
        MatchResponse response = new MatchResponse();
        response.setId(match.getId());
        response.setLostItemId(match.getLostItem() != null ? match.getLostItem().getId() : null);
        response.setFoundItemId(match.getFoundItem() != null ? match.getFoundItem().getId() : null);
        response.setMatchScore(match.getMatchScore());
        response.setMatchStatus(match.getMatchStatus());
        response.setCreatedAt(match.getCreatedAt());
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getLostItemId() {
        return lostItemId;
    }

    public void setLostItemId(Long lostItemId) {
        this.lostItemId = lostItemId;
    }

    public Long getFoundItemId() {
        return foundItemId;
    }

    public void setFoundItemId(Long foundItemId) {
        this.foundItemId = foundItemId;
    }

    public BigDecimal getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(BigDecimal matchScore) {
        this.matchScore = matchScore;
    }

    public String getMatchStatus() {
        return matchStatus;
    }

    public void setMatchStatus(String matchStatus) {
        this.matchStatus = matchStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
