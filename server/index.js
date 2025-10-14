import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import connectDB from './config/database.js';
import routes from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';

const startServer = async () => {
  const app = express();
  const PORT = process.env.PORT || 5000;

  // Database connection
  try {
    await connectDB();
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }

  // Middleware
  app.use(helmet());
  app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || [
      process.env.NODE_ENV === 'production' 
        ? 'https://yourdomain.com' 
        : 'http://localhost:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  app.use(morgan('combined'));
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Handle text/plain as JSON (Postman workaround)
  app.use((req, res, next) => {
    if (req.headers['content-type'] === 'text/plain' && (req.method === 'POST' || req.method === 'PUT')) {
      let data = '';
      req.on('data', chunk => {
        data += chunk;
      });
      req.on('end', () => {
        try {
          req.body = JSON.parse(data);
        } catch (e) {
          req.body = {};
        }
        next();
      });
    } else {
      next();
    }
  });

  app.get("/", (req, res) => {
    res.send("Hello World!");
  })

  // Test JSON parsing
  app.post("/test-json", (req, res) => {
    res.json({ received: req.body, headers: req.headers });
  })

  // Routes
  app.use('/api/v1', routes);

  // Error handling middleware
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();