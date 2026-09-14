package com.collegelostandfound.backend.controller;

import com.collegelostandfound.backend.dto.response.MatchResponse;
import com.collegelostandfound.backend.service.SmartMatchingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
public class MatchController {

    private final SmartMatchingService smartMatchingService;

    public MatchController(SmartMatchingService smartMatchingService) {
        this.smartMatchingService = smartMatchingService;
    }

    @GetMapping("/lost/{lostItemId}")
    public ResponseEntity<List<MatchResponse>> getMatchesForLostItem(@PathVariable Long lostItemId) {
        return ResponseEntity.ok(smartMatchingService.getMatchesForLostItem(lostItemId));
    }

    @GetMapping("/found/{foundItemId}")
    public ResponseEntity<List<MatchResponse>> getMatchesForFoundItem(@PathVariable Long foundItemId) {
        return ResponseEntity.ok(smartMatchingService.getMatchesForFoundItem(foundItemId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MatchResponse> getMatchById(@PathVariable Long id) {
        return ResponseEntity.ok(smartMatchingService.getMatchById(id));
    }
}
