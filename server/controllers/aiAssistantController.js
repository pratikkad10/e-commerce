import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { sendResponse, sendError } from '../utils/response.js';
import jwt from 'jsonwebtoken';
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const handleQuery = async (req, res) => {
  console.log('\n🤖 AI ASSISTANT CALLED');
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Cookies:', JSON.stringify(req.cookies, null, 2));
  console.log('req.user:', req.user);

  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return sendError(res, 400, 'Query is required and must be a string');
    }

    if (!process.env.GROQ_API_KEY) {
      return sendError(res, 500, 'Groq API key not configured');
    }

    let user = req.user || null;
    let userInfo = 'Guest user';
    let userProfile = '';
    let userOrders = [];

    console.log('\n=== USER STATUS ===');
    console.log('User found:', !!user);
    if (user) {
      console.log('User name:', user.firstName, user.lastName);
      console.log('User email:', user.email);
    } else {
      console.log('No user - checking manual auth...');
      // Manual fallback check
      const allCookies = Object.keys(req.cookies || {});
      console.log('Available cookies:', allCookies);
    }
    console.log('=== END USER STATUS ===\n');

    if (user) {
      userInfo = `${user.firstName} ${user.lastName}`;
      userProfile = `
User Profile:
- Name: ${user.firstName} ${user.lastName}
- Email: ${user.email}
- Phone: ${user.phone || 'Not provided'}
- Role: ${user.role}
- Member since: ${new Date(user.createdAt).toLocaleDateString()}`;
    }

    if (user) {
      userOrders = await Order.find({ user: user._id })
        .select('_id items totalAmount status createdAt estimatedDelivery shippingAddress paymentMethod')
        .populate('items.product', 'name price')
        .sort({ createdAt: -1 })
        .limit(10);
    }

    const allProducts = await Product.find({ status: 'active', isActive: true })
      .populate('brand', 'name')
      .populate('category', 'name')
      .select('name description price stock brand category');

    const productList = allProducts.map(p =>
      `- ${p.name}: ₹${p.price} (${p.stock > 0 ? 'In Stock' : 'Out of Stock'})`
    ).join('\n');

    const brands = await Brand.find({ isActive: true }).select('name');
    const categories = await Category.find({ isActive: true }).select('name');

    const brandList = brands.map(b => b.name).join(', ');
    const categoryList = categories.map(c => c.name).join(', ');

    const orderInfo = userOrders.length > 0
      ? userOrders.map(order => {
        const items = order.items.map(item =>
          `${item.product?.name || 'Unknown'} (₹${item.product?.price || 0})`
        ).join(', ');
        return `
- Order #${order._id.toString().slice(-6)}: ₹${order.totalAmount} - ${order.status}
  Date: ${new Date(order.createdAt).toLocaleDateString()}
  Items: ${items}
  ${order.estimatedDelivery ? `Delivery: ${new Date(order.estimatedDelivery).toLocaleDateString()}` : ''}`;
      }).join('\n')
      : 'No recent orders';

    const userStats = user
      ? {
        totalOrders: userOrders.length,
        totalSpent: userOrders.reduce((sum, o) => sum + o.totalAmount, 0),
        avgOrderValue:
          userOrders.length > 0
            ? (
              userOrders.reduce((sum, o) => sum + o.totalAmount, 0) /
              userOrders.length
            ).toFixed(2)
            : 0,
      }
      : null;

    const userSection = user
      ? `AUTHENTICATED USER: ${userInfo}${userProfile}

📊 USER STATISTICS:
- Total Orders: ${userStats.totalOrders}
- Total Spent: ₹${userStats.totalSpent}
- Average Order Value: ₹${userStats.avgOrderValue}

🎯 PERSONALIZATION INSTRUCTIONS:
- Address user by their first name (${user.firstName})
- Reference their order history when relevant
- Provide personalized recommendations based on past purchases
- Use their profile information to enhance responses`
      : `GUEST USER (NOT LOGGED IN)
- No personal information available
- Cannot access order history
- Limited to general product information`;

    const systemMessage = `
You are a friendly, intelligent e-commerce assistant for "E-Commerce Store".

👤 USER INFORMATION:
${userSection}

🧠 YOUR CAPABILITIES:
- Product information and recommendations
- Order status and delivery updates
- Brand and category guidance
- Personalized shopping assistance
- Friendly conversation and support

IMPORTANT RULES:
1. Use user's first name when authenticated
2. Reference actual order data when available
3. ONLY mention products/brands/categories from data below
4. Be conversational and helpful
5. Provide personalized experience for authenticated users

🛍️ STORE DATA:

Products:
${productList}

Brands: ${brandList}
Categories: ${categoryList}

📦 USER'S RECENT ORDERS:
${orderInfo}

💬 USER QUERY: "${query}"

🎯 RESPONSE GUIDELINES:
- Use the user's name when appropriate
- Provide accurate, data-based answers
- Be conversational and friendly
- For order questions, reference their actual orders
- For product questions, use the inventory data
- Handle general chat naturally while being helpful

✨ PERSONALITY & STYLE:
Always reply like a human assistant of "E-Commerce Store".
Use warm, friendly, conversational tone.
No markdown syntax.
Use simple, clear sentences.
You can use short emojis (😊, 👍, 🛍️) naturally.
Avoid repeating system data or JSON-like responses.
Speak directly to the user using their name if available.
Example style: "Hey John! Your latest order is on the way 🚚. It should reach you soon."
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: query },
      ],
      model: "openai/gpt-oss-20b",
    });

    let answer =
      chatCompletion.choices[0]?.message?.content ||
      "Sorry, I couldn't find an answer.";

    answer = answer
      .replace(/\*\*/g, '')       // remove markdown bold
      .replace(/\*/g, '')         // remove markdown stars
      .replace(/\\n/g, ' ')       // flatten literal newlines
      .replace(/\s{2,}/g, ' ')    // normalize spaces
      .trim();

    answer = answer.charAt(0).toUpperCase() + answer.slice(1);

    sendResponse(res, 200, 'Query processed successfully', answer);

  } catch (error) {
    console.error('AI Assistant error:', error);
    sendError(res, 500, 'Failed to process query');
  }
};
