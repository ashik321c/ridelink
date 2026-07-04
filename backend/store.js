// In-Memory Data Store Fallback for RideLink
// This is used when MongoDB is not connected, ensuring a fully functional mock backend.

const users = [];
const rides = [];
const bookings = [];
const messages = [];
const passengerRequests = [];

module.exports = {
  users,
  rides,
  bookings,
  messages,
  passengerRequests
};
