package com.livemart.backend.controller;

import com.livemart.backend.entity.*;
import com.livemart.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional; 
import com.livemart.backend.service.EmailService;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired private OrderRepository orderRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private InventoryRepository inventoryRepository; 
    @Autowired private EmailService emailService;

    // DTO classes
    public static class OrderItemRequest {
        public Long productId;
        public int quantity;
        public double priceAtPurchase;
    }

    public static class OrderRequest {
        public Long customerId;
        public Long retailerId;
        public double totalAmount;
        public String paymentMode;
        public List<OrderItemRequest> items;
    }

    @PostMapping("/create")
    @Transactional 
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest req) {
        // ... (Your existing create logic is here) ...
        
        // 1. Validate User & Retailer
        User customer = userRepository.findById(req.customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        User retailer = userRepository.findById(req.retailerId)
                .orElseThrow(() -> new RuntimeException("Retailer not found"));

        // 2. Create the Order Object
        Order order = new Order();
        order.setCustomer(customer);
        order.setRetailer(retailer);
        order.setTotalAmount(req.totalAmount);
        order.setPaymentMode(req.paymentMode);
        order.setOrderStatus("placed");

        List<OrderItem> orderItems = new ArrayList<>();

        // 3. Process Each Item & Update Stock
        for (OrderItemRequest itemReq : req.items) {
            Product product = productRepository.findById(itemReq.productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            // --- STOCK CHECK LOGIC ---
            RetailerInventory inventory = inventoryRepository
                    .findByRetailerIdAndProductId(req.retailerId, itemReq.productId)
                    .orElseThrow(() -> new RuntimeException("Product not available in this shop"));

            if (inventory.getStock() < itemReq.quantity) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }

            // DEDUCT STOCK
            inventory.setStock(inventory.getStock() - itemReq.quantity);
            inventoryRepository.save(inventory);

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setOrder(order);
            orderItem.setQuantity(itemReq.quantity);
            orderItem.setPriceAtPurchase(itemReq.priceAtPurchase);
            
            orderItems.add(orderItem);
        }

        order.setItems(orderItems);
        orderRepository.save(order);

        new Thread(() -> {
            emailService.sendOrderConfirmation(customer.getEmail(), order.getOrderId(), order.getTotalAmount());
        }).start();

        return ResponseEntity.ok("Order placed successfully. ID: " + order.getOrderId());
    }

    // GET endpoints
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<?> getOrdersByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(orderRepository.findByCustomerId(customerId));
    }
    
    @GetMapping("/retailer/{retailerId}")
    public ResponseEntity<?> getOrdersByRetailer(@PathVariable Long retailerId) {
        return ResponseEntity.ok(orderRepository.findByRetailerId(retailerId));
    }

   @PutMapping("/update-status/{orderId}")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long orderId, @RequestParam String status) {
        return orderRepository.findById(orderId).map(order -> {
            // 1. Update Status
            order.setOrderStatus(status);
            orderRepository.save(order);

            // 2. Prepare Email Data (Extract BEFORE starting thread to avoid LazyInitException)
            String customerEmail = order.getCustomer().getEmail();
            Long oId = order.getOrderId();
            String newStatus = status; // effectively final for lambda

            System.out.println("Attempting to send email to: " + customerEmail + " for status: " + newStatus);

            // 3. Send Email in Background
            if (customerEmail != null && !customerEmail.isEmpty()) {
                new Thread(() -> {
                    try {
                        emailService.sendOrderStatusUpdate(customerEmail, oId, newStatus);
                    } catch (Exception e) {
                        System.err.println("Thread Error sending email: " + e.getMessage());
                        e.printStackTrace();
                    }
                }).start();
            } else {
                System.err.println("Skipping email: Customer email is null/empty");
            }

            return ResponseEntity.ok("Order status updated to " + status);
        }).orElse(ResponseEntity.notFound().build());
    }
} // <--- End of Class