const dbService = require('../services/dbService');

exports.searchRides = async (req, res, next) => {
  try {
    const { from, to, date, seats, maxPrice } = req.query;
    const query = {};
    if (from) query.origin = from;
    if (to) query.destination = to;
    if (date) query.date = date;
    if (seats) query.seatsAvailable = parseInt(seats);
    if (maxPrice) query.contributionAmount = parseInt(maxPrice);

    const ridesList = await dbService.findRides(query);
    res.json({ success: true, rides: ridesList });
  } catch (err) {
    next(err);
  }
};

exports.getRideDetails = async (req, res, next) => {
  try {
    const ride = await dbService.findRideById(req.params.id);
    if (!ride) {
      return res.status(404).json({ success: false, error: 'Ride not found' });
    }
    const driver = await dbService.findUserById(ride.driverId);
    res.json({ success: true, ride, driver });
  } catch (err) {
    next(err);
  }
};

exports.publishRide = async (req, res, next) => {
  try {
    const driver = await dbService.findUserById(req.user.id);
    if (!driver) {
      return res.status(404).json({ success: false, error: 'Driver profile not found' });
    }

    const { origin, destination, date, time, seatsAvailable, contributionAmount, vehicle, womenOnly } = req.body;

    const newRide = await dbService.createRide({
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
      status: 'active'
    });

    res.status(201).json({ success: true, ride: newRide });
  } catch (err) {
    next(err);
  }
};
