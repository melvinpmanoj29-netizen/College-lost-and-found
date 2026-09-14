package com.collegelostandfound.backend.service.impl;

import com.collegelostandfound.backend.dto.response.NotificationResponse;
import com.collegelostandfound.backend.entity.Notification;
import com.collegelostandfound.backend.entity.User;
import com.collegelostandfound.backend.exception.InvalidCredentialsException;
import com.collegelostandfound.backend.exception.ResourceNotFoundException;
import com.collegelostandfound.backend.repository.NotificationRepository;
import com.collegelostandfound.backend.service.NotificationService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotifications(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(NotificationResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadNotifications(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(user.getId()).stream()
                .map(NotificationResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional
    public NotificationResponse markAsRead(Long id, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You are not authorized to update this notification");
        }

        notification.setIsRead(true);
        Notification saved = notificationRepository.save(notification);
        return NotificationResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public void createNotification(User user, String message, String type) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setType(type);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new InvalidCredentialsException("Authentication required");
        }
        return user;
    }
}
