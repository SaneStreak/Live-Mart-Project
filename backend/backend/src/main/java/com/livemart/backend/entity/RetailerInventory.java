package com.livemart.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "RetailerInventory")
@Data
public class RetailerInventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long inventoryId; // Changed to Long for consistency

    // --- JPA Relationships (Replaces int FKs) ---

    // Many inventory records belong to one Retailer
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "retailer_id", nullable = false)
    private User retailer;

    // Many inventory records reference one Product
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // CRUCIAL LINK: Many inventory records reference one Wholesaler (for proxy visibility)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wholesaler_id") // Can be nullable if the retailer sources the product independently
    private User wholesaler; 

    // --- Other Fields ---

    private double price; // The price the Retailer sets for the Customer
    private int stock;
}
