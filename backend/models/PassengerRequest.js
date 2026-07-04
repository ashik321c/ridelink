const mongoose = require('mongoose');

const passengerRequestSchema = new mongoose.Schema({
  passengerId: { type: String, required: true },
  passengerName: { type: String, required: true },
  passengerPhoto: { type: String, default: '' },
  passengerRating: { type: Number, default: 5.0 },
  isVerified: { type: Boolean, default: false },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  flexibleTime: { type: String, default: 'Any Time' },
  seatsNeeded: { type: Number, default: 1 },
  maxPrice: { type: Number, default: 300 },
  note: { type: String, default: '' },
  status: { type: String, default: 'searching' },
  offeredRideId: { type: String, default: null },
  offeredRide: { type: mongoose.Schema.Types.Mixed, default: null },
  bookingId: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('PassengerRequest', passengerRequestSchema);
