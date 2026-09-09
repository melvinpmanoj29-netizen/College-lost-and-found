package com.collegelostandfound.backend.service;

import com.collegelostandfound.backend.dto.request.CreateLostItemRequest;
import com.collegelostandfound.backend.dto.request.UpdateLostItemRequest;
import com.collegelostandfound.backend.dto.response.LostItemResponse;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface LostItemService {

    List<LostItemResponse> getAllLostItems();

    LostItemResponse getLostItemById(Long id);

    LostItemResponse createLostItem(CreateLostItemRequest request, Authentication authentication);

    LostItemResponse updateLostItem(Long id, UpdateLostItemRequest request, Authentication authentication);

    void deleteLostItem(Long id, Authentication authentication);

    List<LostItemResponse> getMyLostItems(Authentication authentication);

    int archiveExpiredItems();
}
