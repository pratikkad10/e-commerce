# 🚀 E-Commerce Platform API Documentation

Base URL: `http://localhost:5000/api/v1`

---

## 📋 Table of Contents
1. [Authentication APIs](#authentication-apis)
2. [User APIs](#user-apis)
3. [Product APIs](#product-apis)
4. [Cart APIs](#cart-apis)
5. [Wishlist APIs](#wishlist-apis)
6. [Order APIs](#order-apis)
7. [Review APIs](#review-apis)
8. [Seller APIs](#seller-apis)
9. [Category & Brand APIs](#category--brand-apis)
10. [Payment APIs](#payment-apis)
11. [File Upload APIs](#file-upload-apis)
12. [AI Assistant APIs](#ai-assistant-apis)

---

## 🔐 Authentication APIs

### Register User
```
POST /auth/register
Content-Type: application/json

Body:
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "customer" // or "seller"
}
```

### Login
```
POST /auth/login
Content-Type: application/json

Body:
{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {...},
    "token": "jwt_token_here"
  }
}
```

### Logout
```
POST /auth/logout
Authorization: Bearer <token>
```

### Forgot Password
```
POST /auth/forgot-password
Content-Type: application/json

Body:
{
  "email": "john@example.com"
}
```

### Reset Password
```
POST /auth/reset-password/:token
Content-Type: application/json

Body:
{
  "password": "newPassword123"
}
```

### Verify Email
```
GET /auth/verify-email/:token
```

---

## 👤 User APIs

### Get Current User Profile
```
GET /users/profile
Authorization: Bearer <token>
```

### Update Profile
```
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "1234567890",
  "dateOfBirth": "1990-01-01"
}
```

### Change Password
```
PUT /users/change-password
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123"
}
```

### Add Address
```
POST /users/addresses
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "street": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA",
  "isDefault": true
}
```

### Get All Addresses
```
GET /users/addresses
Authorization: Bearer <token>
```

### Update Address
```
PUT /users/addresses/:id
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "street": "456 Oak Ave",
  "isDefault": false
}
```

### Delete Address
```
DELETE /users/addresses/:id
Authorization: Bearer <token>
```

---

## 🛍️ Product APIs

### Get All Products
```
GET /products?page=1&limit=10&search=jacket&category=electronics&minPrice=100&maxPrice=5000&sort=price&order=asc
```

Query Parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search term
- `category` - Category ID or slug
- `brand` - Brand ID
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `sort` - Sort field (price, createdAt, averageRating)
- `order` - Sort order (asc, desc)
- `featured` - Filter featured products (true/false)

### Get Product by ID
```
GET /products/:id
```

### Get Product by Slug
```
GET /products/slug/:slug
```

### Get Featured Products
```
GET /products/featured?limit=10
```

### Get Related Products
```
GET /products/:id/related?limit=5
```

---

## 🛒 Cart APIs

### Get Cart
```
GET /cart
Authorization: Bearer <token>
```

### Add to Cart
```
POST /cart
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "productId": "product_id_here",
  "quantity": 2,
  "variantId": "variant_id_here" // optional
}
```

### Update Cart Item
```
PUT /cart/:itemId
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "quantity": 3
}
```

### Remove from Cart
```
DELETE /cart/:itemId
Authorization: Bearer <token>
```

### Clear Cart
```
DELETE /cart
Authorization: Bearer <token>
```

---

## ❤️ Wishlist APIs

### Get Wishlist
```
GET /wishlist
Authorization: Bearer <token>
```

### Add to Wishlist
```
POST /wishlist
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "productId": "product_id_here"
}
```

### Remove from Wishlist
```
DELETE /wishlist/:productId
Authorization: Bearer <token>
```

### Clear Wishlist
```
DELETE /wishlist
Authorization: Bearer <token>
```

---

## 📦 Order APIs

### Create Order
```
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "razorpay",
  "items": [
    {
      "product": "product_id",
      "quantity": 2,
      "price": 2999
    }
  ]
}
```

### Get User Orders
```
GET /orders?page=1&limit=10&status=pending
Authorization: Bearer <token>
```

### Get Order by ID
```
GET /orders/:id
Authorization: Bearer <token>
```

### Cancel Order
```
PUT /orders/:id/cancel
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "reason": "Changed my mind"
}
```

---

## ⭐ Review APIs

### Add Review (with file upload)
```
POST /reviews
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- productId: product_id_here
- rating: 5
- title: "Amazing product!"
- comment: "This product exceeded my expectations"
- images: [file1, file2] // optional
- videos: [file1] // optional
```

### Get Product Reviews
```
GET /reviews/product/:productId?page=1&limit=10&rating=5&verified=true
```

### Get User Reviews
```
GET /reviews/user/my-reviews?page=1&limit=10
Authorization: Bearer <token>
```

### Update Review (with file upload)
```
PUT /reviews/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- rating: 4
- title: "Updated review"
- comment: "Updated comment"
- images: [file1] // optional
- videos: [file1] // optional
```

### Delete Review
```
DELETE /reviews/:id
Authorization: Bearer <token>
```

### Add Helpful Vote
```
POST /reviews/:id/helpful
Authorization: Bearer <token>
```

---

## 🏪 Seller APIs

### Get Seller Profile
```
GET /seller/profile
Authorization: Bearer <token>
Role: seller
```

### Update Seller Profile
```
PUT /seller/profile
Authorization: Bearer <token>
Role: seller
Content-Type: application/json

Body:
{
  "storeName": "My Fashion Store",
  "storeDescription": "Best fashion products",
  "storeLogo": "logo_url"
}
```

### Create Product (with file upload)
```
POST /seller/products
Authorization: Bearer <token>
Role: seller
Content-Type: multipart/form-data

Form Data:
- name: "Premium Winter Jacket"
- description: "High quality winter jacket"
- price: 2999
- stock: 50
- category: category_id
- brand: brand_id
- images: [file1, file2, file3] // up to 5 images
- videos: [file1] // up to 3 videos
```

### Get Seller Products
```
GET /seller/products?page=1&limit=10&search=jacket&status=active
Authorization: Bearer <token>
Role: seller
```

### Update Product
```
PUT /seller/products/:id
Authorization: Bearer <token>
Role: seller
Content-Type: application/json

Body:
{
  "name": "Updated Product Name",
  "price": 3499,
  "stock": 100
}
```

### Delete Product
```
DELETE /seller/products/:id
Authorization: Bearer <token>
Role: seller
```

### Get Seller Orders
```
GET /seller/orders?page=1&limit=10&status=pending
Authorization: Bearer <token>
Role: seller
```

### Update Order Status
```
PUT /seller/orders/:orderId/status
Authorization: Bearer <token>
Role: seller
Content-Type: application/json

Body:
{
  "itemStatus": "shipped",
  "trackingNumber": "TRACK123456"
}
```

### Get Sales Summary
```
GET /seller/summary
Authorization: Bearer <token>
Role: seller
```

### Get Dashboard Data
```
GET /seller/dashboard
Authorization: Bearer <token>
Role: seller
```

---

## 🏷️ Category & Brand APIs

### Get All Categories
```
GET /categories?page=1&limit=20&search=electronics
```

### Get Category by ID
```
GET /categories/:id
```

### Get Category by Slug
```
GET /categories/slug/:slug
```

### Get All Brands
```
GET /brands?page=1&limit=20&search=nike
```

### Get Brand by ID
```
GET /brands/:id
```

### Get Brand by Slug
```
GET /brands/slug/:slug
```

---

## 💳 Payment APIs

### Create Razorpay Order
```
POST /payment/create-order
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "amount": 2999,
  "currency": "INR"
}

Response:
{
  "success": true,
  "data": {
    "orderId": "order_xyz123",
    "amount": 2999,
    "currency": "INR",
    "key": "razorpay_key_id"
  }
}
```

### Verify Payment
```
POST /payment/verify
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "razorpay_order_id": "order_xyz123",
  "razorpay_payment_id": "pay_abc456",
  "razorpay_signature": "signature_hash"
}
```

---

## 📤 File Upload APIs

### Upload Single File
```
POST /upload/single
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- file: [image or video file]

Response:
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "ecommerce/filename",
    "format": "png",
    "size": 123456
  }
}
```

### Upload Multiple Files
```
POST /upload/multiple
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- files: [file1, file2, file3] // up to 5 files

Response:
{
  "success": true,
  "message": "Files uploaded successfully",
  "data": {
    "files": [
      {
        "url": "https://res.cloudinary.com/...",
        "publicId": "ecommerce/file1"
      },
      {
        "url": "https://res.cloudinary.com/...",
        "publicId": "ecommerce/file2"
      }
    ]
  }
}
```

**Supported Formats:**
- Images: JPG, PNG, GIF, WebP
- Videos: MP4, MOV, AVI, WebM
- Max file size: 100MB
- Max files per request: 5

---

## 🤖 AI Assistant APIs

### Chat with AI Assistant
```
POST /ai-assistant/chat
Authorization: Bearer <token> (optional)
Content-Type: application/json

Body:
{
  "message": "Show me winter jackets under $100"
}

Response:
{
  "success": true,
  "data": {
    "response": "Here are some great winter jackets under $100...",
    "conversationId": "conv_123",
    "timestamp": "2025-01-13T10:30:00Z"
  }
}
```

### Get Chat History
```
GET /ai-assistant/history?limit=20
Authorization: Bearer <token>
```

### Clear Chat History
```
DELETE /ai-assistant/history
Authorization: Bearer <token>
```

---

## 📝 Notes

### Authentication
- Most endpoints require authentication via JWT token
- Include token in Authorization header: `Bearer <token>`
- Token expires after 7 days

### File Uploads
- Use `multipart/form-data` content type
- Files are automatically uploaded to Cloudinary
- URLs are returned in response

### Pagination
- Default page size: 10 items
- Use `page` and `limit` query parameters
- Response includes pagination metadata

### Error Responses
```json
{
  "success": false,
  "message": "Error message here"
}
```

### Success Responses
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

---

## 🔑 Environment Variables Required

```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

GROQ_API_KEY=your_groq_api_key
```

---

**Happy Coding! 🚀**
