package com.livemart.backend.controller;

import com.livemart.backend.entity.Feedback;
import com.livemart.backend.entity.Order;
import com.livemart.backend.entity.Product;
import com.livemart.backend.entity.User;
import com.livemart.backend.repository.FeedbackRepository;
import com.livemart.backend.repository.OrderRepository;
import com.livemart.backend.repository.ProductRepository;
import com.livemart.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/feedback")
public class FeedbackController {

    @Autowired private FeedbackRepository feedbackRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private OrderRepository orderRepository;

    public static class FeedbackRequest {
        public Long productId;
        public Long customerId;
        public Long orderId;
        public int rating;
        public String comment;
    }

    @PostMapping("/add")
    public ResponseEntity<?> addFeedback(@RequestBody FeedbackRequest req) {
        if (req.productId == null || req.customerId == null) {
            return ResponseEntity.badRequest().body("productId and customerId are required");
        }
        try {
            Product product = productRepository.findById(req.productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));
            User customer = userRepository.findById(req.customerId)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));

            Feedback feedback = new Feedback();
            feedback.setProduct(product);
            feedback.setCustomer(customer);
            feedback.setRating(req.rating);
            feedback.setComment(req.comment);

            if (req.orderId != null) {
                Order order = orderRepository.findById(req.orderId)
                        .orElseThrow(() -> new RuntimeException("Order not found"));
                feedback.setOrder(order);
            }

            feedbackRepository.save(feedback);
            return ResponseEntity.ok("Feedback submitted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getFeedbackForProduct(@PathVariable Long productId) {
        List<Feedback> list = feedbackRepository.findByProduct_Id(productId);
        return ResponseEntity.ok(list);
    }

    // 🟢 FIXED: Matches the Repository @Query name (findByRetailerId)
    @GetMapping("/retailer/{retailerId}")
    public ResponseEntity<?> getRetailerFeedback(@PathVariable Long retailerId) {
        List<Feedback> list = feedbackRepository.findByRetailerId(retailerId);
        return ResponseEntity.ok(list);
    }
}