const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/:rideId', authMiddleware, chatController.getMessages);
router.post('/:rideId', authMiddleware, chatController.sendMessage);

module.exports = router;
