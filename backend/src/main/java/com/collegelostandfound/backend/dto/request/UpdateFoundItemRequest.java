package com.collegelostandfound.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class UpdateFoundItemRequest {

    @NotBlank(message = "Item name is required")
    @Size(max = 150)
    private String itemName;

    @Size(max = 500)
    private String imageUrl;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Category is required")
    @Size(max = 100)
    private String category;

    @Size(max = 50)
    private String color;

    @NotNull(message = "Found date and time is required")
    private LocalDateTime foundDateTime;

    @NotBlank(message = "Found location is required")
    @Size(max = 255)
    private String foundLocation;

    private BigDecimal latitude;
    private BigDecimal longitude;

    public UpdateFoundItemRequest() {
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
}
