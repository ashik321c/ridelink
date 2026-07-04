const express = require('express');
const router = express.Router();
const passengerRequestController = require('../controllers/passengerRequestController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', passengerRequestController.getPassengerRequests);
router.post('/', authMiddleware, passengerRequestController.createPassengerRequest);
router.put('/:id', authMiddleware, passengerRequestController.updatePassengerRequest);

module.exports = router;
