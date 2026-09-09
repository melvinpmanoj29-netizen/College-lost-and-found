package com.collegelostandfound.backend.dto.response;

import com.collegelostandfound.backend.entity.LostItem;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class LostItemResponse {

    private Long id;
    private Long userId;
    private String itemName;
    private String imageUrl;
    private String description;
    private String category;
    private String color;
    private LocalDateTime lostDateTime;
    private String lastSeenLocation;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String status;
    private Boolean isUrgent;
    private LocalDateTime expiryDate;
    private Boolean isArchived;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public LostItemResponse() {
    }

    public static LostItemResponse from(LostItem item) {
        LostItemResponse response = new LostItemResponse();
        response.setId(item.getId());
        response.setUserId(item.getUser() != null ? item.getUser().getId() : null);
        response.setItemName(item.getItemName());
        response.setImageUrl(item.getImageUrl());
        response.setDescription(item.getDescription());
        response.setCategory(item.getCategory());
        response.setColor(item.getColor());
        response.setLostDateTime(item.getLostDateTime());
        response.setLastSeenLocation(item.getLastSeenLocation());
        response.setLatitude(item.getLatitude());
        response.setLongitude(item.getLongitude());
        response.setStatus(item.getStatus());
        response.setIsUrgent(item.getIsUrgent());
        response.setExpiryDate(item.getExpiryDate());
        response.setIsArchived(item.getIsArchived());
        response.setCreatedAt(item.getCreatedAt());
        response.setUpdatedAt(item.getUpdatedAt());
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public LocalDateTime getLostDateTime() {
        return lostDateTime;
    }

    public void setLostDateTime(LocalDateTime lostDateTime) {
        this.lostDateTime = lostDateTime;
    }

    public String getLastSeenLocation() {
        return lastSeenLocation;
    }

    public void setLastSeenLocation(String lastSeenLocation) {
        this.lastSeenLocation = lastSeenLocation;
    }

    public BigDecimal getLatitude() {
        return latitude;
    }

    public void setLatitude(BigDecimal latitude) {
        this.latitude = latitude;
    }

    public BigDecimal getLongitude() {
        return longitude;
    }

    public void setLongitude(BigDecimal longitude) {
        this.longitude = longitude;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getIsUrgent() {
        return isUrgent;
    }

    public void setIsUrgent(Boolean isUrgent) {
        this.isUrgent = isUrgent;
    }

    public LocalDateTime getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDateTime expiryDate) {
        this.expiryDate = expiryDate;
    }

    public Boolean getIsArchived() {
        return isArchived;
    }

    public void setIsArchived(Boolean isArchived) {
        this.isArchived = isArchived;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
