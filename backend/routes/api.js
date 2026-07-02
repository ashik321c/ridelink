const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const store = require('../store');

// Helper to check if MongoDB is connected
const isDbConnected = () => {
  return mongoose.connection.readyState === 1;
};

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

// Register/Login simulation
router.post('/auth/login', (req, res) => {
  const { email, phone, name, isDriver } = req.body;
  
  // Find or create user
  let user;
  if (email) {
    user = store.users.find(u => u.email === email);
  } else if (phone) {
    user = store.users.find(u => u.phone === phone);
  }

  if (!user) {
    // Create new user in store
    user = {
      id: `user_${Date.now()}`,
      name: name || email ? email.split('@')[0] : "New User",
      email: email || `${phone}@ridelink.com`,
      phone: phone || "+1 555-0100",
      profilePicture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80",
      rating: 5.0,
      reviewsCount: 0,
      isDriver: !!isDriver,
      verificationStatus: "pending",
      governmentIdVerified: false,
      vehicleDetails: isDriver ? { model: "Tesla Model Y", color: "White", plateNumber: "CA 8NEW12", seats: 4 } : null,
      bio: "Just joined RideLink!"
    };
    store.users.push(user);
  }

  res.json({ success: true, user, token: `mock_jwt_token_${user.id}` });
});

// Get current user
router.get('/auth/me', (req, res) => {
  // Return the first user by default for easy demo testing
  const authHeader = req.headers.authorization;
  let userId = 'user_1'; // Default
  if (authHeader && authHeader.startsWith('Bearer mock_jwt_token_')) {
    userId = authHeader.replace('Bearer mock_jwt_token_', '');
  }
  const user = store.users.find(u => u.id === userId) || store.users[0];
  res.json({ success: true, user });
});

// Update profile
router.put('/auth/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  let userId = 'user_1';
  if (authHeader && authHeader.startsWith('Bearer mock_jwt_token_')) {
    userId = authHeader.replace('Bearer mock_jwt_token_', '');
  }
  const userIndex = store.users.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    store.users[userIndex] = { ...store.users[userIndex], ...req.body };
    res.json({ success: true, user: store.users[userIndex] });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
});

// ============================================================================
// RIDE ROUTES
// ============================================================================

// Search rides
router.get('/rides', (req, res) => {
  const { from, to, date, seats, vehicle, maxPrice } = req.query;
  
  let filteredRides = [...store.rides];

  if (from) {
    filteredRides = filteredRides.filter(r => r.origin.toLowerCase().includes(from.toLowerCase()));
  }
  if (to) {
    filteredRides = filteredRides.filter(r => r.destination.toLowerCase().includes(to.toLowerCase()));
  }
  if (date) {
    filteredRides = filteredRides.filter(r => r.date === date);
  }
  if (seats) {
    filteredRides = filteredRides.filter(r => r.seatsAvailable >= parseInt(seats));
  }
  if (maxPrice) {
    filteredRides = filteredRides.filter(r => r.contributionAmount <= parseInt(maxPrice));
  }

  res.json({ success: true, rides: filteredRides });
});

// Get ride details
router.get('/rides/:id', (req, res) => {
  const ride = store.rides.find(r => r.id === req.params.id);
  if (!ride) {
    return res.status(404).json({ success: false, message: 'Ride not found' });
  }
  
  // Attach driver info
  const driver = store.users.find(u => u.id === ride.driverId);
  res.json({ success: true, ride, driver });
});

// Create/Publish a ride
router.post('/rides', (req, res) => {
  const authHeader = req.headers.authorization;
  let userId = 'user_1';
  if (authHeader && authHeader.startsWith('Bearer mock_jwt_token_')) {
    userId = authHeader.replace('Bearer mock_jwt_token_', '');
  }
  const driver = store.users.find(u => u.id === userId) || store.users[0];

  const { origin, destination, date, time, seatsAvailable, contributionAmount, vehicle, womenOnly } = req.body;

  const newRide = {
    id: `ride_${Date.now()}`,
    driverId: driver.id,
    driverName: driver.name,
    driverPhoto: driver.profilePicture,
    driverRating: driver.rating,
    origin,
    destination,
    date,
    time,
    seatsAvailable: parseInt(seatsAvailable),
    totalSeats: parseInt(seatsAvailable),
    contributionAmount: parseInt(contributionAmount),
    vehicle: vehicle || (driver.vehicleDetails ? `${driver.vehicleDetails.model} (${driver.vehicleDetails.color})` : "Standard Car"),
    womenOnly: !!womenOnly,
    status: 'active',
    passengers: []
  };

  store.rides.push(newRide);
  res.status(201).json({ success: true, ride: newRide });
});

// ============================================================================
// BOOKING ROUTES
// ============================================================================

