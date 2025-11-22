package com.livemart.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "Users")
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Enumerated(EnumType.STRING)
    private RoleType role;

    private String shopName;
    private String location;

    // --- JPA Relationships ---

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL)
    @JsonIgnore // 3. BREAK THE LOOP HERE
    private List<Order> placedOrders;

    @OneToMany(mappedBy = "retailer", cascade = CascadeType.ALL)
    @JsonIgnore // 4. BREAK THE LOOP HERE
    private List<RetailerInventory> managedInventory;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL)
    @JsonIgnore // 5. BREAK THE LOOP HERE
    private List<Feedback> givenFeedback;
}