package com.collegelostandfound.backend.controller;

import com.collegelostandfound.backend.dto.response.MapItemResponse;
import com.collegelostandfound.backend.service.MapService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/map")
public class MapController {

    private final MapService mapService;

    public MapController(MapService mapService) {
        this.mapService = mapService;
    }

    @GetMapping("/items")
    public ResponseEntity<List<MapItemResponse>> getMapItems() {
        return ResponseEntity.ok(mapService.getMapItems());
    }
}
