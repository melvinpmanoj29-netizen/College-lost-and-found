package com.collegelostandfound.backend.service.impl;

import com.collegelostandfound.backend.dto.response.MatchResponse;
import com.collegelostandfound.backend.entity.FoundItem;
import com.collegelostandfound.backend.entity.LostItem;
import com.collegelostandfound.backend.entity.Match;
import com.collegelostandfound.backend.exception.ResourceNotFoundException;
import com.collegelostandfound.backend.repository.FoundItemRepository;
import com.collegelostandfound.backend.repository.LostItemRepository;
import com.collegelostandfound.backend.repository.MatchRepository;
import com.collegelostandfound.backend.service.EmailService;
import com.collegelostandfound.backend.service.SmartMatchingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class SmartMatchingServiceImpl implements SmartMatchingService {

    private static final BigDecimal MATCH_THRESHOLD = BigDecimal.valueOf(25.00);

    private static final Set<String> STOP_WORDS = Set.of(
        "a", "an", "the", "in", "on", "at", "to", "for", "of", "and", "is", "it",
        "with", "near", "by", "from", "was", "were", "my", "or", "some", "has", "have"
    );

    private final MatchRepository matchRepository;
    private final FoundItemRepository foundItemRepository;
    private final LostItemRepository lostItemRepository;
    private final EmailService emailService;
    private final com.collegelostandfound.backend.service.NotificationService notificationService;

    public SmartMatchingServiceImpl(MatchRepository matchRepository,
                                    FoundItemRepository foundItemRepository,
                                    LostItemRepository lostItemRepository,
                                    EmailService emailService,
                                    com.collegelostandfound.backend.service.NotificationService notificationService) {
        this.matchRepository = matchRepository;
        this.foundItemRepository = foundItemRepository;
        this.lostItemRepository = lostItemRepository;
        this.emailService = emailService;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<MatchResponse> getMatchesForLostItem(Long lostItemId) {
        if (!lostItemRepository.existsById(lostItemId)) {
            throw new ResourceNotFoundException("Lost item not found with id: " + lostItemId);
        }
        return matchRepository.findByLostItemIdOrderByMatchScoreDesc(lostItemId).stream()
            .map(MatchResponse::fromEntity)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MatchResponse> getMatchesForFoundItem(Long foundItemId) {
        if (!foundItemRepository.existsById(foundItemId)) {
            throw new ResourceNotFoundException("Found item not found with id: " + foundItemId);
        }
        return matchRepository.findByFoundItemIdOrderByMatchScoreDesc(foundItemId).stream()
            .map(MatchResponse::fromEntity)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public MatchResponse getMatchById(Long id) {
        Match match = matchRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Match not found with id: " + id));
        return MatchResponse.fromEntity(match);
    }

    @Override
    public BigDecimal calculateScore(LostItem lostItem, FoundItem foundItem) {
        if (lostItem == null || foundItem == null) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        double score = 0.0;

        // 1. Category Matching (30 points)
        if (lostItem.getCategory() != null && foundItem.getCategory() != null
            && lostItem.getCategory().trim().equalsIgnoreCase(foundItem.getCategory().trim())) {
            score += 30.0;
        }

        // 2. Colour Matching (20 points)
        if (lostItem.getColor() != null && !lostItem.getColor().isBlank()
            && foundItem.getColor() != null && !foundItem.getColor().isBlank()) {
            String lostColor = lostItem.getColor().trim().toLowerCase();
            String foundColor = foundItem.getColor().trim().toLowerCase();
            if (lostColor.equals(foundColor)) {
                score += 20.0;
            } else if (lostColor.contains(foundColor) || foundColor.contains(lostColor)) {
                score += 15.0;
            }
        }

        // 3. Location Matching (20 points)
        if (lostItem.getLastSeenLocation() != null && !lostItem.getLastSeenLocation().isBlank()
            && foundItem.getFoundLocation() != null && !foundItem.getFoundLocation().isBlank()) {
            String lostLoc = lostItem.getLastSeenLocation().trim().toLowerCase();
            String foundLoc = foundItem.getFoundLocation().trim().toLowerCase();
            if (lostLoc.equals(foundLoc)) {
                score += 20.0;
            } else if (lostLoc.contains(foundLoc) || foundLoc.contains(lostLoc)) {
                score += 15.0;
            } else {
                Set<String> lostLocTokens = tokenize(lostLoc);
                Set<String> foundLocTokens = tokenize(foundLoc);
                long overlap = lostLocTokens.stream().filter(foundLocTokens::contains).count();
                if (overlap > 0) {
                    score += 10.0;
                }
            }
        }

        // 4. Date Proximity (10 points)
        if (lostItem.getLostDateTime() != null && foundItem.getFoundDateTime() != null) {
            long daysDiff = ChronoUnit.DAYS.between(
                lostItem.getLostDateTime().toLocalDate(),
                foundItem.getFoundDateTime().toLocalDate()
            );

            if (daysDiff == 0) {
                score += 10.0;
            } else if (daysDiff > 0) {
                if (daysDiff <= 3) {
                    score += 8.0;
                } else if (daysDiff <= 7) {
                    score += 5.0;
                } else if (daysDiff <= 14) {
                    score += 3.0;
                }
            } else if (daysDiff == -1) {
                // Found reported 1 day before estimated lost date
                score += 3.0;
            }
        }

        // 5. Description Similarity (20 points)
        if (lostItem.getDescription() != null && foundItem.getDescription() != null) {
            Set<String> lostTokens = tokenize(lostItem.getDescription());
            Set<String> foundTokens = tokenize(foundItem.getDescription());

            if (!lostTokens.isEmpty() && !foundTokens.isEmpty()) {
                long commonTokens = lostTokens.stream().filter(foundTokens::contains).count();
                int minSize = Math.min(lostTokens.size(), foundTokens.size());
                if (minSize > 0) {
                    double overlapRatio = (double) commonTokens / minSize;
                    score += Math.min(20.0, overlapRatio * 20.0);
                }
            }
        }

        double finalScore = Math.min(100.0, Math.max(0.0, score));
        return BigDecimal.valueOf(finalScore).setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    public void computeMatchesForFoundItem(FoundItem foundItem) {
        if (foundItem == null || foundItem.getId() == null) {
            return;
        }

        List<LostItem> activeLostItems = lostItemRepository.findByStatusNot("RETURNED");
        for (LostItem lostItem : activeLostItems) {
            BigDecimal score = calculateScore(lostItem, foundItem);
            if (score.compareTo(MATCH_THRESHOLD) >= 0) {
                saveOrUpdateMatch(lostItem, foundItem, score);
            }
        }
    }

    @Override
    public void computeMatchesForLostItem(LostItem lostItem) {
        if (lostItem == null || lostItem.getId() == null) {
            return;
        }

        List<FoundItem> activeFoundItems = foundItemRepository.findByStatus("FOUND");
        for (FoundItem foundItem : activeFoundItems) {
            BigDecimal score = calculateScore(lostItem, foundItem);
            if (score.compareTo(MATCH_THRESHOLD) >= 0) {
                saveOrUpdateMatch(lostItem, foundItem, score);
            }
        }
    }

    private void saveOrUpdateMatch(LostItem lostItem, FoundItem foundItem, BigDecimal score) {
        Optional<Match> existingMatch = matchRepository.findByLostItemIdAndFoundItemId(
            lostItem.getId(),
            foundItem.getId()
        );

        boolean isNewOrHigher = false;

        if (existingMatch.isPresent()) {
            Match match = existingMatch.get();
            // Don't overwrite if already claimed or resolved
            if ("POSSIBLE".equals(match.getMatchStatus())) {
                if (score.compareTo(match.getMatchScore()) > 0) {
                    isNewOrHigher = true;
                }
                match.setMatchScore(score);
                matchRepository.save(match);
            }
        } else {
            Match newMatch = new Match();
            newMatch.setLostItem(lostItem);
            newMatch.setFoundItem(foundItem);
            newMatch.setMatchScore(score);
            newMatch.setMatchStatus("POSSIBLE");
            matchRepository.save(newMatch);
            isNewOrHigher = true;
        }

        // Send email & in-app alert when score is 50% or higher
        if (isNewOrHigher && score.compareTo(BigDecimal.valueOf(50.0)) >= 0 && lostItem.getUser() != null) {
            try {
                notificationService.createNotification(
                    lostItem.getUser(),
                    "Potential " + score + "% smart match found for your lost " + lostItem.getItemName() + "!",
                    "MATCH_FOUND"
                );
                emailService.sendMatchNotificationEmail(lostItem.getUser(), lostItem, foundItem, score);
            } catch (Exception e) {
                // Log and continue safely
            }
        }
    }

    private Set<String> tokenize(String text) {
        if (text == null || text.isBlank()) {
            return Collections.emptySet();
        }
        return Arrays.stream(text.toLowerCase().split("[^a-zA-Z0-9]+"))
            .filter(token -> token.length() >= 2 && !STOP_WORDS.contains(token))
            .collect(Collectors.toSet());
    }
}
