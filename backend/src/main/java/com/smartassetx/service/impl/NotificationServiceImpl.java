package com.smartassetx.service.impl;

import com.smartassetx.dto.NotificationDto;
import com.smartassetx.entity.Notification;
import com.smartassetx.entity.User;
import com.smartassetx.exception.BadRequestException;
import com.smartassetx.exception.ResourceNotFoundException;
import com.smartassetx.repository.NotificationRepository;
import com.smartassetx.service.AuthService;
import com.smartassetx.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final AuthService authService;

    public NotificationServiceImpl(NotificationRepository notificationRepository, AuthService authService) {
        this.notificationRepository = notificationRepository;
        this.authService = authService;
    }

    @Override
    public List<NotificationDto> getMyUnreadNotifications() {
        User user = authService.getCurrentUserEntity();
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markNotificationAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + notificationId));
        
        User user = authService.getCurrentUserEntity();
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You are not authorized to read this notification");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void createNotification(User user, String message) {
        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        notificationRepository.save(notification);
    }

    private NotificationDto mapToDto(Notification notif) {
        return NotificationDto.builder()
                .id(notif.getId())
                .message(notif.getMessage())
                .isRead(notif.isRead())
                .createdAt(notif.getCreatedAt())
                .build();
    }
}
