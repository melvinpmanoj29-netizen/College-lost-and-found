package com.collegelostandfound.backend.controller;

import com.collegelostandfound.backend.dto.response.SearchResponse;
import com.collegelostandfound.backend.service.SearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping
    public ResponseEntity<SearchResponse> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) Boolean urgent,
            @RequestParam(required = false) String type
    ) {
        return ResponseEntity.ok(searchService.searchItems(q, category, location, date, status, color, urgent, type));
    }
}
