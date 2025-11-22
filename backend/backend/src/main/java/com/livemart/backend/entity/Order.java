package com.livemart.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime; // Recommended for date/time fields
import java.util.List;

@Entity
@Table(name = "Orders")
@Data
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId; // Changed to Long for consistency

    // --- JPA Relationships (Replaces int FKs) ---
    
    // Many Orders belong to one Customer
    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer; // Reference to the Customer User entity

    // Many Orders belong to one Retailer
    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "retailer_id", nullable = false)
    private User retailer; // Reference to the Retailer User entity

    // An Order is composed of many OrderItems
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items;
    
    // --- Other Fields ---
    
    private double totalAmount;

    private String paymentMode;   // online/offline
    private String orderStatus;   // placed / shipped / done

    // Use LocalDateTime for robust timestamping
    private LocalDateTime createdAt = LocalDateTime.now(); 
}