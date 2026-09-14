package com.collegelostandfound.backend.service;

import com.collegelostandfound.backend.dto.response.MapItemResponse;
import java.util.List;

public interface MapService {

    List<MapItemResponse> getMapItems();
}
