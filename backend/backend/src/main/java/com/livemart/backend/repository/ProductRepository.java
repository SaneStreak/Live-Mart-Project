package com.livemart.backend.repository;

import com.livemart.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> { // Changed Integer to Long
    // You can add findByNameContaining(String keyword) here later for search!
    // In ProductRepository.java
    List<Product> findByNameContainingIgnoreCase(String name);
}