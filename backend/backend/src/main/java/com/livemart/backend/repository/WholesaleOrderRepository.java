package com.livemart.backend.repository;

import com.livemart.backend.entity.WholesaleOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WholesaleOrderRepository extends JpaRepository<WholesaleOrder, Long> {
    List<WholesaleOrder> findByRetailerId(Long retailerId);
    List<WholesaleOrder> findByStatus(String status); // For Wholesaler to see Pending ones
}
