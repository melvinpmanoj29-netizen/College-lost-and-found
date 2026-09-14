package com.collegelostandfound.backend.dto.response;

import java.util.ArrayList;
import java.util.List;

public class SearchResponse {

    private List<LostItemResponse> lostItems = new ArrayList<>();
    private List<FoundItemResponse> foundItems = new ArrayList<>();

    public SearchResponse() {
    }

    public SearchResponse(List<LostItemResponse> lostItems, List<FoundItemResponse> foundItems) {
        this.lostItems = lostItems != null ? lostItems : new ArrayList<>();
        this.foundItems = foundItems != null ? foundItems : new ArrayList<>();
    }

    public List<LostItemResponse> getLostItems() {
        return lostItems;
    }

    public void setLostItems(List<LostItemResponse> lostItems) {
        this.lostItems = lostItems;
    }

    public List<FoundItemResponse> getFoundItems() {
        return foundItems;
    }

    public void setFoundItems(List<FoundItemResponse> foundItems) {
        this.foundItems = foundItems;
    }
}
