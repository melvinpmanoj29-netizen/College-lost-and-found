package com.collegelostandfound.backend.service.impl;

import com.collegelostandfound.backend.dto.response.FoundItemResponse;
import com.collegelostandfound.backend.dto.response.LostItemResponse;
import com.collegelostandfound.backend.dto.response.SearchResponse;
import com.collegelostandfound.backend.entity.FoundItem;
import com.collegelostandfound.backend.entity.LostItem;
import com.collegelostandfound.backend.repository.FoundItemRepository;
import com.collegelostandfound.backend.repository.LostItemRepository;
import com.collegelostandfound.backend.service.SearchService;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
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

        if (includeLost) {
            Specification<LostItem> lostSpec = buildLostItemSpecification(q, category, location, date, status, color, urgent);
            List<LostItem> lostItems = lostItemRepository.findAll(lostSpec, Sort.by(Sort.Direction.DESC, "createdAt"));
            for (LostItem item : lostItems) {
                lostResults.add(LostItemResponse.from(item));
            }
        }

        if (includeFound && (urgent == null || !urgent)) {
            Specification<FoundItem> foundSpec = buildFoundItemSpecification(q, category, location, date, status, color);
            List<FoundItem> foundItems = foundItemRepository.findAll(foundSpec, Sort.by(Sort.Direction.DESC, "createdAt"));
            for (FoundItem item : foundItems) {
                foundResults.add(FoundItemResponse.fromEntity(item));
            }
        }

        return new SearchResponse(lostResults, foundResults);
    }

    private Specification<LostItem> buildLostItemSpecification(
            String q,
            String category,
            String location,
            String date,
            String status,
            String color,
            Boolean urgent
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Multi-word tokenized query
            if (q != null && !q.trim().isBlank()) {
                String[] tokens = q.trim().toLowerCase().split("\\s+");
                for (String token : tokens) {
                    if (token.isBlank()) continue;
                    String pattern = "%" + token + "%";
                    Predicate namePred = cb.like(cb.lower(root.get("itemName")), pattern);
                    Predicate descPred = cb.like(cb.lower(root.get("description")), pattern);
                    Predicate catPred = cb.like(cb.lower(root.get("category")), pattern);
                    Predicate colPred = cb.like(cb.lower(root.get("color")), pattern);
                    Predicate locPred = cb.like(cb.lower(root.get("lastSeenLocation")), pattern);

                    predicates.add(cb.or(namePred, descPred, catPred, colPred, locPred));
                }
            }

            // Category filter
            if (category != null && !category.isBlank() && !"ALL".equalsIgnoreCase(category)) {
                predicates.add(cb.equal(cb.lower(root.get("category")), category.trim().toLowerCase()));
            }

            // Location filter
            if (location != null && !location.isBlank() && !"ALL".equalsIgnoreCase(location)) {
                predicates.add(cb.like(cb.lower(root.get("lastSeenLocation")), "%" + location.trim().toLowerCase() + "%"));
            }

            // Color filter
            if (color != null && !color.isBlank() && !"ALL".equalsIgnoreCase(color)) {
                predicates.add(cb.like(cb.lower(root.get("color")), "%" + color.trim().toLowerCase() + "%"));
            }

            // Status filter
            if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
                predicates.add(cb.equal(cb.lower(root.get("status")), status.trim().toLowerCase()));
            } else {
                // By default, exclude resolved and archived items from active search
                predicates.add(cb.not(root.get("status").in(Arrays.asList("RETURNED", "RESOLVED", "ARCHIVED"))));
            }

            // Urgent filter
            if (urgent != null && urgent) {
                predicates.add(cb.isTrue(root.get("isUrgent")));
            }

            // Date filter (matches day of lost_date_time)
            if (date != null && !date.isBlank()) {
                try {
                    LocalDate parsedDate = LocalDate.parse(date.trim());
                    LocalDateTime startOfDay = parsedDate.atStartOfDay();
                    LocalDateTime endOfDay = parsedDate.atTime(LocalTime.MAX);
                    predicates.add(cb.between(root.get("lostDateTime"), startOfDay, endOfDay));
                } catch (Exception ignored) {
                    // Fallback to string prefix match if custom date format
                    predicates.add(cb.like(cb.function("str", String.class, root.get("lostDateTime")), date.trim() + "%"));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Specification<FoundItem> buildFoundItemSpecification(
            String q,
            String category,
            String location,
            String date,
            String status,
            String color
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Multi-word tokenized query
            if (q != null && !q.trim().isBlank()) {
                String[] tokens = q.trim().toLowerCase().split("\\s+");
                for (String token : tokens) {
                    if (token.isBlank()) continue;
                    String pattern = "%" + token + "%";
                    Predicate namePred = cb.like(cb.lower(root.get("itemName")), pattern);
                    Predicate descPred = cb.like(cb.lower(root.get("description")), pattern);
                    Predicate catPred = cb.like(cb.lower(root.get("category")), pattern);
                    Predicate colPred = cb.like(cb.lower(root.get("color")), pattern);
                    Predicate locPred = cb.like(cb.lower(root.get("foundLocation")), pattern);

                    predicates.add(cb.or(namePred, descPred, catPred, colPred, locPred));
                }
            }

            // Category filter
            if (category != null && !category.isBlank() && !"ALL".equalsIgnoreCase(category)) {
                predicates.add(cb.equal(cb.lower(root.get("category")), category.trim().toLowerCase()));
            }

            // Location filter
            if (location != null && !location.isBlank() && !"ALL".equalsIgnoreCase(location)) {
                predicates.add(cb.like(cb.lower(root.get("foundLocation")), "%" + location.trim().toLowerCase() + "%"));
            }

            // Color filter
            if (color != null && !color.isBlank() && !"ALL".equalsIgnoreCase(color)) {
                predicates.add(cb.like(cb.lower(root.get("color")), "%" + color.trim().toLowerCase() + "%"));
            }

            // Status filter
            if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
                predicates.add(cb.equal(cb.lower(root.get("status")), status.trim().toLowerCase()));
            } else {
                // By default, exclude resolved and archived items from active search
                predicates.add(cb.not(root.get("status").in(Arrays.asList("RETURNED", "RESOLVED", "ARCHIVED"))));
            }

            // Date filter (matches day of found_date_time)
            if (date != null && !date.isBlank()) {
                try {
                    LocalDate parsedDate = LocalDate.parse(date.trim());
                    LocalDateTime startOfDay = parsedDate.atStartOfDay();
                    LocalDateTime endOfDay = parsedDate.atTime(LocalTime.MAX);
                    predicates.add(cb.between(root.get("foundDateTime"), startOfDay, endOfDay));
                } catch (Exception ignored) {
                    predicates.add(cb.like(cb.function("str", String.class, root.get("foundDateTime")), date.trim() + "%"));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
