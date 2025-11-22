package com.livemart.backend.controller;

import com.livemart.backend.entity.Product;
import com.livemart.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    // GET all products
    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // GET product by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.badRequest().build());
    }

    // 🟢 NEW: Add a Product (e.g., Admin or Wholesaler would do this)
    @PostMapping("/add")
    public ResponseEntity<?> addProduct(@RequestBody Product product) {
        try {
            // Optional: Set default image if none provided
            if (product.getImage() == null || product.getImage().isEmpty()) {
                product.setImage("https://via.placeholder.com/150");
            }
            // Set created time
            product.setCreatedAt(LocalDateTime.now());
            
            Product savedProduct = productRepository.save(product);
            return ResponseEntity.ok(savedProduct);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error saving product: " + e.getMessage());
        }
    }
}