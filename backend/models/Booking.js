const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  rideId: { type: String, required: true },
  passengerId: { type: String, required: true },
  passengerName: { type: String, required: true },
  seatsBooked: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  paymentStatus: { type: String, default: 'pending' },
  price: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
