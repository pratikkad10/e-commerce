# 📸 Cloudinary File Upload Integration Guide

## 🎯 Complete Implementation for Product Creation with File Upload

---

## ✅ **What's Already Working**

- ✅ Cloudinary configuration
- ✅ Upload middleware (`middlewares/upload.js`)
- ✅ Single file upload endpoint (`/api/upload/single`)
- ✅ Multiple files upload endpoint (`/api/upload/multiple`)

---

## 🔧 **Changes Required for Seller Product Creation**

### **File 1: `routes/sellerRoutes.js`**

**Add this import at the top:**
```javascript
import { uploadFields } from '../middlewares/upload.js';
```

**Change this line:**
```javascript
router.post('/products', createProduct);
```

**To:**
```javascript
router.post('/products', uploadFields, createProduct);
```

**Complete updated file:**
```javascript
import express from 'express';
import {
  getSellerProfile,
  updateSellerProfile,
  createProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
  getMyOrders,
  updateOrderStatus,
  getSalesSummary,
  getDashboard
} from '../controllers/sellerController.js';
import { authenticate, authorize, checkOwnership } from '../middlewares/auth.js';
import { uploadFields } from '../middlewares/upload.js';  // ADD THIS LINE

const router = express.Router();

// All seller routes require authentication and seller role
router.use(authenticate, authorize(['seller']));

// ===== PROFILE ROUTES =====
router.get('/profile', getSellerProfile);
router.put('/profile', updateSellerProfile);

// ===== PRODUCT ROUTES =====
router.post('/products', uploadFields, createProduct);  // UPDATED THIS LINE
router.get('/products', getMyProducts);
router.put('/products/:id', checkOwnership('product'), updateProduct);
router.delete('/products/:id', checkOwnership('product'), deleteProduct);

// ===== ORDER ROUTES =====
router.get('/orders', getMyOrders);
router.put('/orders/:orderId/status', updateOrderStatus);

// ===== ANALYTICS ROUTES =====
router.get('/summary', getSalesSummary);
router.get('/dashboard', getDashboard);

export default router;
```

---

### **File 2: `controllers/sellerController.js`**

**Replace the `createProduct` function with:**

```javascript
// Create product with file upload support
export const createProduct = async (req, res) => {
  try {
    // Get or create default category
    let category = await Category.findOne();
    if (!category) {
      category = new Category({
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic products and gadgets',
        isActive: true
      });
      await category.save();
    }

    // Extract uploaded file URLs from multer/cloudinary
    const images = req.files?.images?.map(file => ({
      url: file.path,           // Cloudinary URL
      alt: req.body.name || 'Product image'
    })) || [];

    const videos = req.files?.videos?.map(file => ({
      url: file.path,           // Cloudinary URL
      title: req.body.name || 'Product video'
    })) || [];
    
    const productData = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock || 0,
      category: category._id,
      seller: req.user._id,
      status: 'active',
      images,
      videos,
      seo: {}
    };
    
    const product = new Product(productData);
    await product.save();

    sendResponse(res, 201, 'Product created successfully', product);
  } catch (error) {
    console.error('Create product error:', error);
    sendError(res, 500, `Failed to create product: ${error.message}`);
  }
};
```

---

## 🧪 **Testing with Postman**

### **Request Setup:**

```
Method: POST
URL: http://localhost:5000/api/v1/seller/products

Headers:
Authorization: Bearer <your_jwt_token>

Body: form-data
```

### **Form Data Fields:**

| Key | Type | Value |
|-----|------|-------|
| name | Text | Premium Winter Jacket |
| description | Text | High quality winter jacket with premium fabric |
| price | Text | 2999 |
| stock | Text | 50 |
| images | File | jacket.png |
| images | File | t-shirt.png |
| images | File | full-tshirt.png |
| videos | File | product-video.mp4 |

### **Expected Response:**

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "_id": "68e8c3e8c755340942791b47",
    "name": "Premium Winter Jacket",
    "description": "High quality winter jacket with premium fabric",
    "price": 2999,
    "stock": 50,
    "images": [
      {
        "url": "https://res.cloudinary.com/djn5osmxc/image/upload/v1760371935/ecommerce/jacket-1760371931033.png",
        "alt": "Premium Winter Jacket"
      },
      {
        "url": "https://res.cloudinary.com/djn5osmxc/image/upload/v1760371938/ecommerce/t-shirt-1760371934309.png",
        "alt": "Premium Winter Jacket"
      }
    ],
    "videos": [
      {
        "url": "https://res.cloudinary.com/djn5osmxc/video/upload/v1760371940/ecommerce/video-1760371939123.mp4",
        "title": "Premium Winter Jacket"
      }
    ],
    "seller": "68e8c3e8c755340942791b46",
    "status": "active",
    "category": "68e8c1a75d344b806fdfe0fe"
  }
}
```

---

## 🔄 **How It Works**

1. **User sends form-data** with files and text fields
2. **Multer middleware** (`uploadFields`) intercepts the request
3. **Cloudinary** automatically uploads files
4. **Multer** adds file info to `req.files`
5. **Controller** extracts Cloudinary URLs from `req.files`
6. **Product** is created with Cloudinary URLs
7. **Response** sent with product data including image/video URLs

---

## 📊 **File Upload Limits**

- **Max file size:** 100MB
- **Max files per request:** 5 images + 3 videos
- **Allowed image formats:** JPG, PNG, GIF, WebP
- **Allowed video formats:** MP4, MOV, AVI, WebM

---

## 🚨 **Troubleshooting**

### **Error: `req.body is undefined`**
- **Cause:** File upload middleware not added to route
- **Fix:** Add `uploadFields` middleware to route

### **Error: `Invalid file type`**
- **Cause:** Unsupported file format
- **Fix:** Use JPG, PNG, GIF, WebP for images or MP4, MOV for videos

### **Error: `File too large`**
- **Cause:** File exceeds 100MB limit
- **Fix:** Compress file or reduce quality

---

## ✅ **Summary of Changes**

1. ✅ Add `uploadFields` import to `sellerRoutes.js`
2. ✅ Add `uploadFields` middleware to product creation route
3. ✅ Update `createProduct` function to handle file uploads
4. ✅ Extract Cloudinary URLs from `req.files`
5. ✅ Save URLs to database

---

## 🎉 **After Implementation**

You can now:
- ✅ Upload product images directly
- ✅ Upload product videos directly
- ✅ Files automatically stored on Cloudinary
- ✅ URLs automatically saved to database
- ✅ No manual URL copying needed

---

**Happy Coding! 🚀**
