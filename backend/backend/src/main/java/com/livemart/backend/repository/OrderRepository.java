package com.livemart.backend.repository;

import com.livemart.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> { // Changed Integer to Long

    // Spring automatically maps "CustomerId" to "Customer.id"
    List<Order> findByCustomerId(Long customerId); // Changed int to Long

    List<Order> findByRetailerId(Long retailerId); // Changed int to Long
}