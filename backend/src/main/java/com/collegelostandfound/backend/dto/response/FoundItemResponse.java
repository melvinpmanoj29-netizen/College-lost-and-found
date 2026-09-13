package com.collegelostandfound.backend.dto.response;

import com.collegelostandfound.backend.entity.FoundItem;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class FoundItemResponse {

    private Long id;
    private Long userId;
    private String itemName;
    private String imageUrl;
    private String description;
    private String category;
    private String color;
    private LocalDateTime foundDateTime;
    private String foundLocation;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public FoundItemResponse() {
    }

    public static FoundItemResponse fromEntity(FoundItem item) {
        if (item == null) {
            return null;
        }
        FoundItemResponse response = new FoundItemResponse();
        response.setId(item.getId());
        response.setUserId(item.getUser() != null ? item.getUser().getId() : null);
        response.setItemName(item.getItemName());
        response.setImageUrl(item.getImageUrl());
        response.setDescription(item.getDescription());
        response.setCategory(item.getCategory());
        response.setColor(item.getColor());
        response.setFoundDateTime(item.getFoundDateTime());
        response.setFoundLocation(item.getFoundLocation());
        response.setLatitude(item.getLatitude());
        response.setLongitude(item.getLongitude());
        response.setStatus(item.getStatus());
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

    public LocalDateTime getFoundDateTime() {
        return foundDateTime;
    }

    public void setFoundDateTime(LocalDateTime foundDateTime) {
        this.foundDateTime = foundDateTime;
    }

    public String getFoundLocation() {
        return foundLocation;
    }

    public void setFoundLocation(String foundLocation) {
        this.foundLocation = foundLocation;
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
