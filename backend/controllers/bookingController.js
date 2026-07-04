const dbService = require('../services/dbService');

exports.createBooking = async (req, res, next) => {
  try {
    const passenger = await dbService.findUserById(req.user.id);
    if (!passenger) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const { rideId, seatsBooked } = req.body;
    const ride = await dbService.findRideById(rideId);

    if (!ride) {
      return res.status(404).json({ success: false, error: 'Ride not found' });
    }

    if (ride.seatsAvailable < parseInt(seatsBooked)) {
      return res.status(400).json({ success: false, error: 'Not enough seats available' });
    }

    const price = ride.contributionAmount * parseInt(seatsBooked);

    const newBooking = await dbService.createBooking({
      rideId,
      passengerId: passenger.id,
      passengerName: passenger.name,
      seatsBooked: parseInt(seatsBooked),
      status: 'pending',
      paymentStatus: 'pending',
      price
    });

    res.status(201).json({ success: true, booking: newBooking });
  } catch (err) {
    next(err);
  }
};

exports.getBookings = async (req, res, next) => {
  try {
    const userObj = await dbService.findUserById(req.user.id);
    if (!userObj) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    let userBookings = [];
    if (userObj.isDriver) {
      const rides = await dbService.findRides();
      const driverRideIds = rides.filter(r => r.driverId === userObj.id).map(r => r.id);
      userBookings = await dbService.findBookings({ rideIds: driverRideIds });
    } else {
      userBookings = await dbService.findBookings({ passengerId: userObj.id });
    }

    const bookingsWithRides = [];
    for (const booking of userBookings) {
      const bookingData = booking.toObject ? booking.toObject() : { ...booking };
      const ride = await dbService.findRideById(booking.rideId);
      const rideData = ride && (ride.toObject ? ride.toObject() : ride);
      bookingsWithRides.push({ ...bookingData, ride: rideData });
    }

    res.json({ success: true, bookings: bookingsWithRides });
  } catch (err) {
    next(err);
  }
};

exports.updateBooking = async (req, res, next) => {
  try {
    const { status, paymentStatus } = req.body;
    const booking = await dbService.findBookingById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    const updateFields = {};
    if (status) {
      updateFields.status = status;
      
      if (status === 'accepted' && booking.status !== 'accepted') {
        const ride = await dbService.findRideById(booking.rideId);
        if (ride) {
          const updatedSeats = Math.max(0, ride.seatsAvailable - booking.seatsBooked);
          const passengers = [...ride.passengers, booking.passengerId];
          await dbService.updateRide(ride.id, { seatsAvailable: updatedSeats, passengers });
        }
      }
    }

    if (paymentStatus) {
      updateFields.paymentStatus = paymentStatus;
    }

    const updatedBooking = await dbService.updateBooking(booking.id, updateFields);
    res.json({ success: true, booking: updatedBooking });
  } catch (err) {
    next(err);
  }
};
