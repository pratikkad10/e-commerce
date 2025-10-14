# E-commerce Backend Architecture

## 🏗️ System Overview

Multi-vendor e-commerce platform with role-based access control, comprehensive order management, and automated email notifications.

## 📁 Project Structure

```
server/
├── models/                    # Database schemas
│   ├── User.js               # Users, sellers, admins
│   ├── Product.js            # Products with seller relations
│   ├── Order.js              # Orders with multi-seller support
│   ├── Cart.js               # Shopping cart management
│   ├── Review.js             # Product reviews
│   ├── Brand.js              # Product brands
│   ├── Category.js           # Product categories
│   └── Payment.js            # Payment processing
├── controllers/               # Business logic
│   ├── authController.js     # Authentication & authorization
│   ├── userController.js     # User management
│   ├── productController.js  # Product CRUD & search
│   ├── orderController.js    # Order processing
│   ├── cartController.js     # Cart operations
│   ├── reviewController.js   # Review system
│   ├── sellerController.js   # Seller dashboard & management
│   ├── adminController.js    # Admin panel operations
│   ├── brandController.js    # Brand management
│   ├── categoryController.js # Category management
│   ├── paymentController.js  # Payment processing
│   └── uploadController.js   # File uploads
├── routes/                   # API endpoints
│   ├── index.js             # Route aggregator
│   ├── authRoutes.js        # Auth endpoints
│   ├── userRoutes.js        # User endpoints
│   ├── productRoutes.js     # Product endpoints
│   ├── orderRoutes.js       # Order endpoints
│   ├── cartRoutes.js        # Cart endpoints
│   ├── reviewRoutes.js      # Review endpoints
│   ├── sellerRoutes.js      # Seller endpoints
│   ├── adminRoutes.js       # Admin endpoints
│   ├── brandRoutes.js       # Brand endpoints
│   ├── categoryRoutes.js    # Category endpoints
│   ├── paymentRoutes.js     # Payment endpoints
│   └── testRoutes.js        # Testing endpoints
├── middlewares/              # Request processing
│   ├── auth.js              # Authentication & authorization
│   ├── validation.js        # Input validation
│   ├── upload.js            # File upload handling
│   └── errorHandler.js      # Global error handling
├── utils/                    # Utilities & services
│   ├── sendEmail.js         # Email service (Nodemailer)
│   ├── emailEvents.js       # Email automation system
│   ├── tokens.js            # JWT & token utilities
│   ├── response.js          # Standardized API responses
│   └── cloudinary.js        # Image upload service
├── templates/emails/         # Email templates
│   ├── orderConfirmationTemplate.js
│   ├── sellerApprovalTemplate.js
│   └── [other email templates]
├── config/                   # Configuration
│   └── database.js          # MongoDB connection
└── server.js                # Application entry point
```

## 🎯 Core Features

### Authentication & Authorization
- **JWT-based authentication** with HTTP-only cookies
- **Role-based access control** (Customer, Seller, Admin)
- **Email verification** with secure tokens
- **Password reset** functionality
- **Account security** with login attempt limits

### Multi-Vendor Marketplace
- **Seller registration** with admin approval workflow
- **Individual seller stores** with custom branding
- **Seller dashboard** with analytics and order management
- **Commission tracking** and earnings calculation
- **Seller product management** with inventory control

### Product Management
- **Comprehensive product catalog** with categories and brands
- **Advanced search and filtering** capabilities
- **Image management** with Cloudinary integration
- **Inventory tracking** with low stock alerts
- **Product variants** and pricing options

### Order Processing
- **Complete order lifecycle** management
- **Multi-seller order handling** with individual notifications
- **Payment integration** with multiple methods
- **Order status tracking** with automated updates
- **Shipping and delivery** management

### Review System
- **Verified purchase reviews** with moderation
- **Rating aggregation** and display
- **Review helpfulness** voting system
- **Seller and admin notifications** for new reviews

### Email Automation
- **Event-driven email system** for all major actions
- **Professional HTML templates** with responsive design
- **Automated notifications** for users, sellers, and admins
- **Email delivery tracking** and error handling

## 🗄️ Database Architecture

### User Model
```javascript
{
  // Basic Info
  firstName, lastName, email, password, phone,
  role: ['customer', 'seller', 'admin'],
  
  // Seller Fields
  storeName, storeDescription, storeLogo,
  isSellerApproved, sellerApprovedAt,
  totalSales, totalEarnings,
  
  // Security
  isEmailVerified, loginAttempts, lockUntil,
  emailVerificationToken, passwordResetToken,
  
  // Virtual Properties
  fullName, isSellerActive, productCount
}
```

