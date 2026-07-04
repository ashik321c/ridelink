const express = require('express');
const router = express.Router();
const rideController = require('../controllers/rideController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', rideController.searchRides);
router.get('/:id', rideController.getRideDetails);
router.post('/', authMiddleware, rideController.publishRide);

module.exports = router;
