import express from 'express';
import app from './api/index.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 AussomeFinds Unified Server running on port ${PORT}`);
  console.log(`👉 API Ready: http://localhost:${PORT}/api/products`);
});