### Product Model
```javascript
{
  // Basic Info
  name, description, price, images, sku,
  brand, category, seller,
  
  // Inventory
  stock, trackQuantity, soldCount,
  
  // Ratings
  averageRating, reviewCount,
  
  // Status
  status: ['active', 'inactive', 'archived'],
  isActive, isFeatured
}
```

### Order Model
```javascript
{
  // Order Info
  user, orderItems[], status, paymentMethod,
  
  // Pricing
  subtotal, shippingCost, taxAmount, total,
  
  // Multi-seller Support
  orderItems: [{
    product, seller, sellerEarnings,
    quantity, price, itemStatus
  }],
  
  // Tracking
  trackingNumber, shippingAddress,
  statusHistory[]
}
```

## 🔐 Security Implementation

### Authentication Flow
1. **Registration** → Email verification → Account activation
2. **Login** → JWT token → HTTP-only cookie
3. **Authorization** → Role-based middleware → Resource access

### Data Protection
- **Password hashing** with bcrypt
- **JWT tokens** with expiration
- **Input validation** with Zod schemas
- **SQL injection prevention** with Mongoose
- **XSS protection** with sanitization

### Access Control
- **Route-level protection** with auth middleware
- **Resource ownership** validation
- **Role-based permissions** for different user types
- **Admin-only operations** with elevated privileges

## 🚀 API Architecture

### RESTful Design
- **Consistent URL patterns** (`/api/v1/resource`)
- **HTTP methods** for CRUD operations
- **Status codes** for response indication
- **Standardized responses** with success/error format

### Middleware Stack
1. **CORS** → Cross-origin request handling
2. **Body parsing** → JSON/form data processing
3. **Authentication** → JWT token validation
4. **Authorization** → Role and permission checks
5. **Validation** → Input sanitization and validation
6. **Error handling** → Centralized error processing

### Response Format
```javascript
{
  success: boolean,
  message: string,
  data: object | array | null,
  pagination?: object,
  error?: object
}
```

## 📧 Email System Architecture

### Event-Driven Design
- **Modular email handlers** for different event types
- **Template-based rendering** with dynamic content
- **Asynchronous processing** to prevent blocking
- **Error handling** with graceful degradation

### Email Types
- **User Events**: Welcome, login alerts, password changes
- **Order Events**: Confirmations, shipping, delivery
- **Seller Events**: Approvals, notifications, alerts
- **Admin Events**: New registrations, reviews, reports

## 🔄 Data Flow

### Order Processing Flow
1. **Cart Management** → Add/remove items → Calculate totals
2. **Order Creation** → Validate stock → Process payment
3. **Inventory Update** → Reduce stock → Update sales count
4. **Notifications** → Email customer → Notify sellers
5. **Fulfillment** → Update status → Track shipping

### User Registration Flow
1. **Input Validation** → Zod schema validation
2. **Duplicate Check** → Email uniqueness verification
3. **Account Creation** → Password hashing → Token generation
4. **Email Verification** → Send verification email
5. **Account Activation** → Verify token → Welcome email

## 🛠️ Technology Stack

### Backend Framework
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Bcrypt** for password hashing

### External Services
- **Cloudinary** for image storage and processing
- **Nodemailer** with Gmail SMTP for email delivery
- **Payment gateways** integration ready

### Development Tools
- **Zod** for schema validation
- **Cookie-parser** for cookie handling
- **CORS** for cross-origin requests
- **Dotenv** for environment configuration

## 📊 Performance Considerations

### Database Optimization
- **Indexed fields** for fast queries
- **Population strategies** for related data
- **Aggregation pipelines** for complex queries
- **Pagination** for large datasets

### Caching Strategy
- **In-memory caching** for frequently accessed data
- **Database query optimization** with proper indexing
- **Image optimization** with Cloudinary transformations

### Scalability Features
- **Modular architecture** for easy scaling
- **Stateless design** for horizontal scaling
- **Async operations** for better performance
- **Error isolation** to prevent cascading failures

## 🔍 Monitoring & Logging

### Error Tracking
- **Comprehensive error logging** with stack traces
- **Request/response logging** for debugging
- **Email delivery tracking** with success/failure logs
- **Performance monitoring** for bottleneck identification

### Health Checks
- **Database connection** monitoring
- **Email service** availability checks
- **External service** integration status
- **System resource** usage tracking

## 🚀 Deployment Architecture

### Environment Configuration
- **Development** → Local MongoDB, test email
- **Staging** → Cloud database, email testing
- **Production** → Optimized settings, monitoring

### Security Hardening
- **Environment variables** for sensitive data
- **HTTPS enforcement** in production
- **Rate limiting** for API protection
- **Input sanitization** for security

---

This architecture provides a robust, scalable foundation for a multi-vendor e-commerce platform with comprehensive features and security measures.