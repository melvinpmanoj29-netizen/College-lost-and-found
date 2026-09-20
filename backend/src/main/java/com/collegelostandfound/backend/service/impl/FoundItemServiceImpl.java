package com.collegelostandfound.backend.service.impl;

import com.collegelostandfound.backend.dto.request.CreateFoundItemRequest;
import com.collegelostandfound.backend.dto.request.UpdateFoundItemRequest;
import com.collegelostandfound.backend.dto.response.FoundItemResponse;
import com.collegelostandfound.backend.entity.FoundItem;
import com.collegelostandfound.backend.entity.User;
import com.collegelostandfound.backend.exception.ResourceNotFoundException;
import com.collegelostandfound.backend.repository.ClaimRepository;
import com.collegelostandfound.backend.repository.FoundItemRepository;
import com.collegelostandfound.backend.repository.MatchRepository;
import com.collegelostandfound.backend.service.FoundItemService;
import com.collegelostandfound.backend.service.SmartMatchingService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class FoundItemServiceImpl implements FoundItemService {

    private final FoundItemRepository foundItemRepository;
    private final MatchRepository matchRepository;
    private final ClaimRepository claimRepository;
    private final SmartMatchingService smartMatchingService;

    public FoundItemServiceImpl(FoundItemRepository foundItemRepository,
                                MatchRepository matchRepository,
                                ClaimRepository claimRepository,
                                SmartMatchingService smartMatchingService) {
        this.foundItemRepository = foundItemRepository;
        this.matchRepository = matchRepository;
        this.claimRepository = claimRepository;
        this.smartMatchingService = smartMatchingService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<FoundItemResponse> getAllFoundItems() {
        return foundItemRepository.findByStatusNotInOrderByCreatedAtDesc(List.of("RETURNED", "RESOLVED", "ARCHIVED")).stream()
            .map(FoundItemResponse::fromEntity)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public FoundItemResponse getFoundItemById(Long id) {
        FoundItem item = foundItemRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Found item not found with id: " + id));
        return FoundItemResponse.fromEntity(item);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FoundItemResponse> getMyFoundItems(User currentUser) {
        return foundItemRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId()).stream()
            .map(FoundItemResponse::fromEntity)
            .collect(Collectors.toList());
    }

    @Override
    public FoundItemResponse createFoundItem(CreateFoundItemRequest request, User currentUser) {
        FoundItem item = new FoundItem();
        item.setUser(currentUser);
        item.setItemName(request.getItemName());
        item.setImageUrl(request.getImageUrl());
        item.setDescription(request.getDescription());
        item.setCategory(request.getCategory());
        item.setColor(request.getColor());
        item.setFoundDateTime(request.getFoundDateTime());
        item.setFoundLocation(request.getFoundLocation());
        item.setLatitude(request.getLatitude());
        item.setLongitude(request.getLongitude());
        item.setStatus("FOUND");

        FoundItem savedItem = foundItemRepository.save(item);

        // Run smart matching against active lost items
        smartMatchingService.computeMatchesForFoundItem(savedItem);

        return FoundItemResponse.fromEntity(savedItem);
    }

    @Override
    public FoundItemResponse updateFoundItem(Long id, UpdateFoundItemRequest request, User currentUser) {
        FoundItem item = foundItemRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Found item not found with id: " + id));

        boolean isOwner = item.getUser() != null && item.getUser().getId().equals(currentUser.getId());
        boolean isAdmin = "ADMIN".equalsIgnoreCase(currentUser.getRole());
        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("You do not have permission to update this found item");
        }

        item.setItemName(request.getItemName());
        item.setImageUrl(request.getImageUrl());
        item.setDescription(request.getDescription());
        item.setCategory(request.getCategory());
        item.setColor(request.getColor());
        item.setFoundDateTime(request.getFoundDateTime());
        item.setFoundLocation(request.getFoundLocation());
        item.setLatitude(request.getLatitude());
        item.setLongitude(request.getLongitude());

        FoundItem updatedItem = foundItemRepository.save(item);

        // Re-evaluate matches
        smartMatchingService.computeMatchesForFoundItem(updatedItem);

        return FoundItemResponse.fromEntity(updatedItem);
    }

    @Override
    public void deleteFoundItem(Long id, User currentUser) {
        FoundItem item = foundItemRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Found item not found with id: " + id));

        boolean isOwner = item.getUser() != null && item.getUser().getId().equals(currentUser.getId());
        boolean isAdmin = "ADMIN".equalsIgnoreCase(currentUser.getRole());
        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("You do not have permission to delete this found item");
        }

        // Clean up dependent matches and claims before removing item
        matchRepository.deleteAll(matchRepository.findByFoundItemIdOrderByMatchScoreDesc(id));
        claimRepository.deleteAll(claimRepository.findByFoundItemId(id));

        foundItemRepository.delete(item);
    }
}
