package com.collegelostandfound.backend.service;

import com.collegelostandfound.backend.entity.FoundItem;
import com.collegelostandfound.backend.entity.LostItem;
import com.collegelostandfound.backend.entity.User;

import java.math.BigDecimal;

public interface EmailService {
    void sendMatchNotificationEmail(User recipient, LostItem lostItem, FoundItem foundItem, BigDecimal score);
    void sendPasswordResetEmail(User recipient, String resetToken, String resetUrl);
}
