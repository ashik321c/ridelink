const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  model: { type: String, default: '' },
  color: { type: String, default: '' },
  plateNumber: { type: String, default: '' },
  seats: { type: Number, default: 4 }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  profilePicture: { type: String, default: '' },
  rating: { type: Number, default: 5.0 },
  reviewsCount: { type: Number, default: 0 },
  isDriver: { type: Boolean, default: false },
  verificationStatus: { type: String, default: 'pending' },
  governmentIdVerified: { type: Boolean, default: false },
  vehicleDetails: { type: vehicleSchema, default: null },
  bio: { type: String, default: 'Just joined RideLink!' },
  trustedContact: {
    name: { type: String, default: '' },
    relationship: { type: String, default: '' },
    phone: { type: String, default: '' }
  }
}, { timestamps: true });

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
