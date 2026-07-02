const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({
  origin: FRONTEND_URL
}));
app.use(express.json());

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a trip tracking room
  socket.on('join_trip', (tripId) => {
    socket.join(tripId);
    console.log(`User ${socket.id} joined trip room: ${tripId}`);
  });

  // Handle live location updates
  socket.on('update_location', (data) => {
    const { tripId, latitude, longitude } = data;
    io.to(tripId).emit('location_updated', { latitude, longitude });
  });

  // Handle chat messages
  socket.on('send_message', (data) => {
    const { tripId, sender, text, timestamp } = data;
    io.to(tripId).emit('receive_message', { sender, text, timestamp });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Mount API Routes
app.use('/api', require('./routes/api'));

// Database connection & start server
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ridelink';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    server.listen(PORT, () => {
      console.log(`RideLink Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed. Starting server in mock mode.', err.message);
    // If DB is offline, start server anyway using in-memory fallback for a fully working mock setup
    server.listen(PORT, () => {
      console.log(`RideLink Server running in MOCK/IN-MEMORY mode on port ${PORT}`);
    });
  });
