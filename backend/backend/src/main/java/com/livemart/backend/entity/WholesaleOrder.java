package com.livemart.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "wholesale_orders")
@Data
public class WholesaleOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "retailer_id")
    @JsonIgnoreProperties({"password", "orders", "inventory"})
    private User retailer;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    private int quantity;
    private String status; // PENDING, APPROVED, REJECTED
    private LocalDateTime createdAt = LocalDateTime.now();
}