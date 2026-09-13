package com.collegelostandfound.backend.service;

import com.collegelostandfound.backend.dto.response.MatchResponse;
import com.collegelostandfound.backend.entity.FoundItem;
import com.collegelostandfound.backend.entity.LostItem;

import java.math.BigDecimal;
import java.util.List;

public interface SmartMatchingService {

    List<MatchResponse> getMatchesForLostItem(Long lostItemId);

    List<MatchResponse> getMatchesForFoundItem(Long foundItemId);

    MatchResponse getMatchById(Long id);

    BigDecimal calculateScore(LostItem lostItem, FoundItem foundItem);

    void computeMatchesForFoundItem(FoundItem foundItem);

    void computeMatchesForLostItem(LostItem lostItem);
}
