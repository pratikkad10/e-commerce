import 'dotenv/config';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import User from '../models/User.js';
import connectDB from '../config/database.js';

const seedTestData = async () => {
  try {
    await connectDB();
    console.log('Connected to database');

    // Create test user (seller)
    let testSeller = await User.findOne({ email: 'testseller@example.com' });
    if (!testSeller) {
      testSeller = new User({
        firstName: 'Test',
        lastName: 'Seller',
        email: 'testseller@example.com',
        password: 'password123',
        role: 'seller',
        isActive: true
      });
      await testSeller.save();
    }

    // Create test categories
    const categories = [
      { name: 'Electronics', slug: 'electronics', description: 'Electronic devices and gadgets' },
      { name: 'Clothing', slug: 'clothing', description: 'Fashion and apparel' },
      { name: 'Sports', slug: 'sports', description: 'Sports and fitness equipment' }
    ];

    const createdCategories = {};
    for (const cat of categories) {
      let category = await Category.findOne({ slug: cat.slug });
      if (!category) {
        category = new Category(cat);
        await category.save();
      }
      createdCategories[cat.slug] = category._id;
    }

    // Create test brands
    const brands = [
      { name: 'Samsung', slug: 'samsung', description: 'Samsung Electronics' },
      { name: 'Nike', slug: 'nike', description: 'Nike Sportswear' },
      { name: 'Apple', slug: 'apple', description: 'Apple Inc.' }
    ];

    const createdBrands = {};
    for (const brand of brands) {
      let brandDoc = await Brand.findOne({ slug: brand.slug });
      if (!brandDoc) {
        brandDoc = new Brand(brand);
        await brandDoc.save();
      }
      createdBrands[brand.slug] = brandDoc._id;
    }

    // Create test products
    const products = [
      {
        name: 'Samsung Galaxy S23',
        description: 'Latest Samsung flagship smartphone with advanced camera system and 5G connectivity',
        shortDescription: '8GB RAM, 256GB storage, 50MP camera',
        price: 799,
        comparePrice: 899,
        stock: 25,
        category: createdCategories.electronics,
        brand: createdBrands.samsung,
        tags: ['smartphone', 'android', '5g', 'camera'],
        isFeatured: true,
        status: 'active',
        seller: testSeller._id
      },
      {
        name: 'iPhone 14 Pro Max',
        description: 'Apple iPhone 14 Pro Max with A16 Bionic chip and Pro camera system',
        shortDescription: '128GB, Pro camera system, A16 Bionic',
        price: 1099,
        stock: 15,
        category: createdCategories.electronics,
        brand: createdBrands.apple,
        tags: ['iphone', 'smartphone', 'ios', 'pro'],
        isFeatured: true,
        status: 'active',
        seller: testSeller._id
      },
      {
        name: 'Nike Air Zoom Pegasus 39',
        description: 'Comfortable running shoes with responsive cushioning for daily training',
        shortDescription: 'Running shoes with Zoom Air technology',
        price: 120,
        stock: 50,
        category: createdCategories.sports,
        brand: createdBrands.nike,
        tags: ['running', 'shoes', 'sports', 'fitness'],
        status: 'active',
        seller: testSeller._id
      },
      {
        name: 'Nike Revolution 6',
        description: 'Affordable running shoes perfect for beginners and casual runners',
        shortDescription: 'Lightweight running shoes for everyday use',
        price: 85,
        stock: 30,
        category: createdCategories.sports,
        brand: createdBrands.nike,
        tags: ['running', 'shoes', 'affordable', 'casual'],
        status: 'active',
        seller: testSeller._id
      },
      {
        name: 'Samsung Galaxy Buds Pro',
        description: 'Premium wireless earbuds with active noise cancellation',
        shortDescription: 'Wireless earbuds with ANC and premium sound',
        price: 199,
        stock: 0, // Out of stock for testing
        category: createdCategories.electronics,
        brand: createdBrands.samsung,
        tags: ['earbuds', 'wireless', 'bluetooth', 'anc'],
        status: 'active',
        seller: testSeller._id
      }
    ];

    // Clear existing test products
    await Product.deleteMany({ seller: testSeller._id });

    // Insert new products
    for (const productData of products) {
      const product = new Product(productData);
      await product.save();
      console.log(`Created product: ${product.name}`);
    }

    console.log('Test data seeded successfully!');
    console.log(`Created ${products.length} products for AI assistant testing`);
    
  } catch (error) {
    console.error('Error seeding test data:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedTestData();