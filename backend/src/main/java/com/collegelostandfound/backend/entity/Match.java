package com.collegelostandfound.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "matches",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_matches_lost_found", columnNames = {"lost_item_id", "found_item_id"})
    }
)
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lost_item_id", nullable = false)
    private LostItem lostItem;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "found_item_id", nullable = false)
    private FoundItem foundItem;

    @Column(name = "match_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal matchScore;

    @Column(name = "match_status", nullable = false, length = 50)
    private String matchStatus;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public Match() {
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.matchStatus == null) {
            this.matchStatus = "POSSIBLE";
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LostItem getLostItem() {
        return lostItem;
    }

    public void setLostItem(LostItem lostItem) {
        this.lostItem = lostItem;
    }

    public FoundItem getFoundItem() {
        return foundItem;
    }

    public void setFoundItem(FoundItem foundItem) {
        this.foundItem = foundItem;
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
