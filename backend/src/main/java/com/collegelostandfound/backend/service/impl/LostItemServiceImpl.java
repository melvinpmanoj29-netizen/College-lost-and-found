package com.collegelostandfound.backend.service.impl;

import com.collegelostandfound.backend.dto.request.CreateLostItemRequest;
import com.collegelostandfound.backend.dto.request.UpdateLostItemRequest;
import com.collegelostandfound.backend.dto.response.LostItemResponse;
import com.collegelostandfound.backend.entity.LostItem;
import com.collegelostandfound.backend.entity.User;
import com.collegelostandfound.backend.exception.InvalidCredentialsException;
import com.collegelostandfound.backend.exception.ResourceNotFoundException;
import com.collegelostandfound.backend.repository.LostItemRepository;
import com.collegelostandfound.backend.service.LostItemService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class LostItemServiceImpl implements LostItemService {

    private final LostItemRepository lostItemRepository;

    public LostItemServiceImpl(LostItemRepository lostItemRepository) {
        this.lostItemRepository = lostItemRepository;
    }

    @Override
    @Transactional
    public List<LostItemResponse> getAllLostItems() {
        archiveExpiredItems();
        return lostItemRepository.findByStatusNotInOrderByCreatedAtDesc(List.of("RETURNED", "RESOLVED", "ARCHIVED")).stream()
                .map(LostItemResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public LostItemResponse getLostItemById(Long id) {
        LostItem item = lostItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lost item not found with id: " + id));

        // Auto-archive if expired
        if (item.getExpiryDate() != null &&
                item.getExpiryDate().isBefore(LocalDateTime.now()) &&
                "LOST".equalsIgnoreCase(item.getStatus()) &&
                !Boolean.TRUE.equals(item.getIsArchived())) {
            item.setStatus("ARCHIVED");
            item.setIsArchived(true);
            item.setUpdatedAt(LocalDateTime.now());
            lostItemRepository.save(item);
        }

        return LostItemResponse.from(item);
    }

    @Override
    @Transactional
    public LostItemResponse createLostItem(CreateLostItemRequest request, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        LocalDateTime now = LocalDateTime.now();

        LostItem item = new LostItem();
        item.setUser(user);
        item.setItemName(request.getItemName().trim());
        item.setImageUrl(request.getImageUrl() != null && !request.getImageUrl().isBlank() ? request.getImageUrl().trim() : null);
        item.setDescription(request.getDescription().trim());
        item.setCategory(request.getCategory().trim());
        item.setColor(request.getColor() != null && !request.getColor().isBlank() ? request.getColor().trim() : null);
        item.setLostDateTime(request.getLostDateTime());
        item.setLastSeenLocation(request.getLastSeenLocation().trim());
        item.setLatitude(request.getLatitude());
        item.setLongitude(request.getLongitude());
        item.setStatus("LOST");
        item.setIsUrgent(request.getIsUrgent() != null ? request.getIsUrgent() : false);
        item.setExpiryDate(request.getExpiryDate());
        item.setIsArchived(false);
        item.setCreatedAt(now);
        item.setUpdatedAt(now);

        LostItem saved = lostItemRepository.save(item);
        return LostItemResponse.from(saved);
    }

    @Override
    @Transactional
    public LostItemResponse updateLostItem(Long id, UpdateLostItemRequest request, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        LostItem item = lostItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lost item not found with id: " + id));

        boolean isOwner = item.getUser() != null && item.getUser().getId().equals(user.getId());
        boolean isAdmin = "ADMIN".equalsIgnoreCase(user.getRole());

        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("You are not authorized to update this item");
        }

        item.setItemName(request.getItemName().trim());
        item.setImageUrl(request.getImageUrl() != null && !request.getImageUrl().isBlank() ? request.getImageUrl().trim() : null);
        item.setDescription(request.getDescription().trim());
        item.setCategory(request.getCategory().trim());
        item.setColor(request.getColor() != null && !request.getColor().isBlank() ? request.getColor().trim() : null);
        item.setLostDateTime(request.getLostDateTime());
        item.setLastSeenLocation(request.getLastSeenLocation().trim());
        if (request.getIsUrgent() != null) {
            item.setIsUrgent(request.getIsUrgent());
        }
        item.setExpiryDate(request.getExpiryDate());
        if (request.getLatitude() != null) {
            item.setLatitude(request.getLatitude());
        }
        if (request.getLongitude() != null) {
            item.setLongitude(request.getLongitude());
        }
        item.setUpdatedAt(LocalDateTime.now());

        LostItem updated = lostItemRepository.save(item);
        return LostItemResponse.from(updated);
    }

    @Override
    @Transactional
    public void deleteLostItem(Long id, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        LostItem item = lostItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lost item not found with id: " + id));

        boolean isOwner = item.getUser() != null && item.getUser().getId().equals(user.getId());
        boolean isAdmin = "ADMIN".equalsIgnoreCase(user.getRole());

        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("You are not authorized to delete this item");
        }

        if ("RETURNED".equalsIgnoreCase(item.getStatus())) {
            throw new IllegalStateException("Cannot delete an item that has already been returned");
        }

        lostItemRepository.delete(item);
    }

    @Override
    @Transactional
    public List<LostItemResponse> getMyLostItems(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        archiveExpiredItems();
        return lostItemRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(LostItemResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public int archiveExpiredItems() {
        LocalDateTime now = LocalDateTime.now();
        List<LostItem> expiredItems = lostItemRepository.findByExpiryDateBeforeAndStatusAndIsArchivedFalse(now, "LOST");
        for (LostItem item : expiredItems) {
            item.setStatus("ARCHIVED");
            item.setIsArchived(true);
            item.setUpdatedAt(now);
        }
        if (!expiredItems.isEmpty()) {
            lostItemRepository.saveAll(expiredItems);
        }
        return expiredItems.size();
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new InvalidCredentialsException("Authentication required");
        }
        return user;
    }
}
