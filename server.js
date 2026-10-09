require('dotenv').config();
const express = require('express');
const cors = require('cors');
const os = require('os');
const connectDB = require('./src/config/db');

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

const path = require('path');

// Sirf clean '/uploads' route serve hoga (bina '/public' ke)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
// Function to get Local Network IP
const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      // IPv4 aur non-internal (external) address check karna
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
};

// Test Route
app.get('/', (req, res) => {
  res.send('🍕 FoodiVerse API is running...');
});

// ====================== User Routes =============
app.use('/api/auth',require('./src/routes/authRoutes'));

const PORT = process.env.PORT || 5000;
const localIP = getLocalIP();

// Connect DB & Start Server
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 FoodiVerse Server is running:`);
    console.log(`   ➜ Local:   http://localhost:${PORT}`);
    console.log(`   ➜ Network: http://${localIP}:${PORT}\n`);
  });
});