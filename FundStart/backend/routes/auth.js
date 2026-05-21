const express = require('express');
const router = express.Router();
const { users, newId } = require('../store');

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: 'invalid credentials' });
  const { password: _, ...safeUser } = user;
  res.json(safeUser);
});

router.post('/register', (req, res) => {
  const { username, password, name } = req.body;
  if (!username || !password || !name)
    return res.status(400).json({ error: 'credidentials missing' });
  if (users.find(u => u.username === username))
    return res.status(409).json({ error: 'username already taken' });

  const user = { id: newId('users'), username, password, role: 'donor', name };
  users.push(user);
  const { password: _, ...safeUser } = user;
  res.status(201).json(safeUser);
});

module.exports = router;
