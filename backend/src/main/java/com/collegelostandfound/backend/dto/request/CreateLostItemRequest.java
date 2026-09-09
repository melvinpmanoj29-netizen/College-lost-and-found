package com.collegelostandfound.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CreateLostItemRequest {

    @NotBlank(message = "Item name is required")
    @Size(max = 150, message = "Item name must not exceed 150 characters")
    private String itemName;

    @Size(max = 500, message = "Image URL must not exceed 500 characters")
    private String imageUrl;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Category is required")
    @Size(max = 100, message = "Category must not exceed 100 characters")
    private String category;

    @Size(max = 50, message = "Color must not exceed 50 characters")
    private String color;

    @NotNull(message = "Lost date and time is required")
    private LocalDateTime lostDateTime;

    @NotBlank(message = "Last seen location is required")
    @Size(max = 255, message = "Last seen location must not exceed 255 characters")
    private String lastSeenLocation;

    private Boolean isUrgent;

    private LocalDateTime expiryDate;

    private BigDecimal latitude;

    private BigDecimal longitude;

    public CreateLostItemRequest() {
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
}
