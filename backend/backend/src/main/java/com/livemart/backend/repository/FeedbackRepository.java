package com.livemart.backend.repository;

import com.livemart.backend.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    
    // Keep this for the Product Details page
    List<Feedback> findByProduct_Id(Long productId);

    // 🟢 USE THIS: Custom Query to safely find feedback for a specific Retailer
    // This manually joins Feedback -> Order -> Retailer to get the right data
    @Query("SELECT f FROM Feedback f WHERE f.order.retailer.id = :retailerId")
    List<Feedback> findByRetailerId(@Param("retailerId") Long retailerId);
}