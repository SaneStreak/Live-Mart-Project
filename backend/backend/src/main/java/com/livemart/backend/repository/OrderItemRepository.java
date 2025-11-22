package com.livemart.backend.repository;

import com.livemart.backend.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    // Corrected naming: "Order" (field in OrderItem) + "OrderId" (field in Order entity)
    List<OrderItem> findByOrderOrderId(Long orderId); 
}