Got you — here is the **FULL BACKEND HANDOVER GUIDE in pure text**, no PDF.

Copy-paste this to your teammates or Notion.

---

# 🟦 **LiveMart — Backend Handover & Setup Guide (FULL TEXT VERSION)**

**For Teammates — How to run, test, and continue backend & frontend work**

---

# ⭐ OVERVIEW

This document explains:

* What is already completed in the backend
* How to install everything
* How to set up the database
* How to run the backend on your own laptop
* Full backend API summary
* What to do next for frontend
* Troubleshooting instructions

---

# 🟦 **1. Tools & Software Required**

Every teammate MUST install these:

### **Backend Requirements**

✔ Java 17 (NOT Java 24)
✔ IntelliJ IDEA Community Edition
✔ MySQL Server 8.x
✔ DataGrip **or** MySQL Workbench
✔ Git
✔ Postman (optional for API testing)

### **Frontend Requirements**

✔ Node.js + npm
✔ A terminal (Powershell / CMD)

---

# 🟦 **2. Database Setup (MySQL)**

### Step 1 — Open DataGrip or MySQL Workbench

### Step 2 — Create the database:

```sql
CREATE DATABASE livemart;
```

### Step 3 — Create the 6 required tables

Run the SQL schema (the same one we used during development):

**Copy paste this:**

-- LiveMart Database Schema (As per Tab 3)
-- Minimal 6-table schema designed exactly for your OOP project requirements
-- MySQL version

-- =====================
-- 1. USERS TABLE
-- =====================
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'retailer', 'wholesaler') NOT NULL,

    shopName VARCHAR(150),        -- only for retailer/wholesaler
    shopAddress VARCHAR(255),     -- only for retailer/wholesaler

    location VARCHAR(255),        -- could store lat,long as string or JSON

    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =====================
-- 2. PRODUCTS TABLE
-- =====================
CREATE TABLE Products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    category VARCHAR(100),

    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =====================
-- 3. RETAILER INVENTORY TABLE
-- =====================
-- This table maps retailers to the products they sell
CREATE TABLE RetailerInventory (
    inventoryId INT AUTO_INCREMENT PRIMARY KEY,

    retailerId INT NOT NULL,
    productId INT NOT NULL,

    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL,

    FOREIGN KEY (retailerId) REFERENCES Users(id),
    FOREIGN KEY (productId) REFERENCES Products(id)
);


-- =====================
-- 4. ORDERS TABLE
-- =====================
CREATE TABLE Orders (
    orderId INT AUTO_INCREMENT PRIMARY KEY,

    customerId INT NOT NULL,
    retailerId INT NOT NULL,

    totalAmount DECIMAL(10,2) NOT NULL,
    paymentMode ENUM('online', 'offline') NOT NULL,
    orderStatus VARCHAR(50) DEFAULT 'placed',   -- placed, shipped, done etc.

    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customerId) REFERENCES Users(id),
    FOREIGN KEY (retailerId) REFERENCES Users(id)
);


-- =====================
-- 5. ORDER ITEMS TABLE
-- =====================
-- Each row = one product inside an order
CREATE TABLE OrderItems (
    orderItemId INT AUTO_INCREMENT PRIMARY KEY,

    orderId INT NOT NULL,
    productId INT NOT NULL,

    quantity INT NOT NULL,
    priceAtPurchase DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (orderId) REFERENCES Orders(orderId),
    FOREIGN KEY (productId) REFERENCES Products(id)
);


-- =====================
-- 6. FEEDBACK TABLE
-- =====================
CREATE TABLE Feedback (
    feedbackId INT AUTO_INCREMENT PRIMARY KEY,

    productId INT NOT NULL,
    customerId INT NOT NULL,
    orderId INT NOT NULL,

    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,

    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (productId) REFERENCES Products(id),
    FOREIGN KEY (customerId) REFERENCES Users(id),
    FOREIGN KEY (orderId) REFERENCES Orders(orderId)
);

**Copy paste till here**

Tables created:

1. **Users**
2. **Products**
3. **RetailerInventory**
4. **Orders**
5. **OrderItems**
6. **Feedback**

If you don’t have the SQL, I can regenerate it anytime.

---

# 🟦 **3. Spring Boot Backend Setup**

### Step 1 — Clone the backend repo:

```
git clone <repo-url>
```

### Step 2 — Open the project in IntelliJ

### Step 3 — Install Java 17 (important)

### Step 4 — Configure database connection

Open:

```
src/main/resources/application.properties
```

Put your own MySQL username & password:

```
spring.datasource.url=jdbc:mysql://localhost:3306/livemart
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD

spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=true
```

### Step 5 — Run the backend

Use the green ▶️ button in IntelliJ.

