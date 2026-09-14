package com.collegelostandfound.backend.service.impl;

import com.collegelostandfound.backend.dto.response.MapItemResponse;
import com.collegelostandfound.backend.entity.FoundItem;
import com.collegelostandfound.backend.entity.LostItem;
import com.collegelostandfound.backend.repository.FoundItemRepository;
import com.collegelostandfound.backend.repository.LostItemRepository;
import com.collegelostandfound.backend.service.MapService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class MapServiceImpl implements MapService {

    private final LostItemRepository lostItemRepository;
    private final FoundItemRepository foundItemRepository;

    public MapServiceImpl(LostItemRepository lostItemRepository, FoundItemRepository foundItemRepository) {
        this.lostItemRepository = lostItemRepository;
        this.foundItemRepository = foundItemRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<MapItemResponse> getMapItems() {
        List<MapItemResponse> results = new ArrayList<>();

        List<LostItem> lostItems = lostItemRepository.findAllByOrderByCreatedAtDesc();
        for (LostItem item : lostItems) {
            if ("ARCHIVED".equalsIgnoreCase(item.getStatus()) || "RETURNED".equalsIgnoreCase(item.getStatus())) {
                continue;
            }
            BigDecimal lat = item.getLatitude();
            BigDecimal lng = item.getLongitude();
            if (lat == null || lng == null) {
                // Fallback default coordinates around campus based on item id hash
                double hashOffset = (item.getId() % 10) * 0.0005;
                lat = BigDecimal.valueOf(12.9716 + hashOffset);
                lng = BigDecimal.valueOf(77.5946 + hashOffset);
            }
            results.add(new MapItemResponse(
                    item.getId(),
                    "LOST",
                    item.getItemName(),
                    item.getLastSeenLocation(),
                    lat,
                    lng,
                    item.getIsUrgent()
            ));
        }

        List<FoundItem> foundItems = foundItemRepository.findAllByOrderByCreatedAtDesc();
        for (FoundItem item : foundItems) {
            if ("CLAIMED".equalsIgnoreCase(item.getStatus()) || "RETURNED".equalsIgnoreCase(item.getStatus())) {
                continue;
            }
            BigDecimal lat = item.getLatitude();
            BigDecimal lng = item.getLongitude();
            if (lat == null || lng == null) {
                double hashOffset = (item.getId() % 10) * 0.0005;
                lat = BigDecimal.valueOf(12.9716 - hashOffset);
                lng = BigDecimal.valueOf(77.5946 - hashOffset);
            }
            results.add(new MapItemResponse(
                    item.getId(),
                    "FOUND",
                    item.getItemName(),
                    item.getFoundLocation(),
                    lat,
                    lng,
                    false
            ));
        }

        return results;
    }
}
