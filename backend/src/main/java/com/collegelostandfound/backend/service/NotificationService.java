package com.collegelostandfound.backend.service;

import com.collegelostandfound.backend.dto.response.NotificationResponse;
import com.collegelostandfound.backend.entity.User;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface NotificationService {

    List<NotificationResponse> getNotifications(Authentication authentication);

    List<NotificationResponse> getUnreadNotifications(Authentication authentication);

    NotificationResponse markAsRead(Long id, Authentication authentication);

    void createNotification(User user, String message, String type);
}
