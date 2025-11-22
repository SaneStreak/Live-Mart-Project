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
}