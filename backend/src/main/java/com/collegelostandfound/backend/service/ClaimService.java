package com.collegelostandfound.backend.service;

import com.collegelostandfound.backend.dto.request.CreateClaimRequest;
import com.collegelostandfound.backend.dto.response.ClaimResponse;
import com.collegelostandfound.backend.entity.User;

import java.util.List;

public interface ClaimService {

    ClaimResponse createClaim(CreateClaimRequest request, User currentUser);

    List<ClaimResponse> getMyClaims(User currentUser);

    ClaimResponse getClaimById(Long id, User currentUser);
}
