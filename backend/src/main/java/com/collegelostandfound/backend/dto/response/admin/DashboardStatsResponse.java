package com.collegelostandfound.backend.dto.response.admin;

import java.util.List;

public class DashboardStatsResponse {

    private long totalLostItems;
    private long totalFoundItems;
    private long itemsReturned;
    private long pendingClaims;
    private List<LocationStatResponse> mostCommonLocations;

    public DashboardStatsResponse() {
    }

    public DashboardStatsResponse(long totalLostItems, long totalFoundItems, long itemsReturned, long pendingClaims, List<LocationStatResponse> mostCommonLocations) {
        this.totalLostItems = totalLostItems;
        this.totalFoundItems = totalFoundItems;
        this.itemsReturned = itemsReturned;
        this.pendingClaims = pendingClaims;
        this.mostCommonLocations = mostCommonLocations;
    }

    public long getTotalLostItems() {
        return totalLostItems;
    }

    public void setTotalLostItems(long totalLostItems) {
        this.totalLostItems = totalLostItems;
    }

    public long getTotalFoundItems() {
        return totalFoundItems;
    }

    public void setTotalFoundItems(long totalFoundItems) {
        this.totalFoundItems = totalFoundItems;
    }

    public long getItemsReturned() {
        return itemsReturned;
    }

    public void setItemsReturned(long itemsReturned) {
        this.itemsReturned = itemsReturned;
    }

    public long getPendingClaims() {
        return pendingClaims;
    }

    public void setPendingClaims(long pendingClaims) {
        this.pendingClaims = pendingClaims;
    }

    public List<LocationStatResponse> getMostCommonLocations() {
        return mostCommonLocations;
    }

    public void setMostCommonLocations(List<LocationStatResponse> mostCommonLocations) {
        this.mostCommonLocations = mostCommonLocations;
    }
}
