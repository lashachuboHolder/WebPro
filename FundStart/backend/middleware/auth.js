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

// Like `authenticate`, but doesn't reject when there's no/invalid token.
// Used on public routes that need to know "who's asking" to decide what to reveal
// (e.g. a draft campaign is visible to its owner/an admin, but 404s for everyone else).
const authenticateOptional = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token && sessions[token]) req.user = sessions[token];
  next();
};

module.exports = { authenticate, authenticateOptional, requireRole, sessions };
