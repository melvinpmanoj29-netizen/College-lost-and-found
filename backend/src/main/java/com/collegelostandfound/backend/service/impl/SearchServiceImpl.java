package com.collegelostandfound.backend.service.impl;

import com.collegelostandfound.backend.dto.response.FoundItemResponse;
import com.collegelostandfound.backend.dto.response.LostItemResponse;
import com.collegelostandfound.backend.dto.response.SearchResponse;
import com.collegelostandfound.backend.entity.FoundItem;
import com.collegelostandfound.backend.entity.LostItem;
import com.collegelostandfound.backend.repository.FoundItemRepository;
import com.collegelostandfound.backend.repository.LostItemRepository;
import com.collegelostandfound.backend.service.SearchService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class SearchServiceImpl implements SearchService {

    private final LostItemRepository lostItemRepository;
    private final FoundItemRepository foundItemRepository;

    public SearchServiceImpl(LostItemRepository lostItemRepository, FoundItemRepository foundItemRepository) {
        this.lostItemRepository = lostItemRepository;
        this.foundItemRepository = foundItemRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public SearchResponse searchItems(
            String q,
            String category,
            String location,
            String date,
            String status,
            String color,
            Boolean urgent,
            String type
    ) {
        List<LostItemResponse> lostResults = new ArrayList<>();
        List<FoundItemResponse> foundResults = new ArrayList<>();

        boolean includeLost = type == null || type.isBlank() || "all".equalsIgnoreCase(type) || "lost".equalsIgnoreCase(type);
        boolean includeFound = type == null || type.isBlank() || "all".equalsIgnoreCase(type) || "found".equalsIgnoreCase(type);

        String queryLower = q != null ? q.trim().toLowerCase() : null;
        String categoryLower = category != null && !"ALL".equalsIgnoreCase(category) ? category.trim().toLowerCase() : null;
        String locationLower = location != null && !"ALL".equalsIgnoreCase(location) ? location.trim().toLowerCase() : null;
        String statusLower = status != null && !"ALL".equalsIgnoreCase(status) ? status.trim().toLowerCase() : null;
        String colorLower = color != null && !"ALL".equalsIgnoreCase(color) ? color.trim().toLowerCase() : null;

        if (includeLost) {
            List<LostItem> allLost = lostItemRepository.findAllByOrderByCreatedAtDesc();
            for (LostItem item : allLost) {
                if (urgent != null && urgent && !Boolean.TRUE.equals(item.getIsUrgent())) {
                    continue;
                }
                if (statusLower != null && (item.getStatus() == null || !item.getStatus().toLowerCase().contains(statusLower))) {
                    continue;
                }
                if (categoryLower != null && (item.getCategory() == null || !item.getCategory().toLowerCase().contains(categoryLower))) {
                    continue;
                }
                if (locationLower != null && (item.getLastSeenLocation() == null || !item.getLastSeenLocation().toLowerCase().contains(locationLower))) {
                    continue;
                }
                if (colorLower != null && (item.getColor() == null || !item.getColor().toLowerCase().contains(colorLower))) {
                    continue;
                }
                if (date != null && !date.isBlank() && item.getLostDateTime() != null) {
                    if (!item.getLostDateTime().toString().startsWith(date.trim())) {
                        continue;
                    }
                }
                if (queryLower != null && !queryLower.isBlank()) {
                    boolean nameMatch = item.getItemName() != null && item.getItemName().toLowerCase().contains(queryLower);
                    boolean descMatch = item.getDescription() != null && item.getDescription().toLowerCase().contains(queryLower);
                    boolean catMatch = item.getCategory() != null && item.getCategory().toLowerCase().contains(queryLower);
                    boolean locMatch = item.getLastSeenLocation() != null && item.getLastSeenLocation().toLowerCase().contains(queryLower);
                    if (!nameMatch && !descMatch && !catMatch && !locMatch) {
                        continue;
                    }
                }
                lostResults.add(LostItemResponse.from(item));
            }
        }

        if (includeFound && (urgent == null || !urgent)) {
            List<FoundItem> allFound = foundItemRepository.findAllByOrderByCreatedAtDesc();
            for (FoundItem item : allFound) {
                if (statusLower != null && (item.getStatus() == null || !item.getStatus().toLowerCase().contains(statusLower))) {
                    continue;
                }
                if (categoryLower != null && (item.getCategory() == null || !item.getCategory().toLowerCase().contains(categoryLower))) {
                    continue;
                }
                if (locationLower != null && (item.getFoundLocation() == null || !item.getFoundLocation().toLowerCase().contains(locationLower))) {
                    continue;
                }
                if (colorLower != null && (item.getColor() == null || !item.getColor().toLowerCase().contains(colorLower))) {
                    continue;
                }
                if (date != null && !date.isBlank() && item.getFoundDateTime() != null) {
                    if (!item.getFoundDateTime().toString().startsWith(date.trim())) {
                        continue;
                    }
                }
                if (queryLower != null && !queryLower.isBlank()) {
                    boolean nameMatch = item.getItemName() != null && item.getItemName().toLowerCase().contains(queryLower);
                    boolean descMatch = item.getDescription() != null && item.getDescription().toLowerCase().contains(queryLower);
                    boolean catMatch = item.getCategory() != null && item.getCategory().toLowerCase().contains(queryLower);
                    boolean locMatch = item.getFoundLocation() != null && item.getFoundLocation().toLowerCase().contains(queryLower);
                    if (!nameMatch && !descMatch && !catMatch && !locMatch) {
                        continue;
                    }
                }
                foundResults.add(FoundItemResponse.fromEntity(item));
            }
        }

        return new SearchResponse(lostResults, foundResults);
    }
}
