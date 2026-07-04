const jwt = require('jsonwebtoken');
const dbService = require('../services/dbService');

const JWT_SECRET = process.env.JWT_SECRET || 'ridelink_jwt_secret_key_2026';

exports.login = async (req, res, next) => {
  try {
    const { email, phone } = req.body;
    
    if (!email && !phone) {
      return res.status(400).json({ success: false, error: 'Email or phone required' });
    }

    let user;
    if (email) {
      const users = await dbService.findUsers({ email });
      user = users[0];
    } else if (phone) {
      const users = await dbService.findUsers({ phone });
      user = users[0];
    }

    if (!user) {
      return res.status(404).json({ success: false, error: 'Account not found. Please sign up first.' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, user, token });
  } catch (err) {
    next(err);
  }
};

exports.signup = async (req, res, next) => {
  try {
    const { email, phone, name, isDriver, profilePicture } = req.body;

    if (!email || !phone || !name) {
      return res.status(400).json({ success: false, error: 'Name, email, and phone are required for registration.' });
    }

    // Check if user already exists
    let existingUser;
    const usersByEmail = await dbService.findUsers({ email });
    if (usersByEmail.length > 0) {
      existingUser = usersByEmail[0];
    } else {
      const usersByPhone = await dbService.findUsers({ phone });
      if (usersByPhone.length > 0) {
        existingUser = usersByPhone[0];
      }
    }

    if (existingUser) {
      return res.status(400).json({ success: false, error: 'An account with this email or phone number already exists.' });
    }

    const newUser = await dbService.createUser({
      name,
      email,
      phone,
      profilePicture: profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80",
      rating: 5.0,
      reviewsCount: 0,
      isDriver: !!isDriver,
      verificationStatus: "pending",
      governmentIdVerified: false,
      vehicleDetails: isDriver ? { model: "Tesla Model Y", color: "White", plateNumber: "CA 8NEW12", seats: 4 } : null,
      bio: "Just joined RideLink!"
    });

    const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ success: true, user: newUser, token });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await dbService.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const updated = await dbService.updateUser(req.user.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, user: updated });
  } catch (err) {
    next(err);
  }
};
