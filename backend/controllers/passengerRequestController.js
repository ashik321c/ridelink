const dbService = require('../services/dbService');

exports.getPassengerRequests = async (req, res, next) => {
  try {
    const { passengerId, from, to } = req.query;
    const query = {};
    if (passengerId) query.passengerId = passengerId;
    if (from) query.origin = from;
    if (to) query.destination = to;

    const todayStr = new Date().toISOString().split('T')[0];
    const requests = await dbService.findPassengerRequests(query);

    for (const reqObj of requests) {
      if (reqObj.date < todayStr && reqObj.status === 'searching') {
        await dbService.updatePassengerRequest(reqObj.id, { status: 'expired' });
        reqObj.status = 'expired';
      }
    }

    res.json({ success: true, requests });
  } catch (err) {
    next(err);
  }
};

exports.createPassengerRequest = async (req, res, next) => {
  try {
    const passenger = await dbService.findUserById(req.user.id);
    if (!passenger) {
      return res.status(404).json({ success: false, error: 'Passenger user not found' });
    }

    const { origin, destination, date, time, flexibleTime, seatsNeeded, maxPrice, note } = req.body;

    const newRequest = await dbService.createPassengerRequest({
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
      status: 'searching'
    });

    res.status(201).json({ success: true, request: newRequest });
  } catch (err) {
    next(err);
  }
};

exports.updatePassengerRequest = async (req, res, next) => {
  try {
    const request = await dbService.findPassengerRequestById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    const { action, offeredRideId, date, time } = req.body;
    const updateFields = {};

    if (action === 'send_offer') {
      updateFields.status = 'offer_received';
      updateFields.offeredRideId = offeredRideId;
      const ride = await dbService.findRideById(offeredRideId);
      if (ride) {
        const rideData = ride.toObject ? ride.toObject() : { ...ride };
        updateFields.offeredRide = rideData;
      }
    } else if (action === 'accept_offer') {
      const rideId = request.offeredRideId;
      const ride = await dbService.findRideById(rideId);
      if (!ride) {
        return res.status(404).json({ success: false, error: 'Offered ride is no longer available' });
      }

      const newBooking = await dbService.createBooking({
        rideId: ride.id,
        passengerId: request.passengerId,
        passengerName: request.passengerName,
        seatsBooked: request.seatsNeeded,
        status: 'accepted',
        paymentStatus: 'paid',
        price: ride.contributionAmount * request.seatsNeeded
      });

      const seatsLeft = Math.max(0, ride.seatsAvailable - request.seatsNeeded);
      const riders = [...ride.passengers, request.passengerId];
      await dbService.updateRide(ride.id, { seatsAvailable: seatsLeft, passengers: riders });

      updateFields.status = 'confirmed';
      updateFields.bookingId = newBooking.id;
    } else if (action === 'repost') {
      updateFields.status = 'searching';
      if (date) updateFields.date = date;
      if (time) updateFields.time = time;
    } else if (action === 'complete') {
      updateFields.status = 'completed';
    } else if (action === 'cancel') {
      updateFields.status = 'cancelled';
    }

    const updatedRequest = await dbService.updatePassengerRequest(request.id, updateFields);
    res.json({ success: true, request: updatedRequest });
  } catch (err) {
    next(err);
  }
};
