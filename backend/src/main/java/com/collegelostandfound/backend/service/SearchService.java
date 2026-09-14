package com.collegelostandfound.backend.service;

import com.collegelostandfound.backend.dto.response.SearchResponse;

public interface SearchService {

    SearchResponse searchItems(
            String q,
            String category,
            String location,
            String date,
            String status,
            String color,
            Boolean urgent,
            String type
    );
}
