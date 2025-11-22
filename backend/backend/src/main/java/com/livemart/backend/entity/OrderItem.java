package com.livemart.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "OrderItems")
@Data
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderItemId; // Changed to Long for consistency

    // --- JPA Relationships (Replaces int FKs) ---
    
    // Many OrderItems belong to one Order
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore
    private Order order; 

    // Many OrderItems reference one Product
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product; 

    // --- Other Fields ---
    
    private int quantity;
    private double priceAtPurchase; // Retaining the price at the time of purchase
}