package com.collegelostandfound.backend.service;

import com.collegelostandfound.backend.dto.request.CreateFoundItemRequest;
import com.collegelostandfound.backend.dto.request.UpdateFoundItemRequest;
import com.collegelostandfound.backend.dto.response.FoundItemResponse;
import com.collegelostandfound.backend.entity.User;

import java.util.List;

public interface FoundItemService {

    List<FoundItemResponse> getAllFoundItems();

    FoundItemResponse getFoundItemById(Long id);

    List<FoundItemResponse> getMyFoundItems(User currentUser);

    FoundItemResponse createFoundItem(CreateFoundItemRequest request, User currentUser);

    FoundItemResponse updateFoundItem(Long id, UpdateFoundItemRequest request, User currentUser);

    void deleteFoundItem(Long id, User currentUser);
}