If everything is correct, you’ll see:

```
Tomcat started on port 8080
```

Backend is live at:

```
http://localhost:8080
```

---

# 🟦 **4. What Has Been Implemented (Backend Summary)**

This backend is **100% complete**.

The following components exist:

---

## ✔ 4.1 Database Schema

`livemart` schema with the 6 required tables.

---

## ✔ 4.2 Spring Boot Project with Dependencies

Installed:

* Spring Web
* Spring Data JPA
* MySQL Driver
* Lombok
* Spring DevTools

---

## ✔ 4.3 JPA Entities Created

Java classes matching the MySQL tables:

* `User`
* `Product`
* `RetailerInventory`
* `Order`
* `OrderItem`
* `Feedback`

---

## ✔ 4.4 Repositories Created

For database access:

* UserRepository
* ProductRepository
* InventoryRepository
* OrderRepository
* OrderItemRepository
* FeedbackRepository

All extend `JpaRepository`.

---

## ✔ 4.5 REST Controllers (COMPLETE API CONTRACT)**

### **AuthController**

* `POST /auth/signup`
* `POST /auth/login`

### **ProductController**

* `GET /products`
* `GET /products/{id}`

### **InventoryController**

* `POST /inventory/add`
* `PUT /inventory/update/{inventoryId}`
* `GET /inventory/retailer/{retailerId}`

### **OrderController**

* `POST /orders/create`
* `GET /orders/customer/{customerId}`
* `GET /orders/retailer/{retailerId}`
* `PUT /orders/update-status/{orderId}`

### **FeedbackController**

* `POST /feedback/add`
* `GET /feedback/product/{productId}`

Everything is implemented, tested, and running.

---

# 🟦 **5. How Your Teammates Should Run The Backend**

Here’s EXACTLY what they must do:

---

## ✔ Step 1 — Install Required Tools

Java 17, IntelliJ, MySQL, Git.

---

## ✔ Step 2 — Clone the repo:

```
git clone <repo-url>
```

---

## ✔ Step 3 — Create the database:

```sql
CREATE DATABASE livemart;
```

Run the SQL schema to create tables.

---

## ✔ Step 4 — Configure `application.properties`

Enter THEIR MySQL password:

```
spring.datasource.url=jdbc:mysql://localhost:3306/livemart
spring.datasource.username=root
spring.datasource.password=THEIR_PASSWORD
spring.jpa.hibernate.ddl-auto=none
```

---

## ✔ Step 5 — Run the app

Green ▶️ button in IntelliJ.

Done.

Each teammate runs the backend **locally**, on their own machine.

They DO NOT use your server.

---

# 🟦 **6. Troubleshooting**

### ❌ Error: “Could not add auto_increment column”

Fix:

```
spring.jpa.hibernate.ddl-auto=none
```

### ❌ Backend fails to run

Check Java version → must be **Java 17**

### ❌ Cannot connect to DB

Check:

* MySQL server is running
* Username/password correct
* Database “livemart” exists

### ❌ Port 8080 already in use

Change port in properties:

```
server.port=9090
```

---

# 🟦 **7. BACKEND COMPLETION SUMMARY (Use this in New Chat for Frontend)**

Copy-paste this into a fresh chat:

---

```
OOP PROJECT — BACKEND COMPLETION SUMMARY

1. Tools Installed
- Java 17 (LTS)
- IntelliJ IDEA CE
- MySQL + DataGrip
- Node.js + npm

2. Database Setup
Database: livemart
Tables: Users, Products, RetailerInventory, Orders, OrderItems, Feedback

3. Spring Boot Backend Setup
Dependencies:
- Spring Web
- Spring Data JPA
- MySQL Driver
- Lombok
- DevTools

Database config:
spring.datasource.url=jdbc:mysql://localhost:3306/livemart
spring.datasource.username=root
spring.datasource.password=****
spring.jpa.hibernate.ddl-auto=none

4. Entities: User, Product, RetailerInventory, Order, OrderItem, Feedback

5. Repositories: UserRepository, ProductRepository, InventoryRepository, OrderRepository, OrderItemRepository, FeedbackRepository

6. Controllers (API Contract Completed)
- AuthController
- ProductController
- InventoryController
- OrderController
- FeedbackController

Backend is fully complete and running on port 8080.

Start Frontend: React + Vite + Tailwind — connect to existing Spring Boot backend.
```

---

# 🟦 **8. Next Phase: Frontend (React + Vite + Tailwind)**

You will build:

* Login page
* Signup page
* Product listing
* Product details
* Dashboards
* Cart
* Order creation
* Order history
* Feedback page

We will do it **one step at a time** like backend.

---

If you want, I can generate a **Frontend Setup Guide** next.
