# AI Assistant Testing Guide

## Setup Instructions

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Gemini API
1. Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add it to your `.env` file:
```
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 3. Seed Test Data
```bash
cd server
npm run seed:ai
```

### 4. Start the Server
Make sure your server is running:

```bash
cd server
npm start
```

## Postman Testing

### Base URL
```
http://localhost:5000/api/v1/ai
```

### Endpoint
**POST** `/query`

### Headers
```
Content-Type: application/json
```

### Request Body Format
```json
{
  "query": "your question here"
}
```

## Test Cases

### 1. Product Search Queries

#### Test Case 1.1: Specific Product Search
**Request:**
```json
{
  "query": "Tell me about the Samsung Galaxy S23"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Query processed successfully",
  "data": {
    "message": "Samsung Galaxy S23 is available on our platform. Price: $799. 8GB RAM, 256GB storage, 50MP camera... In stock (25 available). Would you like to see similar products?",
    "products": [
      {
        "_id": "...",
        "name": "Samsung Galaxy S23",
        "price": 799,
        "stock": 25,
        "description": "Latest Samsung flagship smartphone...",
        "brand": { "name": "Samsung" },
        "category": { "name": "Electronics" }
      }
    ]
  }
}
```

#### Test Case 1.2: Multiple Product Search
**Request:**
```json
{
  "query": "Show me Nike running shoes"
}
```

#### Test Case 1.3: Product Not Found
**Request:**
```json
{
  "query": "Tell me about iPhone 15 Pro Max"
}
```

### 2. Stock/Availability Queries

#### Test Case 2.1: In Stock Product
**Request:**
```json
{
  "query": "Do you have iPhone 14 Pro Max?"
}
```

#### Test Case 2.2: Out of Stock Product
**Request:**
```json
{
  "query": "Do you have Samsung Galaxy Buds Pro in stock?"
}
```

#### Test Case 2.3: General Stock Query
**Request:**
```json
{
  "query": "What Nike shoes are available?"
}
```

### 3. Recommendation Queries

#### Test Case 3.1: Similar Products
**Request:**
```json
{
  "query": "Recommend me products similar to Samsung Galaxy S23"
}
```

#### Test Case 3.2: General Recommendations
**Request:**
```json
{
  "query": "What do you recommend for me?"
}
```

#### Test Case 3.3: Category-based Recommendations
**Request:**
```json
{
  "query": "Suggest some good smartphones"
}
```

### 4. General Search Queries

#### Test Case 4.1: Brand Search
**Request:**
```json
{
  "query": "Samsung products"
}
```

#### Test Case 4.2: Category Search
**Request:**
```json
{
  "query": "electronics"
}
```

#### Test Case 4.3: Feature Search
**Request:**
```json
{
  "query": "wireless earbuds"
}
```

### 5. Edge Cases

#### Test Case 5.1: Empty Query
**Request:**
```json
{
  "query": ""
}
```

#### Test Case 5.2: Invalid Query Format
**Request:**
```json
{
  "query": 123
}
```

#### Test Case 5.3: Very Long Query
**Request:**
```json
{
  "query": "I am looking for a very specific type of smartphone that has excellent camera quality and long battery life and should be from a reputable brand like Samsung or Apple and should not be too expensive but also not too cheap and should have good reviews"
}
```

## Expected Response Format

All successful responses follow this structure:

```json
{
  "success": true,
  "message": "Query processed successfully",
  "data": {
    "message": "AI assistant response message",
    "products": [
      {
        "_id": "product_id",
        "name": "Product Name",
        "description": "Product description",
        "shortDescription": "Short description",
        "price": 999,
        "stock": 10,
        "averageRating": 4.5,
        "totalReviews": 25,
        "brand": {
          "name": "Brand Name"
        },
        "category": {
          "name": "Category Name"
        },
        "images": [...],
        "tags": [...],
        "isFeatured": true,
        "isOnSale": false,
        "discountPercentage": 0
      }
    ]
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Query is required and must be a string"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to process query"
}
```

## Testing Tips

1. **Test with Real Data**: Make sure to run the seeding script first
2. **Vary Your Queries**: Try different phrasings for the same intent
3. **Test Edge Cases**: Empty queries, very long queries, special characters
4. **Check Response Times**: The AI should respond quickly (< 2 seconds)
5. **Verify Product Data**: Ensure returned products have all required fields

## Sample Postman Collection

You can import this collection into Postman:

```json
{
  "info": {
    "name": "E-commerce AI Assistant",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Product Search",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"query\": \"Tell me about the Samsung Galaxy S23\"\n}"
        },
        "url": {
          "raw": "http://localhost:5000/api/v1/ai/query",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "v1", "ai", "query"]
        }
      }
    },
    {
      "name": "Stock Query",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"query\": \"Do you have Nike running shoes?\"\n}"
        },
        "url": {
          "raw": "http://localhost:5000/api/v1/ai/query",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "v1", "ai", "query"]
        }
      }
    },
    {
      "name": "Recommendations",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"query\": \"What do you recommend for me?\"\n}"
        },
        "url": {
          "raw": "http://localhost:5000/api/v1/ai/query",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "v1", "ai", "query"]
        }
      }
    }
  ]
}
```

## Next Steps

After testing with Postman:
1. Verify all query types work correctly
2. Check response formatting and data accuracy
3. Test with your actual product database
4. Consider adding authentication if needed
5. Implement rate limiting for production use