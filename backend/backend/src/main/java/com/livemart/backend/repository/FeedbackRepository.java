package com.livemart.backend.repository;

import com.livemart.backend.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByProduct_Id(Long productId);
    List<Feedback> findByOrder_Retailer_Id(Long retailerId);
}
