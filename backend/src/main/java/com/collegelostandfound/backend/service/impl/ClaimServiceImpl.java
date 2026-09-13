package com.collegelostandfound.backend.service.impl;

import com.collegelostandfound.backend.dto.request.CreateClaimRequest;
import com.collegelostandfound.backend.dto.response.ClaimResponse;
import com.collegelostandfound.backend.entity.Claim;
import com.collegelostandfound.backend.entity.FoundItem;
import com.collegelostandfound.backend.entity.LostItem;
import com.collegelostandfound.backend.entity.User;
import com.collegelostandfound.backend.exception.DuplicateResourceException;
import com.collegelostandfound.backend.exception.ResourceNotFoundException;
import com.collegelostandfound.backend.repository.ClaimRepository;
import com.collegelostandfound.backend.repository.FoundItemRepository;
import com.collegelostandfound.backend.repository.LostItemRepository;
import com.collegelostandfound.backend.repository.MatchRepository;
import com.collegelostandfound.backend.service.ClaimService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ClaimServiceImpl implements ClaimService {

    private final ClaimRepository claimRepository;
    private final LostItemRepository lostItemRepository;
    private final FoundItemRepository foundItemRepository;
    private final MatchRepository matchRepository;

    public ClaimServiceImpl(ClaimRepository claimRepository,
                            LostItemRepository lostItemRepository,
                            FoundItemRepository foundItemRepository,
                            MatchRepository matchRepository) {
        this.claimRepository = claimRepository;
        this.lostItemRepository = lostItemRepository;
        this.foundItemRepository = foundItemRepository;
        this.matchRepository = matchRepository;
    }

    @Override
    public ClaimResponse createClaim(CreateClaimRequest request, User currentUser) {
        LostItem lostItem = lostItemRepository.findById(request.getLostItemId())
            .orElseThrow(() -> new ResourceNotFoundException("Lost item not found with id: " + request.getLostItemId()));

        FoundItem foundItem = foundItemRepository.findById(request.getFoundItemId())
            .orElseThrow(() -> new ResourceNotFoundException("Found item not found with id: " + request.getFoundItemId()));

        // Prevent duplicate claim by same user for same lost-found pair
        if (claimRepository.existsByLostItemIdAndFoundItemIdAndClaimantId(
            lostItem.getId(),
            foundItem.getId(),
            currentUser.getId()
        )) {
            throw new DuplicateResourceException("You have already submitted a claim for this item");
        }

        Claim claim = new Claim();
        claim.setLostItem(lostItem);
        claim.setFoundItem(foundItem);
        claim.setClaimant(currentUser);
        claim.setVerificationAnswer(request.getVerificationAnswer());
        claim.setStatus("PENDING");

        Claim savedClaim = claimRepository.save(claim);

        // Update match status to CLAIMED if match exists
        matchRepository.findByLostItemIdAndFoundItemId(lostItem.getId(), foundItem.getId())
            .ifPresent(match -> {
                match.setMatchStatus("CLAIMED");
                matchRepository.save(match);
            });

        return ClaimResponse.fromEntity(savedClaim);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClaimResponse> getMyClaims(User currentUser) {
        return claimRepository.findByClaimantIdOrderByCreatedAtDesc(currentUser.getId()).stream()
            .map(ClaimResponse::fromEntity)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ClaimResponse getClaimById(Long id, User currentUser) {
        Claim claim = claimRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + id));

        boolean isClaimant = claim.getClaimant() != null && claim.getClaimant().getId().equals(currentUser.getId());
        boolean isAdmin = "ADMIN".equalsIgnoreCase(currentUser.getRole());

        if (!isClaimant && !isAdmin) {
            throw new AccessDeniedException("You do not have permission to view this claim");
        }

        return ClaimResponse.fromEntity(claim);
    }
}