// Create booking request
router.post('/bookings', (req, res) => {
  const authHeader = req.headers.authorization;
  let userId = 'user_2'; // default to passenger Sarah Miller
  if (authHeader && authHeader.startsWith('Bearer mock_jwt_token_')) {
    userId = authHeader.replace('Bearer mock_jwt_token_', '');
  }
  const passenger = store.users.find(u => u.id === userId) || store.users[1];

  const { rideId, seatsBooked } = req.body;
  const ride = store.rides.find(r => r.id === rideId);

  if (!ride) {
    return res.status(404).json({ success: false, message: 'Ride not found' });
  }

  if (ride.seatsAvailable < parseInt(seatsBooked)) {
    return res.status(400).json({ success: false, message: 'Not enough seats available' });
  }

  const price = ride.contributionAmount * parseInt(seatsBooked);

  const newBooking = {
    id: `booking_${Date.now()}`,
    rideId,
    passengerId: passenger.id,
    passengerName: passenger.name,
    seatsBooked: parseInt(seatsBooked),
    status: 'pending', // pending, accepted, rejected, completed
    paymentStatus: 'pending',
    price,
    createdAt: new Date().toISOString()
  };

  store.bookings.push(newBooking);
  res.status(201).json({ success: true, booking: newBooking });
});

// Get user bookings (as passenger or driver)
router.get('/bookings', (req, res) => {
  const authHeader = req.headers.authorization;
  let userId = 'user_2';
  if (authHeader && authHeader.startsWith('Bearer mock_jwt_token_')) {
    userId = authHeader.replace('Bearer mock_jwt_token_', '');
  }

  const user = store.users.find(u => u.id === userId);
  
  // If driver, return bookings for their rides. If passenger, return bookings they made.
  let userBookings = [];
  if (user && user.isDriver) {
    const driverRideIds = store.rides.filter(r => r.driverId === userId).map(r => r.id);
    userBookings = store.bookings.filter(b => driverRideIds.includes(b.rideId));
  } else {
    userBookings = store.bookings.filter(b => b.passengerId === userId);
  }

  // Attach ride details
  const bookingsWithRides = userBookings.map(booking => {
    const ride = store.rides.find(r => r.id === booking.rideId);
    return { ...booking, ride };
  });

  res.json({ success: true, bookings: bookingsWithRides });
});

// Update booking status (Driver accepts/rejects or complete trip)
router.put('/bookings/:id', (req, res) => {
  const { status, paymentStatus } = req.body;
  const bookingIndex = store.bookings.findIndex(b => b.id === req.params.id);

  if (bookingIndex === -1) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  const booking = store.bookings[bookingIndex];
  const ride = store.rides.find(r => r.id === booking.rideId);

  if (status) {
    booking.status = status;
    
    // If accepted, deduct seats
    if (status === 'accepted' && ride) {
      ride.seatsAvailable = Math.max(0, ride.seatsAvailable - booking.seatsBooked);
      ride.passengers.push(booking.passengerId);
    }
  }

  if (paymentStatus) {
    booking.paymentStatus = paymentStatus;
  }

  store.bookings[bookingIndex] = booking;
  res.json({ success: true, booking, ride });
});

// ============================================================================
// CHAT ROUTES
// ============================================================================

// Get chat messages for a specific ride
router.get('/chats/:rideId', (req, res) => {
  const rideId = req.params.rideId;
  const chatMessages = store.messages.filter(m => m.rideId === rideId);
  res.json({ success: true, messages: chatMessages });
});

// Send a message via HTTP
router.post('/chats/:rideId', (req, res) => {
  const { text } = req.body;
  const rideId = req.params.rideId;

  const authHeader = req.headers.authorization;
  let userId = 'user_2';
  if (authHeader && authHeader.startsWith('Bearer mock_jwt_token_')) {
    userId = authHeader.replace('Bearer mock_jwt_token_', '');
  }
  const sender = store.users.find(u => u.id === userId) || store.users[1];

  const newMessage = {
    id: `msg_${Date.now()}`,
    rideId,
    senderId: sender.id,
    senderName: sender.name,
    text,
    timestamp: new Date().toISOString()
  };

  store.messages.push(newMessage);
  res.status(201).json({ success: true, message: newMessage });
});

// ============================================================================
// ADMIN / ANALYTICS ROUTES
// ============================================================================
router.get('/admin/stats', (req, res) => {
  const totalRides = store.rides.length;
  const totalUsers = store.users.length;
  const totalBookings = store.bookings.length;
  const totalRevenue = store.bookings
    .filter(b => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + b.price, 0);

  res.json({
    success: true,
    stats: {
      totalRides,
      totalUsers,
      totalBookings,
      totalRevenue,
      activeDrivers: store.users.filter(u => u.isDriver).length,
      verifiedUsers: store.users.filter(u => u.verificationStatus === 'verified').length
    }
  });
});

