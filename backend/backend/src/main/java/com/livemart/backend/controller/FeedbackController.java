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

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    // DTO: Represents the JSON coming from the frontend
    public static class FeedbackRequest {
        public Long productId;
        public Long customerId;
        public Long orderId; // Can be null if not linked to specific order
        public int rating;
        public String comment;
    }

    // ------------------------
    // POST /feedback/add
    // ------------------------
    @PostMapping("/add")
    public ResponseEntity<?> addFeedback(@RequestBody FeedbackRequest req) {

        // 1. Validate Basic Inputs
        if (req.productId == null || req.customerId == null) {
            return ResponseEntity.badRequest().body("productId and customerId are required");
        }

        if (req.rating < 1 || req.rating > 5) {
            return ResponseEntity.badRequest().body("Rating must be between 1 and 5");
        }

        try {
            // 2. Fetch Real Entities from Database
            Product product = productRepository.findById(req.productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            User customer = userRepository.findById(req.customerId)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));

            // 3. Create Feedback Object
            Feedback feedback = new Feedback();
            feedback.setProduct(product);
            feedback.setCustomer(customer);
            feedback.setRating(req.rating);
            feedback.setComment(req.comment);

            // 4. Handle Optional Order Link
            if (req.orderId != null) {
                Order order = orderRepository.findById(req.orderId)
                        .orElseThrow(() -> new RuntimeException("Order not found"));
                feedback.setOrder(order);
            }

            // 5. Save
            feedbackRepository.save(feedback);
            return ResponseEntity.ok("Feedback submitted successfully");

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // ------------------------
    // GET /feedback/product/{productId}
    // ------------------------
    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getFeedbackForProduct(@PathVariable Long productId) {
        // FIXED: Updated method name to match Repository
        List<Feedback> list = feedbackRepository.findByProduct_Id(productId);
        return ResponseEntity.ok(list);
    }
    @GetMapping("/retailer/{retailerId}")
    public ResponseEntity<?> getRetailerFeedback(@PathVariable Long retailerId) {
        // This relies on the new Repository method
        List<Feedback> list = feedbackRepository.findByOrder_Retailer_Id(retailerId);
        return ResponseEntity.ok(list);
    }
}