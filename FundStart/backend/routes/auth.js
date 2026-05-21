const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { users } = require('../data/seed');
const { sessions, authenticate } = require('../middleware/auth');

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required.' });
  }

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = uuidv4();
  sessions[token] = { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar };

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
  });
});

router.post('/register', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields required.' });
  }
  if (!['influencer', 'donor'].includes(role)) {
    return res.status(400).json({ error: 'Role must be influencer or donor.' });
  }
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ error: 'Email already registered.' });
  }

  const newUser = {
    id: uuidv4(),
    name, email, password,
    role,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);

  const token = uuidv4();
  sessions[token] = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, avatar: newUser.avatar };

  res.status(201).json({
    token,
    user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, avatar: newUser.avatar }
  });
});

router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

router.post('/logout', authenticate, (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  delete sessions[token];
  res.json({ message: 'Logged out successfully.' });
});

module.exports = router;