// ============================================================================
// PASSENGER RIDE REQUEST ROUTES
// ============================================================================

// Get passenger requests (check auto-expiration first)
router.get('/passenger-requests', (req, res) => {
  const authHeader = req.headers.authorization;
  let userId = null;
  if (authHeader && authHeader.startsWith('Bearer mock_jwt_token_')) {
    userId = authHeader.replace('Bearer mock_jwt_token_', '');
  }

  const todayStr = new Date().toISOString().split('T')[0];

  // Auto-expire requests whose date is past
  store.passengerRequests.forEach(reqObj => {
    if (reqObj.date < todayStr && reqObj.status === 'searching') {
      reqObj.status = 'expired';
    }
  });

  const { passengerId, from, to } = req.query;
  let requests = [...store.passengerRequests];

  if (passengerId) {
    requests = requests.filter(r => r.passengerId === passengerId);
  }
  if (from) {
    requests = requests.filter(r => r.origin.toLowerCase().includes(from.toLowerCase()));
  }
  if (to) {
    requests = requests.filter(r => r.destination.toLowerCase().includes(to.toLowerCase()));
  }

  res.json({ success: true, requests });
});

// Create passenger request
router.post('/passenger-requests', (req, res) => {
  const authHeader = req.headers.authorization;
  let userId = 'user_2'; // default to passenger Sarah
  if (authHeader && authHeader.startsWith('Bearer mock_jwt_token_')) {
    userId = authHeader.replace('Bearer mock_jwt_token_', '');
  }
  const passenger = store.users.find(u => u.id === userId) || store.users[1];

  const { origin, destination, date, time, flexibleTime, seatsNeeded, maxPrice, note } = req.body;

  const newRequest = {
    id: `pr_${Date.now()}`,
    passengerId: passenger.id,
    passengerName: passenger.name,
    passengerPhoto: passenger.profilePicture,
    passengerRating: passenger.rating,
    isVerified: passenger.verificationStatus === 'verified' || passenger.governmentIdVerified,
    origin,
    destination,
    date,
    time,
    flexibleTime: flexibleTime || 'Any Time',
    seatsNeeded: parseInt(seatsNeeded) || 1,
    maxPrice: parseInt(maxPrice) || 300,
    note: note || '',
    status: 'searching',
    createdAt: new Date().toISOString()
  };

  store.passengerRequests.push(newRequest);

  // Trigger side notification for matching drivers on this route
  res.status(201).json({ success: true, request: newRequest });
});

// Update request (offer, accept offer, repost)
router.put('/passenger-requests/:id', (req, res) => {
  const requestId = req.params.id;
  const requestIndex = store.passengerRequests.findIndex(r => r.id === requestId);

  if (requestIndex === -1) {
    return res.status(404).json({ success: false, message: 'Request not found' });
  }

  const request = store.passengerRequests[requestIndex];
  const { action, offeredRideId, date, time } = req.body;

  if (action === 'send_offer') {
    // Driver sends offer
    request.status = 'offer_received';
    request.offeredRideId = offeredRideId;
    
    // Store offering driver details
    const ride = store.rides.find(r => r.id === offeredRideId);
    if (ride) {
      request.offeredRide = ride;
    }
  } else if (action === 'accept_offer') {
    // Passenger accepts driver's offer
    const ride = store.rides.find(r => r.id === request.offeredRideId);
    if (!ride) {
      return res.status(404).json({ success: false, message: 'Offered ride is no longer available' });
    }

    // Auto-create a booking for this passenger
    const newBooking = {
      id: `booking_${Date.now()}`,
      rideId: ride.id,
      passengerId: request.passengerId,
      passengerName: request.passengerName,
      seatsBooked: request.seatsNeeded,
      status: 'accepted',
      paymentStatus: 'paid',
      price: ride.contributionAmount * request.seatsNeeded,
      createdAt: new Date().toISOString()
    };

    store.bookings.push(newBooking);
    
    // Update ride seats
    ride.seatsAvailable = Math.max(0, ride.seatsAvailable - request.seatsNeeded);
    ride.passengers.push(request.passengerId);

    request.status = 'confirmed';
    request.bookingId = newBooking.id;
  } else if (action === 'repost') {
    // Repost expired request
    request.status = 'searching';
    if (date) request.date = date;
    if (time) request.time = time;
  } else if (action === 'complete') {
    request.status = 'completed';
  } else if (action === 'cancel') {
    request.status = 'cancelled';
  }

  store.passengerRequests[requestIndex] = request;
  res.json({ success: true, request });
});

module.exports = router;
