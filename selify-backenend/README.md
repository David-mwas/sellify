<div align="center">

# Selify API Documentation

</div>

## Getting started

1. clone the respository
   ```shell
   $ git clone https://github.com/David-mwas/selify-backenend.git
   $ cd zentalk-backend
   $ touch .env
   ```
2. Add the following variables to the .env file
   ```
   PORT = [port your that your will run on]
   mongoDbUrl = [mongodburl]
   mongoDbName = [name of the database]
   AccessTokenSecretKey = [random string ]
   AccessTokenExpires = [the time before which the access token should expire eg 1h or 1d or 7d]
   frontendUrl=http://localhost:5173
   gmailUser=your_email@gmail.com
   gmailPass=your_email_password
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   ```

## Introduction

Selify API provides endpoints for:

- User authentication
- Profile management
- Product and category management
- Messaging

This documentation will guide you through using the API effectively.

---

## Base URL

The API base URL is:

```
http://localhost:5000/api/v1
```

---

## Authentication Routes

### 1. Register a User

**Endpoint:** `POST /auth/register`  
**Description:** Register a new user.  
**Request Body:**

```json
{
  "username": "example",
  "email": "example@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "message": "User registered successfully",
  "data": { ...userDetails }
}
```

---

### 2. Login a User

**Endpoint:** `POST /auth/login`  
**Description:** Authenticate and get an access token.  
**Request Body:**

```json
{
  "email": "example@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "token": "JWT_ACCESS_TOKEN"
}
```

---

### 3. Forgot Password

**Endpoint:** `POST /auth/forget-password`  
**Description:** Request a password reset link.  
**Request Body:**

```json
{
  "email": "example@example.com"
}
```

**Response:**

```json
{
  "message": "Password reset email sent"
}
```

---

### 4. Reset Password

**Endpoint:** `POST /auth/reset-password`  
**Description:** Reset user password.  
**Request Body:**

```json
{
  "token": "RESET_TOKEN",
  "password": "newPassword123"
}
```

**Response:**

```json
{
  "message": "Password updated successfully"
}
```

---

## User Routes

### 1. Get User Profile

**Endpoint:** `GET /user/profile`  
**Description:** Fetch logged-in user profile.  
**Headers:**

```json
{
  "Authorization": "Bearer JWT_ACCESS_TOKEN"
}
```

**Response:**

```json
{
  "message": "User profile fetched successfully",
  "data": { ...userProfile }
}
```

---

### 2. Edit User Profile

**Endpoint:** `POST /user/edit-profile`  
**Description:** Update user profile information.  
**Headers:**

```json
{
  "Authorization": "Bearer JWT_ACCESS_TOKEN"
}
```

**Request Body:**

```json
{
  "username": "newUsername",
  "email": "new@example.com"
}
```

**Response:**

```json
{
  "message": "Profile updated successfully",
  "data": { ...updatedUserProfile }
}
```

---

## Product Routes

### 1. Get All Products

**Endpoint:** `GET /products`  
**Description:** Retrieve all products.  
**Response:**

```json
{
  "message": "Products fetched successfully",
  "data": [ ...products ]
}
```

---

### 2. Get Product by ID

**Endpoint:** `GET /products/:id`  
**Description:** Retrieve a single product by its ID.  
**Response:**

```json
{
  "message": "Product fetched successfully",
  "data": { ...productDetails }
}
```

---

### 3. Create a Product

**Endpoint:** `POST /products`  
**Description:** Add a new product.  
**Headers:**

```json
{
  "Authorization": "Bearer JWT_ACCESS_TOKEN"
}
```

**Request Body:**

```json
{
  "name": "Product Name",
  "price": 100,
  "category": "categoryId",
  "images": [ ...imageFiles ]
}
```

**Response:**

```json
{
  "message": "Product created successfully",
  "data": { ...newProduct }
}
```

---

## Category Routes

### 1. Get All Categories

**Endpoint:** `GET /category`  
**Description:** Retrieve all categories.  
**Response:**

```json
{
  "message": "Categories fetched successfully",
  "data": [ ...categories ]
}
```

---

### 2. Create a Category

**Endpoint:** `POST /category`  
**Description:** Add a new category.  
**Request Body:**

```json
{
  "name": "Category Name"
}
```

**Response:**

```json
{
  "message": "Category created successfully",
  "data": { ...newCategory }
}
```

---

## Messaging Routes

### 1. Send a Message

**Endpoint:** `POST /messages/send`  
**Description:** Send a message to a user.  
**Request Body:**

```json
{
  "message": "Hello!",
  "sender": "userId",
  "receiver": "userId"
}
```

**Response:**

```json
{
  "message": "Message sent",
  "data": { ...messageDetails }
}
```

---

### 2. Get Messages Between Two Users

**Endpoint:** `GET /messages`  
**Description:** Fetch all messages exchanged between two users.  
**Query Parameters:**

```
?sender=userId&receiver=userId
```

**Response:**

```json
{
  "messages": [ ...messages ]
}
```

---

## WebSocket Events

### 1. Join Room

**Event:** `join_room`  
**Description:** Join a chat room.  
**Payload:**

```json
{
  "roomId": "roomId"
}
```

### 2. Send Message

**Event:** `send_message`  
**Description:** Send a real-time message.  
**Payload:**

```json
{
  "message": "Hello!",
  "sender": "userId",
  "receiver": "userId"
}
```

<!-- ## License -->

<!-- This project is licensed under the MIT License. -->
