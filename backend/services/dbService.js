const mongoose = require('mongoose');
const store = require('../store');
const User = require('../models/User');
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');
const Message = require('../models/Message');
const PassengerRequest = require('../models/PassengerRequest');

const isDbConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Users
exports.findUsers = async (query = {}) => {
  if (isDbConnected()) {
    return await User.find(query);
  }
  let list = [...store.users];
  if (query.email) list = list.filter(u => u.email === query.email);
  if (query.phone) list = list.filter(u => u.phone === query.phone);
  return list;
};

exports.findUserById = async (id) => {
  if (isDbConnected()) {
    // Check if valid ObjectId for MongoDB
    if (mongoose.Types.ObjectId.isValid(id)) {
      const u = await User.findById(id);
      if (u) return u;
    }
    return await User.findOne({ id: id });
  }
  return store.users.find(u => u.id === id);
};

exports.createUser = async (data) => {
  if (isDbConnected()) {
    return await User.create(data);
  }
  const newUser = { id: data.id || `user_${Date.now()}`, ...data };
  store.users.push(newUser);
  return newUser;
};

exports.updateUser = async (id, data) => {
  if (isDbConnected()) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      const u = await User.findByIdAndUpdate(id, data, { new: true });
      if (u) return u;
    }
    return await User.findOneAndUpdate({ id: id }, data, { new: true });
  }
  const idx = store.users.findIndex(u => u.id === id);
  if (idx !== -1) {
    store.users[idx] = { ...store.users[idx], ...data };
    return store.users[idx];
  }
  return null;
};

// Rides
exports.findRides = async (query = {}) => {
  if (isDbConnected()) {
    const mongoQuery = {};
    if (query.origin) mongoQuery.origin = new RegExp(query.origin, 'i');
    if (query.destination) mongoQuery.destination = new RegExp(query.destination, 'i');
    if (query.date) mongoQuery.date = query.date;
    if (query.seatsAvailable) mongoQuery.seatsAvailable = { $gte: query.seatsAvailable };
    if (query.contributionAmount) mongoQuery.contributionAmount = { $lte: query.contributionAmount };
    return await Ride.find(mongoQuery);
  }
  let list = [...store.rides];
  if (query.origin) list = list.filter(r => r.origin.toLowerCase().includes(query.origin.toLowerCase()));
  if (query.destination) list = list.filter(r => r.destination.toLowerCase().includes(query.destination.toLowerCase()));
  if (query.date) list = list.filter(r => r.date === query.date);
  if (query.seatsAvailable) list = list.filter(r => r.seatsAvailable >= query.seatsAvailable);
  if (query.contributionAmount) list = list.filter(r => r.contributionAmount <= query.contributionAmount);
  return list;
};

exports.findRideById = async (id) => {
  if (isDbConnected()) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      const r = await Ride.findById(id);
      if (r) return r;
    }
    return await Ride.findOne({ id: id });
  }
  return store.rides.find(r => r.id === id);
};

exports.createRide = async (data) => {
  if (isDbConnected()) {
    return await Ride.create(data);
  }
  const newRide = { id: data.id || `ride_${Date.now()}`, passengers: [], ...data };
  store.rides.push(newRide);
  return newRide;
};

exports.updateRide = async (id, data) => {
  if (isDbConnected()) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      const r = await Ride.findByIdAndUpdate(id, data, { new: true });
      if (r) return r;
    }
    return await Ride.findOneAndUpdate({ id: id }, data, { new: true });
  }
  const idx = store.rides.findIndex(r => r.id === id);
  if (idx !== -1) {
    store.rides[idx] = { ...store.rides[idx], ...data };
    return store.rides[idx];
  }
  return null;
};

