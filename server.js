require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db'); // Ab ye path ekdum sahi kaam karega

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Test Route
app.get('/', (req, res) => {
  res.send('🍕 FoodiVerse API is running...');
});

// Future routes yahan connect honge:
// app.use('/api/auth', require('./src/routes/authRoutes'));
// app.use('/api/foods', require('./src/routes/foodRoutes'));

const PORT = process.env.PORT || 5000;

// Connect DB & Start Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});