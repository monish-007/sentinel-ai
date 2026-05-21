require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
  mongoose
    .connect(MONGODB_URI)
    .then(() => console.log('[MongoDB] Connected successfully'))
    .catch((err) => console.warn('[MongoDB] Connection failed — running without database:', err.message));
} else {
  console.warn('[MongoDB] No MONGODB_URI set — running without database');
}

// Routes
app.use('/api/chat', require('./routes/chat'));
app.use('/api/interactions', require('./routes/interactions'));
app.use('/api/incidents', require('./routes/incidents'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/memory', require('./routes/memory'));
app.use('/api/reports', require('./routes/reports'));

// Health check
app.get('/api/health', (req, res) => {
  const mongoStatus =
    mongoose.connection.readyState === 1
      ? 'connected'
      : mongoose.connection.readyState === 2
        ? 'connecting'
        : 'disconnected';

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoStatus,
    version: '1.0.0',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 SentinelOps AI Backend running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});
