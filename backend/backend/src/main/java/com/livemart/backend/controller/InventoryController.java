package com.livemart.backend.controller;

import com.livemart.backend.entity.*;
import com.livemart.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

@RestController
@RequestMapping("/inventory")
public class InventoryController {

    @Autowired private InventoryRepository inventoryRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ProductRepository productRepository;

    // DTO for Request
    public static class InventoryRequest {
        public Long retailerId;
        public Long productId;
        public double price;
        public int stock;
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToInventory(@RequestBody InventoryRequest req) {
        
        Optional<RetailerInventory> existingOpt = inventoryRepository
                .findByRetailerIdAndProductId(req.retailerId, req.productId);

        if (existingOpt.isPresent()) {
            RetailerInventory existing = existingOpt.get();
            existing.setStock(existing.getStock() + req.stock);
            existing.setPrice(req.price);
            inventoryRepository.save(existing);
            return ResponseEntity.ok("Inventory updated");
        } else {
            // Fetch Entities
            User retailer = userRepository.findById(req.retailerId)
                .orElseThrow(() -> new RuntimeException("Retailer not found"));
            Product product = productRepository.findById(req.productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

            RetailerInventory newInv = new RetailerInventory();
            newInv.setRetailer(retailer); // Set Object
            newInv.setProduct(product);   // Set Object
            newInv.setPrice(req.price);
            newInv.setStock(req.stock);
            
            inventoryRepository.save(newInv);
            return ResponseEntity.ok("Added to inventory");
        }
    }

    @GetMapping("/retailer/{retailerId}")
    public ResponseEntity<?> getInventory(@PathVariable Long retailerId) {
        return ResponseEntity.ok(inventoryRepository.findByRetailerId(retailerId));
    }
}