const dbService = require('../services/dbService');

exports.getStats = async (req, res, next) => {
  try {
    const rides = await dbService.findRides();
    const users = await dbService.findUsers();
    const bookings = await dbService.findBookings();

    const totalRevenue = bookings
      .filter(b => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + b.price, 0);

    res.json({
      success: true,
      stats: {
        totalRides: rides.length,
        totalUsers: users.length,
        totalBookings: bookings.length,
        totalRevenue,
        activeDrivers: users.filter(u => u.isDriver).length,
        verifiedUsers: users.filter(u => u.verificationStatus === 'verified').length
      }
    });
  } catch (err) {
    next(err);
  }
};
