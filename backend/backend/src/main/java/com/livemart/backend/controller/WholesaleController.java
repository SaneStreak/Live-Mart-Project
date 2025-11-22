package com.livemart.backend.controller;

import com.livemart.backend.entity.*;
import com.livemart.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/wholesale")
public class WholesaleController {

    @Autowired private WholesaleOrderRepository wholesaleOrderRepository;
    @Autowired private InventoryRepository inventoryRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private UserRepository userRepository;

    // 1. Retailer Places a Request
    @PostMapping("/request")
    public ResponseEntity<?> requestStock(@RequestBody WholesaleRequestDTO req) {
        User retailer = userRepository.findById(req.retailerId)
                .orElseThrow(() -> new RuntimeException("Retailer not found"));
        Product product = productRepository.findById(req.productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        WholesaleOrder order = new WholesaleOrder();
        order.setRetailer(retailer);
        order.setProduct(product);
        order.setQuantity(req.quantity);
        order.setStatus("PENDING");

        wholesaleOrderRepository.save(order);
        return ResponseEntity.ok("Stock request sent to Wholesaler");
    }

    // 2. Wholesaler Approves Request -> Updates Retailer Inventory
    @PutMapping("/approve/{orderId}")
    @Transactional
    public ResponseEntity<?> approveRequest(@PathVariable Long orderId) {
        WholesaleOrder order = wholesaleOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!"PENDING".equals(order.getStatus())) {
            return ResponseEntity.badRequest().body("Order is already processed");
        }

        // A. Update Order Status
        order.setStatus("APPROVED");
        wholesaleOrderRepository.save(order);

        // B. Update Retailer Inventory
        // Check if retailer already has this item
        Optional<RetailerInventory> existingInv = inventoryRepository
                .findByRetailerIdAndProductId(order.getRetailer().getId(), order.getProduct().getId());

        if (existingInv.isPresent()) {
            RetailerInventory inv = existingInv.get();
            inv.setStock(inv.getStock() + order.getQuantity());
            inventoryRepository.save(inv);
        } else {
            // Create new inventory entry if it doesn't exist
            RetailerInventory newInv = new RetailerInventory();
            newInv.setRetailer(order.getRetailer());
            newInv.setProduct(order.getProduct());
            newInv.setStock(order.getQuantity());
            newInv.setPrice(order.getProduct().getBasePrice() * 1.2); // Default markup 20%
            inventoryRepository.save(newInv);
        }

        return ResponseEntity.ok("Request Approved & Inventory Updated!");
    }

    // 3. Get Requests
    @GetMapping("/pending")
    public List<WholesaleOrder> getPendingRequests() {
        return wholesaleOrderRepository.findByStatus("PENDING");
    }
    
    @GetMapping("/retailer/{retailerId}")
    public List<WholesaleOrder> getRetailerRequests(@PathVariable Long retailerId) {
        return wholesaleOrderRepository.findByRetailerId(retailerId);
    }

    // DTO
    public static class WholesaleRequestDTO {
        public Long retailerId;
        public Long productId;
        public int quantity;
    }
}