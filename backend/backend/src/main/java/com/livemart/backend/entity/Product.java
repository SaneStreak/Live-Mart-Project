package com.livemart.backend.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "Products")
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Getter is getId()

    private String name;
    private String description;
    private String image;
    private String category;
    
    // 🟢 ADD THIS MISSING FIELD
    private Double basePrice; // Getter is getBasePrice()

    @Column(name = "createdAt")
    private LocalDateTime createdAt;
}