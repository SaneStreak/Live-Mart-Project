package com.livemart.backend.repository;

import com.livemart.backend.entity.RetailerInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface InventoryRepository extends JpaRepository<RetailerInventory, Long> { // Changed Integer to Long

    List<RetailerInventory> findByRetailerId(Long retailerId); // Changed int to Long

    // Check if retailer already has this product
   // In InventoryRepository.java
    // Change return type to Optional
    Optional<RetailerInventory> findByRetailerIdAndProductId(Long retailerId, Long productId);
}