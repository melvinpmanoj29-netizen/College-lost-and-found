package com.collegelostandfound.backend.dto.response.admin;

import java.time.LocalDateTime;
import java.util.List;

public class AdminItemHistoryDetailResponse {

    private Long claimId;
    private String itemName;
    private String category;
    private String status;
    private LocalDateTime resolvedAt;

    private UserSummary claimant;
    private UserSummary lostReporter;
    private UserSummary foundReporter;
    private UserSummary reviewer;

    private LostReportDetail lostReport;
    private FoundReportDetail foundReport;
    private ClaimDetail claimDetail;

    private List<TimelineEvent> timeline;

    public static class UserSummary {
        private Long id;
        private String name;
        private String email;
        private String rollNumber;
        private String className;
        private String role;

        public UserSummary() {}
        public UserSummary(Long id, String name, String email, String rollNumber, String className, String role) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.rollNumber = rollNumber;
            this.className = className;
            this.role = role;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getRollNumber() { return rollNumber; }
        public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }
        public String getClassName() { return className; }
        public void setClassName(String className) { this.className = className; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }

    public static class LostReportDetail {
        private Long id;
        private String itemName;
        private String description;
        private String category;
        private String color;
        private String location;
        private LocalDateTime lostDateTime;
        private String imageUrl;
        private String status;
        private LocalDateTime createdAt;

        public LostReportDetail() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getItemName() { return itemName; }
        public void setItemName(String itemName) { this.itemName = itemName; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getColor() { return color; }
        public void setColor(String color) { this.color = color; }
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        public LocalDateTime getLostDateTime() { return lostDateTime; }
        public void setLostDateTime(LocalDateTime lostDateTime) { this.lostDateTime = lostDateTime; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    public static class FoundReportDetail {
        private Long id;
        private String itemName;
        private String description;
        private String category;
        private String color;
        private String location;
        private LocalDateTime foundDateTime;
        private String imageUrl;
        private String status;
        private LocalDateTime createdAt;

        public FoundReportDetail() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getItemName() { return itemName; }
        public void setItemName(String itemName) { this.itemName = itemName; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getColor() { return color; }
        public void setColor(String color) { this.color = color; }
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        public LocalDateTime getFoundDateTime() { return foundDateTime; }
        public void setFoundDateTime(LocalDateTime foundDateTime) { this.foundDateTime = foundDateTime; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    public static class ClaimDetail {
        private Long id;
        private String verificationAnswer;
        private String status;
        private LocalDateTime createdAt;
        private LocalDateTime reviewedAt;

        public ClaimDetail() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getVerificationAnswer() { return verificationAnswer; }
        public void setVerificationAnswer(String verificationAnswer) { this.verificationAnswer = verificationAnswer; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public LocalDateTime getReviewedAt() { return reviewedAt; }
        public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
    }

    public static class TimelineEvent {
        private String title;
        private String description;
        private LocalDateTime timestamp;
        private String actorName;
        private String actorRole;
        private String type; // e.g. "LOST_REPORT", "FOUND_REPORT", "CLAIM_SUBMITTED", "CLAIM_APPROVED", "RESOLVED"

        public TimelineEvent() {}

        public TimelineEvent(String title, String description, LocalDateTime timestamp, String actorName, String actorRole, String type) {
            this.title = title;
            this.description = description;
            this.timestamp = timestamp;
            this.actorName = actorName;
            this.actorRole = actorRole;
            this.type = type;
        }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
        public String getActorName() { return actorName; }
        public void setActorName(String actorName) { this.actorName = actorName; }
        public String getActorRole() { return actorRole; }
        public void setActorRole(String actorRole) { this.actorRole = actorRole; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
    }

    public AdminItemHistoryDetailResponse() {}

    public Long getClaimId() { return claimId; }
    public void setClaimId(Long claimId) { this.claimId = claimId; }
    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }

    public UserSummary getClaimant() { return claimant; }
    public void setClaimant(UserSummary claimant) { this.claimant = claimant; }
    public UserSummary getLostReporter() { return lostReporter; }
    public void setLostReporter(UserSummary lostReporter) { this.lostReporter = lostReporter; }
    public UserSummary getFoundReporter() { return foundReporter; }
    public void setFoundReporter(UserSummary foundReporter) { this.foundReporter = foundReporter; }
    public UserSummary getReviewer() { return reviewer; }
    public void setReviewer(UserSummary reviewer) { this.reviewer = reviewer; }

    public LostReportDetail getLostReport() { return lostReport; }
    public void setLostReport(LostReportDetail lostReport) { this.lostReport = lostReport; }
    public FoundReportDetail getFoundReport() { return foundReport; }
    public void setFoundReport(FoundReportDetail foundReport) { this.foundReport = foundReport; }
    public ClaimDetail getClaimDetail() { return claimDetail; }
    public void setClaimDetail(ClaimDetail claimDetail) { this.claimDetail = claimDetail; }

    public List<TimelineEvent> getTimeline() { return timeline; }
    public void setTimeline(List<TimelineEvent> timeline) { this.timeline = timeline; }
}
