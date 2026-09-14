package com.collegelostandfound.backend.dto.response;

import java.math.BigDecimal;

public class MapItemResponse {

    private Long id;
    private String type; // "LOST" or "FOUND"
    private String itemName;
    private String location;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Boolean isUrgent;

    public MapItemResponse() {
    }

    public MapItemResponse(Long id, String type, String itemName, String location, BigDecimal latitude, BigDecimal longitude, Boolean isUrgent) {
        this.id = id;
        this.type = type;
        this.itemName = itemName;
        this.location = location;
        this.latitude = latitude;
        this.longitude = longitude;
        this.isUrgent = isUrgent != null ? isUrgent : false;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
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

    public Boolean getIsUrgent() {
        return isUrgent;
    }

    public void setIsUrgent(Boolean isUrgent) {
        this.isUrgent = isUrgent;
    }
}
