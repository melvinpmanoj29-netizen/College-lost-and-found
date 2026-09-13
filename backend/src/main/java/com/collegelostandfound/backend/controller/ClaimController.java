package com.collegelostandfound.backend.controller;

import com.collegelostandfound.backend.dto.request.CreateClaimRequest;
import com.collegelostandfound.backend.dto.response.ClaimResponse;
import com.collegelostandfound.backend.entity.User;
import com.collegelostandfound.backend.service.ClaimService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/claims")
public class ClaimController {

    private final ClaimService claimService;

    public ClaimController(ClaimService claimService) {
        this.claimService = claimService;
    }

    @PostMapping
    public ResponseEntity<ClaimResponse> createClaim(
        @Valid @RequestBody CreateClaimRequest request,
        @AuthenticationPrincipal User currentUser
    ) {
        ClaimResponse response = claimService.createClaim(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<ClaimResponse>> getMyClaims(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(claimService.getMyClaims(currentUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClaimResponse> getClaimById(
        @PathVariable Long id,
        @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(claimService.getClaimById(id, currentUser));
    }
}
