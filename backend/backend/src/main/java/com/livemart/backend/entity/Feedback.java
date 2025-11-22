package com.livemart.backend.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties; // Import this!

@Entity
@Table(name = "feedbacks") // Lowercase is standard for MySQL
@Data
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long feedbackId;

    // --- JPA Relationships ---

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    // FIXED: Prevents "Hibernate Proxy" errors in JSON
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) 
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    // FIXED: Prevents user details/passwords from leaking in feedback list
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "orders"})
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Order order;

    // --- Other Fields ---
    private int rating;       
    private String comment;
    
    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}