package com.collegelostandfound.backend.controller;

import com.collegelostandfound.backend.dto.request.CreateLostItemRequest;
import com.collegelostandfound.backend.dto.request.UpdateLostItemRequest;
import com.collegelostandfound.backend.dto.response.LostItemResponse;
import com.collegelostandfound.backend.service.LostItemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lost-items")
public class LostItemController {

    private final LostItemService lostItemService;

    public LostItemController(LostItemService lostItemService) {
        this.lostItemService = lostItemService;
    }

    @GetMapping
    public ResponseEntity<List<LostItemResponse>> getAllLostItems() {
        return ResponseEntity.ok(lostItemService.getAllLostItems());
    }

    @GetMapping("/my")
    public ResponseEntity<List<LostItemResponse>> getMyLostItems(Authentication authentication) {
        return ResponseEntity.ok(lostItemService.getMyLostItems(authentication));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LostItemResponse> getLostItemById(@PathVariable Long id) {
        return ResponseEntity.ok(lostItemService.getLostItemById(id));
    }

    @PostMapping
    public ResponseEntity<LostItemResponse> createLostItem(
            @Valid @RequestBody CreateLostItemRequest request,
            Authentication authentication
    ) {
        LostItemResponse response = lostItemService.createLostItem(request, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LostItemResponse> updateLostItem(
            @PathVariable Long id,
            @Valid @RequestBody UpdateLostItemRequest request,
            Authentication authentication
    ) {
        LostItemResponse response = lostItemService.updateLostItem(id, request, authentication);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLostItem(
            @PathVariable Long id,
            Authentication authentication
    ) {
        lostItemService.deleteLostItem(id, authentication);
        return ResponseEntity.noContent().build();
    }
}
