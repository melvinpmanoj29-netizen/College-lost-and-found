package com.collegelostandfound.backend.service.impl;

import com.collegelostandfound.backend.entity.FoundItem;
import com.collegelostandfound.backend.entity.LostItem;
import com.collegelostandfound.backend.entity.User;
import com.collegelostandfound.backend.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.math.BigDecimal;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@collegelostandfound.edu}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    @Async
    public void sendMatchNotificationEmail(User recipient, LostItem lostItem, FoundItem foundItem, BigDecimal score) {
        if (recipient == null || recipient.getEmail() == null || recipient.getEmail().isBlank()) {
            log.warn("Cannot send match email: Recipient or email is null/empty.");
            return;
        }

        String recipientEmail = recipient.getEmail().trim();
        String studentName = recipient.getStudentName() != null ? recipient.getStudentName() : "Student";
        String itemName = lostItem != null ? lostItem.getItemName() : "Item";
        String foundName = foundItem != null ? foundItem.getItemName() : "Found Item";
        String foundLocation = foundItem != null ? foundItem.getFoundLocation() : "Campus";
        String scorePercent = score != null ? score.setScale(1, java.math.RoundingMode.HALF_UP).toString() : "50.0";
        String matchLink = frontendUrl + "/matches/lost/" + (lostItem != null ? lostItem.getId() : "");

        log.info("Sending Smart Match alert email to {} for lost item '{}' matched with found item '{}' (Score: {}%)",
                recipientEmail, itemName, foundName, scorePercent);

        if (mailSender == null) {
            log.info("[SIMULATED EMAIL - Configure spring.mail.* in application.properties to send live emails]");
            log.info("To: {}\nSubject: Smart Match Alert: Potential match found for your {}\nLink: {}",
                    recipientEmail, itemName, matchLink);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(recipientEmail);
            helper.setSubject("Smart Match Alert: Potential match found for your " + itemName + " (" + scorePercent + "%)");

            String htmlBody = """
                <!DOCTYPE html>
                <html>
                <head>
                  <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; margin: 0; padding: 24px; background-color: #f8fafc; }
                    .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                    .badge { display: inline-block; background: #89ecb0; color: #065f46; font-weight: 700; font-size: 13px; padding: 4px 12px; border-radius: 9999px; margin-bottom: 16px; }
                    h2 { color: #1e293b; margin: 0 0 12px 0; font-size: 22px; }
                    p { color: #475569; font-size: 15px; line-height: 1.5; margin: 0 0 16px 0; }
                    .match-box { background: #f0f5fe; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin: 20px 0; }
                    .match-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
                    .btn { display: inline-block; background: #3e79ea; color: #ffffff !important; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin-top: 12px; text-align: center; }
                    .footer { font-size: 12px; color: #94a3b8; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px; }
                  </style>
                </head>
                <body>
                  <div class="card">
                    <span class="badge">&#10024; %s%% SMART MATCH FOUND</span>
                    <h2>Good news, %s!</h2>
                    <p>Our automated campus recovery system has identified a high-confidence match for the item you reported lost: <strong>%s</strong>.</p>
                    
                    <div class="match-box">
                      <div class="match-row"><strong>Found Item:</strong> <span>%s</span></div>
                      <div class="match-row"><strong>Campus Location:</strong> <span>%s</span></div>
                      <div class="match-row"><strong>Match Confidence:</strong> <span>%s%%</span></div>
                    </div>

                    <p>Please review the match details and submit a verification claim if this item belongs to you:</p>
                    <a href="%s" class="btn">View Match &amp; Submit Claim</a>

                    <div class="footer">
                      <p>College Lost &amp; Found Portal • Automated Campus Alert</p>
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(scorePercent, studentName, itemName, foundName, foundLocation, scorePercent, matchLink);

            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Match alert email successfully sent to {}", recipientEmail);
        } catch (Exception e) {
            log.error("Failed to send match alert email to {}: {}", recipientEmail, e.getMessage());
        }
    }

    @Override
    @Async
    public void sendPasswordResetEmail(User recipient, String resetToken, String resetUrl) {
        if (recipient == null || recipient.getEmail() == null || recipient.getEmail().isBlank()) {
            log.warn("Cannot send password reset email: Recipient or email is null/empty.");
            return;
        }

        String recipientEmail = recipient.getEmail().trim();
        String studentName = recipient.getStudentName() != null ? recipient.getStudentName() : "Student";
        String link = (resetUrl != null && !resetUrl.isBlank()) ? resetUrl : (frontendUrl + "/reset-password?token=" + resetToken);

        log.info("Password reset requested for {} (token omitted from logs for security)", recipientEmail);
        if (mailSender == null) {
            log.info("[SIMULATED EMAIL - Reset Password]\nTo: {}\nSubject: Password Reset Request\nReset Link: {} (token omitted from logs)",
                    recipientEmail, link);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(recipientEmail);
            helper.setSubject("Password Reset Request - College Lost & Found");

            String htmlBody = """
                <!DOCTYPE html>
                <html>
                <head>
                  <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; margin: 0; padding: 24px; background-color: #f8fafc; }
                    .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                    .badge { display: inline-block; background: #e0e7ff; color: #3730a3; font-weight: 700; font-size: 13px; padding: 4px 12px; border-radius: 9999px; margin-bottom: 16px; }
                    h2 { color: #1e293b; margin: 0 0 12px 0; font-size: 22px; }
                    p { color: #475569; font-size: 15px; line-height: 1.5; margin: 0 0 16px 0; }
                    .token-box { background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 14px; margin: 20px 0; font-family: monospace; font-size: 15px; text-align: center; letter-spacing: 1px; color: #0f172a; word-break: break-all; }
                    .btn { display: inline-block; background: #3e79ea; color: #ffffff !important; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin-top: 12px; text-align: center; }
                    .footer { font-size: 12px; color: #94a3b8; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px; }
                  </style>
                </head>
                <body>
                  <div class="card">
                    <span class="badge">&#128274; PASSWORD RESET</span>
                    <h2>Hello %s,</h2>
                    <p>We received a request to reset the password for your College Lost &amp; Found account. Click the button below to set a new password:</p>
                    
                    <a href="%s" class="btn">Reset Password</a>

                    <p style="margin-top: 20px; font-size: 13px;">Or copy and paste your reset token manually if prompted:</p>
                    <div class="token-box">%s</div>

                    <p style="font-size: 13px; color: #64748b;">This link and token will expire in 30 minutes. If you did not request this change, you can safely ignore this email.</p>

                    <div class="footer">
                      <p>College Lost &amp; Found Portal • Secure Authentication System</p>
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(studentName, link, resetToken);

            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Password reset email sent to {}", recipientEmail);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", recipientEmail, e.getMessage());
        }
    }
}
