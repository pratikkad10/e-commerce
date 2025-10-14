import User from '../models/User.js';
import Brand from '../models/Brand.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

// Database seeder for initial data
export const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Create admin user
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@ecommerce.com',
        password: 'Admin123!',
        role: 'admin',
        isEmailVerified: true,
        isActive: true
      });
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Create sample brands
    const brandsData = [
      { 
        name: 'Apple', 
        description: 'Technology and innovation company',
        website: 'https://apple.com',
        logo: 'https://example.com/apple-logo.png'
      },
      { 
        name: 'Samsung', 
        description: 'Electronics and technology manufacturer',
        website: 'https://samsung.com',
        logo: 'https://example.com/samsung-logo.png'
      },
      { 
        name: 'Nike', 
        description: 'Athletic footwear and apparel',
        website: 'https://nike.com',
        logo: 'https://example.com/nike-logo.png'
      },
      { 
        name: 'Adidas', 
        description: 'Sports clothing and accessories',
        website: 'https://adidas.com',
        logo: 'https://example.com/adidas-logo.png'
      },
      { 
        name: 'Sony', 
        description: 'Electronics and entertainment',
        website: 'https://sony.com',
        logo: 'https://example.com/sony-logo.png'
      }
    ];

    const createdBrands = [];
    for (const brandData of brandsData) {
      const exists = await Brand.findOne({ name: brandData.name });
      if (!exists) {
        const brand = await Brand.create(brandData);
        createdBrands.push(brand);
        console.log(`✅ Brand created: ${brandData.name}`);
      } else {
        createdBrands.push(exists);
        console.log(`ℹ️  Brand already exists: ${brandData.name}`);
      }
    }

    // Create sample categories
    const categoriesData = [
      { 
        name: 'Electronics', 
        slug: 'electronics',
        description: 'Electronic devices and gadgets'
      },
      { 
        name: 'Smartphones', 
        slug: 'smartphones',
        description: 'Mobile phones and accessories'
      },
      { 
        name: 'Clothing', 
        slug: 'clothing',
        description: 'Fashion and apparel'
      },
      { 
        name: 'Sports', 
        slug: 'sports',
        description: 'Sports equipment and gear'
      },
      { 
        name: 'Footwear', 
        slug: 'footwear',
        description: 'Shoes and sandals'
      }
    ];

    const createdCategories = [];
    for (const categoryData of categoriesData) {
      const exists = await Category.findOne({ name: categoryData.name });
      if (!exists) {
        const category = await Category.create(categoryData);
        createdCategories.push(category);
        console.log(`✅ Category created: ${categoryData.name}`);
      } else {
        createdCategories.push(exists);
        console.log(`ℹ️  Category already exists: ${categoryData.name}`);
      }
    }

    // Create sample products
    const productsData = [
      {
        name: 'iPhone 15 Pro',
        description: 'Latest iPhone with advanced features',
        shortDescription: 'Premium smartphone with Pro camera system',
        price: 999.99,
        comparePrice: 1099.99,
        stock: 50,
        sku: 'IPH15PRO001',
        brand: createdBrands.find(b => b.name === 'Apple')?._id,
        category: createdCategories.find(c => c.name === 'Smartphones')?._id,
        images: ['https://example.com/iphone15pro.jpg'],
        isFeatured: true,
        status: 'active'
      },
      {
        name: 'Samsung Galaxy S24',
        description: 'Flagship Android smartphone',
        shortDescription: 'Premium Android phone with AI features',
        price: 899.99,
        comparePrice: 999.99,
        stock: 30,
        sku: 'SAM24001',
        brand: createdBrands.find(b => b.name === 'Samsung')?._id,
        category: createdCategories.find(c => c.name === 'Smartphones')?._id,
        images: ['https://example.com/galaxys24.jpg'],
        isFeatured: true,
        status: 'active'
      },
      {
        name: 'Nike Air Max 270',
        description: 'Comfortable running shoes with Air Max technology',
        shortDescription: 'Premium running shoes',
        price: 149.99,
        comparePrice: 179.99,
        stock: 100,
        sku: 'NIKE270001',
        brand: createdBrands.find(b => b.name === 'Nike')?._id,
        category: createdCategories.find(c => c.name === 'Footwear')?._id,
        images: ['https://example.com/airmax270.jpg'],
        isFeatured: false,
        status: 'active'
      },
      {
        name: 'Sony WH-1000XM5',
        description: 'Premium noise-canceling headphones',
        shortDescription: 'Wireless noise-canceling headphones',
        price: 399.99,
        comparePrice: 449.99,
        stock: 25,
        sku: 'SONY1000XM5',
        brand: createdBrands.find(b => b.name === 'Sony')?._id,
        category: createdCategories.find(c => c.name === 'Electronics')?._id,
        images: ['https://example.com/sony-headphones.jpg'],
        isFeatured: true,
        status: 'active'
      }
    ];

    // Get admin user to assign as seller
    const adminUser = await User.findOne({ role: 'admin' });

    for (const productData of productsData) {
      const exists = await Product.findOne({ sku: productData.sku });
      if (!exists && productData.brand && productData.category) {
        productData.seller = adminUser._id;
        await Product.create(productData);
        console.log(`✅ Product created: ${productData.name}`);
      } else if (exists) {
        console.log(`ℹ️  Product already exists: ${productData.name}`);
      } else {
        console.log(`⚠️  Skipping product (missing brand/category): ${productData.name}`);
      }
    }

    console.log('🎉 Database seeding completed successfully!');
    
    // Return summary
    const summary = {
      users: await User.countDocuments(),
      brands: await Brand.countDocuments(),
      categories: await Category.countDocuments(),
      products: await Product.countDocuments()
    };
    
    console.log('📊 Database Summary:', summary);
    return summary;

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
};

// Clear database (use with caution)
export const clearDatabase = async () => {
  try {
    console.log('🗑️  Clearing database...');
    
    await Promise.all([
      User.deleteMany({}),
      Brand.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({})
    ]);
    
    console.log('✅ Database cleared successfully');
  } catch (error) {
    console.error('❌ Database clearing failed:', error);
    throw error;
  }
};

// Seed specific entity
export const seedEntity = async (entityType) => {
  try {
    switch (entityType) {
      case 'admin':
        const adminExists = await User.findOne({ role: 'admin' });
        if (!adminExists) {
          await User.create({
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@ecommerce.com',
            password: 'Admin123!',
            role: 'admin',
            isEmailVerified: true,
            isActive: true
          });
          console.log('✅ Admin user created');
        }
        break;
        
      default:
        console.log('❌ Unknown entity type');
    }
  } catch (error) {
    console.error(`❌ Failed to seed ${entityType}:`, error);
    throw error;
  }
};