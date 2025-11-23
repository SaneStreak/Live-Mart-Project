package com.livemart.backend.controller;

import com.livemart.backend.entity.User;
import com.livemart.backend.service.UserService;
import com.livemart.backend.repository.UserRepository; 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.livemart.backend.service.EmailService;

import java.util.HashMap; // 🟢 Import HashMap
import java.util.Map;     // 🟢 Import Map
import java.util.Optional;
import java.util.Random;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired private UserRepository userRepository;
    @Autowired private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // 🟢 FIX: Define otpStorage (Simple In-Memory Storage)
    private static final Map<String, String> otpStorage = new HashMap<>();

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        try {
            userService.registerNewUser(user); 
            return ResponseEntity.ok("Signup successful");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        Optional<User> userOpt = userRepository.findByEmail(loginRequest.getEmail());

        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid email");
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body("Incorrect password");
        }

        return ResponseEntity.ok(user);
    }

    // 🟢 Send OTP Endpoint
   @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        
        // Validation: Check if user exists. If not, throw exception.
        // We don't need to store the 'User' object in a variable if we aren't using it.
        if (!userRepository.findByEmail(email).isPresent()) {
             return ResponseEntity.badRequest().body("User not found with this email");
        }

        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        
        // Store in memory
        otpStorage.put(email, otp);

        // Send Email
        emailService.sendOtpEmail(email, otp);

        return ResponseEntity.ok("OTP sent to your email");
    }

    // 🟢 Verify OTP Endpoint
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String otp = payload.get("otp");

        if (otpStorage.containsKey(email) && otpStorage.get(email).equals(otp)) {
            otpStorage.remove(email); // Clear OTP after use
            
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            return ResponseEntity.ok(user); // Login successful!
        } else {
            return ResponseEntity.badRequest().body("Invalid OTP");
        }
    }
}