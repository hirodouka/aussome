import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Router
app.use('/api', apiRouter);

// Root route welcome message
app.get('/', (req, res) => {
  res.json({
    name: 'Ultras E-Commerce API',
    status: 'online',
    endpoints: {
      products: '/api/products',
      categories: '/api/categories',
      journal: '/api/journal',
      quotes: '/api/quotes',
      orders: '/api/orders (POST)'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Ultras Backend Server running on port ${PORT}`);
  console.log(`👉 API Ready: http://localhost:${PORT}/api/products`);
});
