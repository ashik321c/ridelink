const dbService = require('../services/dbService');

exports.getMessages = async (req, res, next) => {
  try {
    const { rideId } = req.params;
    const messages = await dbService.findMessages({ rideId });
    res.json({ success: true, messages });
  } catch (err) {
    next(err);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { rideId } = req.params;
    const { text } = req.body;
    
    const sender = await dbService.findUserById(req.user.id);
    if (!sender) {
      return res.status(404).json({ success: false, error: 'Sender user not found' });
    }

    const newMessage = await dbService.createMessage({
      rideId,
      senderId: sender.id,
      senderName: sender.name,
      text
    });

    res.status(201).json({ success: true, message: newMessage });
  } catch (err) {
    next(err);
  }
};
