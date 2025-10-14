import 'dotenv/config';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Brand from '../models/Brand.js';
import Category from '../models/Category.js';
import connectDB from '../config/database.js';

const checkProducts = async () => {
  try {
    await connectDB();
    console.log('Connected to database');

    const products = await Product.find({ status: 'active', isActive: true })
      .populate('brand', 'name')
      .populate('category', 'name')
      .select('name price stock brand category');

    console.log(`Found ${products.length} active products:`);
    products.forEach(p => {
      console.log(`- ${p.name} | $${p.price} | Stock: ${p.stock} | Brand: ${p.brand?.name} | Category: ${p.category?.name}`);
    });

    if (products.length === 0) {
      console.log('\nNo products found! Run: npm run seed:ai');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

checkProducts();