// Bookings
exports.findBookings = async (query = {}) => {
  if (isDbConnected()) {
    const mongoQuery = {};
    if (query.passengerId) mongoQuery.passengerId = query.passengerId;
    if (query.rideId) mongoQuery.rideId = query.rideId;
    if (query.rideIds) mongoQuery.rideId = { $in: query.rideIds };
    return await Booking.find(mongoQuery);
  }
  let list = [...store.bookings];
  if (query.passengerId) list = list.filter(b => b.passengerId === query.passengerId);
  if (query.rideId) list = list.filter(b => b.rideId === query.rideId);
  if (query.rideIds) list = list.filter(b => query.rideIds.includes(b.rideId));
  return list;
};

exports.findBookingById = async (id) => {
  if (isDbConnected()) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      const b = await Booking.findById(id);
      if (b) return b;
    }
    return await Booking.findOne({ id: id });
  }
  return store.bookings.find(b => b.id === id);
};

exports.createBooking = async (data) => {
  if (isDbConnected()) {
    return await Booking.create(data);
  }
  const newBooking = { id: data.id || `booking_${Date.now()}`, createdAt: new Date().toISOString(), ...data };
  store.bookings.push(newBooking);
  return newBooking;
};

exports.updateBooking = async (id, data) => {
  if (isDbConnected()) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      const b = await Booking.findByIdAndUpdate(id, data, { new: true });
      if (b) return b;
    }
    return await Booking.findOneAndUpdate({ id: id }, data, { new: true });
  }
  const idx = store.bookings.findIndex(b => b.id === id);
  if (idx !== -1) {
    store.bookings[idx] = { ...store.bookings[idx], ...data };
    return store.bookings[idx];
  }
  return null;
};

// Messages
exports.findMessages = async (query = {}) => {
  if (isDbConnected()) {
    return await Message.find(query);
  }
  let list = [...store.messages];
  if (query.rideId) list = list.filter(m => m.rideId === query.rideId);
  return list;
};

exports.createMessage = async (data) => {
  if (isDbConnected()) {
    return await Message.create(data);
  }
  const newMsg = { id: data.id || `msg_${Date.now()}`, timestamp: new Date().toISOString(), ...data };
  store.messages.push(newMsg);
  return newMsg;
};

// PassengerRequests
exports.findPassengerRequests = async (query = {}) => {
  if (isDbConnected()) {
    const mongoQuery = {};
    if (query.passengerId) mongoQuery.passengerId = query.passengerId;
    if (query.origin) mongoQuery.origin = new RegExp(query.origin, 'i');
    if (query.destination) mongoQuery.destination = new RegExp(query.destination, 'i');
    return await PassengerRequest.find(mongoQuery);
  }
  let list = [...store.passengerRequests];
  if (query.passengerId) list = list.filter(r => r.passengerId === query.passengerId);
  if (query.origin) list = list.filter(r => r.origin.toLowerCase().includes(query.origin.toLowerCase()));
  if (query.destination) list = list.filter(r => r.destination.toLowerCase().includes(query.destination.toLowerCase()));
  return list;
};

exports.findPassengerRequestById = async (id) => {
  if (isDbConnected()) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      const pr = await PassengerRequest.findById(id);
      if (pr) return pr;
    }
    return await PassengerRequest.findOne({ id: id });
  }
  return store.passengerRequests.find(r => r.id === id);
};

exports.createPassengerRequest = async (data) => {
  if (isDbConnected()) {
    return await PassengerRequest.create(data);
  }
  const newReq = { id: data.id || `pr_${Date.now()}`, createdAt: new Date().toISOString(), ...data };
  store.passengerRequests.push(newReq);
  return newReq;
};

exports.updatePassengerRequest = async (id, data) => {
  if (isDbConnected()) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      const pr = await PassengerRequest.findByIdAndUpdate(id, data, { new: true });
      if (pr) return pr;
    }
    return await PassengerRequest.findOneAndUpdate({ id: id }, data, { new: true });
  }
  const idx = store.passengerRequests.findIndex(r => r.id === id);
  if (idx !== -1) {
    store.passengerRequests[idx] = { ...store.passengerRequests[idx], ...data };
    return store.passengerRequests[idx];
  }
  return null;
};
