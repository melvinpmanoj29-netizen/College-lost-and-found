package com.collegelostandfound.backend.controller;

import com.collegelostandfound.backend.dto.response.FoundItemResponse;
import com.collegelostandfound.backend.dto.response.LostItemResponse;
import com.collegelostandfound.backend.dto.response.admin.AdminClaimReviewResponse;
import com.collegelostandfound.backend.dto.response.admin.AdminClaimSummaryResponse;
import com.collegelostandfound.backend.dto.response.admin.AdminItemHistoryDetailResponse;
import com.collegelostandfound.backend.dto.response.admin.DashboardStatsResponse;
import com.collegelostandfound.backend.dto.response.admin.ReturnHistoryStatsResponse;
import com.collegelostandfound.backend.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/return-history")
    public ResponseEntity<ReturnHistoryStatsResponse> getReturnHistory() {
        return ResponseEntity.ok(adminService.getReturnHistoryStats());
    }

    @GetMapping("/history")
    public ResponseEntity<List<AdminItemHistoryDetailResponse>> getAllItemHistory() {
        return ResponseEntity.ok(adminService.getAllItemHistory());
    }

    @GetMapping("/history/{claimId}")
    public ResponseEntity<AdminItemHistoryDetailResponse> getItemHistoryDetail(@PathVariable Long claimId) {
        return ResponseEntity.ok(adminService.getItemHistoryDetail(claimId));
    }

    @GetMapping("/lost-items")
    public ResponseEntity<List<LostItemResponse>> getAdminLostItems() {
        return ResponseEntity.ok(adminService.getAllLostItems());
    }

    @DeleteMapping("/lost-items/{id}")
    public ResponseEntity<Void> deleteAdminLostItem(@PathVariable Long id) {
        adminService.deleteLostItem(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/found-items")
    public ResponseEntity<List<FoundItemResponse>> getAdminFoundItems() {
        return ResponseEntity.ok(adminService.getAllFoundItems());
    }

    @DeleteMapping("/found-items/{id}")
    public ResponseEntity<Void> deleteAdminFoundItem(@PathVariable Long id) {
        adminService.deleteFoundItem(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/claims")
    public ResponseEntity<List<AdminClaimSummaryResponse>> getAdminClaims() {
        return ResponseEntity.ok(adminService.getAllClaims());
    }

    @GetMapping("/claims/{id}")
    public ResponseEntity<AdminClaimReviewResponse> getAdminClaimDetail(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getClaimDetail(id));
    }

    @PutMapping("/claims/{id}/approve")
    public ResponseEntity<AdminClaimSummaryResponse> approveClaim(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(adminService.approveClaim(id, authentication));
    }

    @PutMapping("/claims/{id}/reject")
    public ResponseEntity<AdminClaimSummaryResponse> rejectClaim(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(adminService.rejectClaim(id, authentication));
    }
}
