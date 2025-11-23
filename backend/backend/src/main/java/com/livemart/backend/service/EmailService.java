package com.livemart.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOrderConfirmation(String toEmail, Long orderId, double amount) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply.livemart@gmail.com");
            message.setTo(toEmail);
            message.setSubject("Order Confirmation - LiveMART Order #" + orderId);
            message.setText("Dear Customer,\n\n" +
                    "Thank you for shopping with LiveMART!\n" +
                    "Your order #" + orderId + " has been successfully placed.\n" +
                    "Total Amount: ₹" + amount + "\n\n" +
                    "We will notify you when your items are packed.\n\n" +
                    "Best Regards,\nTeam LiveMART");

            mailSender.send(message);
            System.out.println("Email sent to " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }

    public void sendOrderStatusUpdate(String toEmail, Long orderId, String newStatus) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply.livemart@gmail.com");
            message.setTo(toEmail);
            
            // Subject Line
            String subject = "Order Update: Order #" + orderId + " is now " + newStatus;
            message.setSubject(subject);
            
            // Body Content
            StringBuilder body = new StringBuilder();
            body.append("Dear Customer,\n\n");
            
            if ("PACKED".equalsIgnoreCase(newStatus)) {
                body.append("Good news! Your order has been packed and is ready for dispatch.\n");
                body.append("Our delivery partner will be assigned shortly.");
            } else if ("DELIVERED".equalsIgnoreCase(newStatus)) {
                body.append("Your order has been delivered successfully! 🎉\n");
                body.append("Thank you for shopping with LiveMART.");
            } else {
                body.append("Your order status has been updated to: ").append(newStatus);
            }
            
            body.append("\n\nBest Regards,\nTeam LiveMART");
            message.setText(body.toString());

            mailSender.send(message);
            System.out.println("✅ Status Email sent successfully to " + toEmail);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to send status email: " + e.getMessage());
            e.printStackTrace(); // Print full error to console
        }
    }
    public void sendOtpEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply.livemart@gmail.com");
            message.setTo(toEmail);
            message.setSubject("LiveMART Login OTP");
            message.setText("Your One-Time Password (OTP) for login is: " + otp + 
                            "\n\nDo not share this with anyone.\n\nExpires in 5 minutes.");
            mailSender.send(message);
            System.out.println("OTP Email sent to " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send OTP email: " + e.getMessage());
        }
    }
}