package com.livemart.backend.repository;

import com.livemart.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> { // Changed Integer to Long

    // Use Optional to avoid NullPointerExceptions
    Optional<User> findByEmail(String email);
}
