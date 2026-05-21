// Simple token-based auth middleware (no JWT library needed for demo)
const { users } = require('../data/seed');

// In-memory session store
const sessions = {};

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !sessions[token]) {
    return res.status(401).json({ error: 'Unauthorized. Please login.' });
  }
  req.user = sessions[token];
  next();
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden. Insufficient permissions.' });
  }
  next();
};

module.exports = { authenticate, requireRole, sessions };
