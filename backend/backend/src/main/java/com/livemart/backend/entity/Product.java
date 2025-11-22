package com.livemart.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties; // 1. Add Import

@Entity
@Table(name = "Products")
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) // 2. Add this line
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private String image;
    private String category;

    @Column(name = "createdAt")
    private LocalDateTime createdAt; // optional, based on schema
}
