const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  driverId: { type: String, required: true },
  driverName: { type: String, required: true },
  driverPhoto: { type: String, default: '' },
  driverRating: { type: Number, default: 5.0 },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  seatsAvailable: { type: Number, required: true },
  totalSeats: { type: Number, required: true },
  contributionAmount: { type: Number, required: true },
  vehicle: { type: String, default: 'Standard Car' },
  womenOnly: { type: Boolean, default: false },
  status: { type: String, default: 'active' },
  passengers: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Ride', rideSchema);
