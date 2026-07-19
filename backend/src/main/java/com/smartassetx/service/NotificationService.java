package com.smartassetx.service;

import com.smartassetx.dto.NotificationDto;
import com.smartassetx.entity.User;
import java.util.List;

public interface NotificationService {
    List<NotificationDto> getMyUnreadNotifications();
    void markNotificationAsRead(Long notificationId);
    void createNotification(User user, String message);
}
