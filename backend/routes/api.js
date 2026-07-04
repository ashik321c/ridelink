const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const rideRoutes = require('./rideRoutes');
const bookingRoutes = require('./bookingRoutes');
const chatRoutes = require('./chatRoutes');
const passengerRequestRoutes = require('./passengerRequestRoutes');
const adminRoutes = require('./adminRoutes');

router.use('/auth', authRoutes);
router.use('/rides', rideRoutes);
router.use('/bookings', bookingRoutes);
router.use('/chats', chatRoutes);
router.use('/passenger-requests', passengerRequestRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
