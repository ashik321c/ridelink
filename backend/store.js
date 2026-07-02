// In-Memory Data Store Fallback for RideLink
// This is used when MongoDB is not connected, ensuring a fully functional mock backend.

const users = [
  {
    id: "user_1",
    name: "Alex Johnson",
    email: "alex@ridelink.com",
    phone: "+1 555-0199",
    profilePicture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80",
    rating: 4.9,
    reviewsCount: 38,
    isDriver: true,
    verificationStatus: "verified",
    governmentIdVerified: true,
    vehicleDetails: {
      model: "Tesla Model 3",
      color: "Deep Blue",
      plateNumber: "CA 7XYZ89",
      seats: 4
    },
    bio: "Tech worker commuting daily between San Francisco and San Jose. Quiet driver, loves podcasts."
  },
  {
    id: "user_2",
    name: "Sarah Miller",
    email: "sarah@ridelink.com",
    phone: "+1 555-0144",
    profilePicture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80",
    rating: 4.8,
    reviewsCount: 12,
    isDriver: false,
    verificationStatus: "verified",
    governmentIdVerified: true,
    bio: "UI/UX Designer who travels frequently. Friendly and loves meeting new people!"
  },
  {
    id: "user_3",
    name: "Michael Chen",
    email: "michael@ridelink.com",
    phone: "+1 555-0155",
    profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80",
    rating: 4.7,
    reviewsCount: 22,
    isDriver: true,
    verificationStatus: "verified",
    governmentIdVerified: true,
    vehicleDetails: {
      model: "Honda Civic",
      color: "Sleek Silver",
      plateNumber: "CA 3ABC12",
      seats: 3
    },
    bio: "Frequent traveler. I drive safe and keep my car super clean. Music preferences: Indie Rock."
  }
];

const rides = [
  {
    id: "ride_1",
    driverId: "user_1",
    driverName: "Alex Johnson",
    driverPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80",
    driverRating: 4.9,
    origin: "Kochi",
    destination: "Kannur",
    date: "2026-06-27",
    time: "08:00",
    seatsAvailable: 3,
    totalSeats: 4,
    contributionAmount: 450,
    vehicle: "Tesla Model 3 (Blue)",
    womenOnly: false,
    status: "active",
    passengers: []
  },
  {
    id: "ride_2",
    driverId: "user_3",
    driverName: "Michael Chen",
    driverPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80",
    driverRating: 4.7,
    origin: "Bangalore",
    destination: "Chennai",
    date: "2026-06-28",
    time: "06:30",
    seatsAvailable: 2,
    totalSeats: 3,
    contributionAmount: 600,
    vehicle: "Honda Civic (Silver)",
    womenOnly: false,
    status: "active",
    passengers: []
  },
  {
    id: "ride_3",
    driverId: "user_1",
    driverName: "Alex Johnson",
    driverPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80",
    driverRating: 4.9,
    origin: "Kochi",
    destination: "Trivandrum",
    date: "2026-06-29",
    time: "14:00",
    seatsAvailable: 4,
    totalSeats: 4,
    contributionAmount: 380,
    vehicle: "Tesla Model 3 (Blue)",
    womenOnly: true,
    status: "active",
    passengers: []
  }
];

const bookings = [
  {
    id: "booking_1",
    rideId: "ride_1",
    passengerId: "user_2",
    passengerName: "Sarah Miller",
    seatsBooked: 1,
    status: "accepted",
    paymentStatus: "paid",
    price: 450,
    createdAt: new Date().toISOString()
  }
];

const messages = [
  {
    id: "msg_1",
    rideId: "ride_1",
    senderId: "user_2",
    senderName: "Sarah Miller",
    text: "Hi Alex! Where should we meet in Kochi for the pickup?",
    timestamp: "2026-06-25T14:30:00Z"
  },
  {
    id: "msg_2",
    rideId: "ride_1",
    senderId: "user_1",
    senderName: "Alex Johnson",
    text: "Hey Sarah! Let's meet near the Lulu Mall main entrance. Does 8 AM work?",
    timestamp: "2026-06-25T14:32:00Z"
  }
];

const passengerRequests = [
  {
    id: "pr_1",
    passengerId: "user_2",
    passengerName: "Sarah Miller",
    passengerPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80",
    passengerRating: 4.8,
    isVerified: true,
    origin: "Kochi",
    destination: "Kannur",
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 days from now
    time: "09:00",
    flexibleTime: "±1 hour",
    seatsNeeded: 2,
    maxPrice: 500,
    note: "Traveling for a family weekend. I have one small travel suitcase.",
    status: "searching", // searching, driver_found, offer_received, confirmed, completed, expired
    createdAt: new Date().toISOString()
  },
  {
    id: "pr_2",
    passengerId: "user_2",
    passengerName: "Sarah Miller",
    passengerPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80",
    passengerRating: 4.8,
    isVerified: true,
    origin: "Kochi",
    destination: "Calicut",
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // yesterday (for testing expiration)
    time: "08:00",
    flexibleTime: "±30 min",
    seatsNeeded: 1,
    maxPrice: 400,
    note: "Looking for an early ride.",
    status: "expired",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

module.exports = {
  users,
  rides,
  bookings,
  messages,
  passengerRequests
};
