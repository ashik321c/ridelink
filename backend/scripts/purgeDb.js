const mongoose = require('mongoose');
const User = require('../models/User');
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');
const Message = require('../models/Message');
const PassengerRequest = require('../models/PassengerRequest');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ridelink';

async function purge() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected! Purging all user data, rides, bookings, messages, passengerRequests...');

    const resUsers = await User.deleteMany({});
    const resRides = await Ride.deleteMany({});
    const resBookings = await Booking.deleteMany({});
    const resMessages = await Message.deleteMany({});
    const resReqs = await PassengerRequest.deleteMany({});

    console.log(`Successfully purged:`);
    console.log(`- Users: ${resUsers.deletedCount}`);
    console.log(`- Rides: ${resRides.deletedCount}`);
    console.log(`- Bookings: ${resBookings.deletedCount}`);
    console.log(`- Messages: ${resMessages.deletedCount}`);
    console.log(`- Passenger Requests: ${resReqs.deletedCount}`);
  } catch (err) {
    console.error('Error during database purge:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
}

purge();
