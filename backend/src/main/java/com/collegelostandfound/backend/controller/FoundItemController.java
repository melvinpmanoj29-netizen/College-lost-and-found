package com.collegelostandfound.backend.controller;

import com.collegelostandfound.backend.dto.request.CreateFoundItemRequest;
import com.collegelostandfound.backend.dto.request.UpdateFoundItemRequest;
import com.collegelostandfound.backend.dto.response.FoundItemResponse;
import com.collegelostandfound.backend.entity.User;
import com.collegelostandfound.backend.service.FoundItemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/found-items")
public class FoundItemController {

    private final FoundItemService foundItemService;

    public FoundItemController(FoundItemService foundItemService) {
        this.foundItemService = foundItemService;
    }

    @GetMapping
    public ResponseEntity<List<FoundItemResponse>> getAllFoundItems() {
        return ResponseEntity.ok(foundItemService.getAllFoundItems());
    }

    @GetMapping("/my")
    public ResponseEntity<List<FoundItemResponse>> getMyFoundItems(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(foundItemService.getMyFoundItems(currentUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoundItemResponse> getFoundItemById(@PathVariable Long id) {
        return ResponseEntity.ok(foundItemService.getFoundItemById(id));
    }

    @PostMapping
    public ResponseEntity<FoundItemResponse> createFoundItem(
        @Valid @RequestBody CreateFoundItemRequest request,
        @AuthenticationPrincipal User currentUser
    ) {
        FoundItemResponse response = foundItemService.createFoundItem(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FoundItemResponse> updateFoundItem(
        @PathVariable Long id,
        @Valid @RequestBody UpdateFoundItemRequest request,
        @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(foundItemService.updateFoundItem(id, request, currentUser));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> deleteFoundItem(
        @PathVariable Long id,
        @AuthenticationPrincipal User currentUser
    ) {
        foundItemService.deleteFoundItem(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}
