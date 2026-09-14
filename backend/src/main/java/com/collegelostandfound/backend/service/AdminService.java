package com.collegelostandfound.backend.service;

import com.collegelostandfound.backend.dto.response.FoundItemResponse;
import com.collegelostandfound.backend.dto.response.LostItemResponse;
import com.collegelostandfound.backend.dto.response.admin.AdminClaimReviewResponse;
import com.collegelostandfound.backend.dto.response.admin.AdminClaimSummaryResponse;
import com.collegelostandfound.backend.dto.response.admin.DashboardStatsResponse;
import com.collegelostandfound.backend.dto.response.admin.ReturnHistoryStatsResponse;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface AdminService {

    DashboardStatsResponse getDashboardStats();

    ReturnHistoryStatsResponse getReturnHistoryStats();

    List<LostItemResponse> getAllLostItems();

    void deleteLostItem(Long id);

    List<FoundItemResponse> getAllFoundItems();

    void deleteFoundItem(Long id);

    List<AdminClaimSummaryResponse> getAllClaims();

    AdminClaimReviewResponse getClaimDetail(Long id);

    AdminClaimSummaryResponse approveClaim(Long id, Authentication authentication);

    AdminClaimSummaryResponse rejectClaim(Long id, Authentication authentication);
}
