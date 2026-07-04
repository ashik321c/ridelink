const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ridelink_jwt_secret_key_2026';

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'Authorization header required' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ success: false, error: 'Token format must be Bearer <token>' });
  }

  const token = parts[1];

  // Check for backward-compatible mock token format
  if (token.startsWith('mock_jwt_token_')) {
    const userId = token.replace('mock_jwt_token_', '');
    req.user = { id: userId };
    return next();
  }

  // Otherwise verify as standard JWT
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // will contain { id }
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired authorization token' });
  }
};
