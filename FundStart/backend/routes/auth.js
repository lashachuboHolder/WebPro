const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../lib/supabase');
const { sessions, authenticate } = require('../middleware/auth');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('password', password)
    .limit(1);

  if (error) return res.status(500).json({ error: 'Database error.' });
  const user = data[0];
  if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

  const token = uuidv4();
  sessions[token] = { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar };

  res.json({ token, user: sessions[token] });
});

router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) return res.status(400).json({ error: 'All fields required.' });
  if (!['influencer', 'donor'].includes(role)) return res.status(400).json({ error: 'Role must be influencer or donor.' });

  const { data: existing } = await supabase.from('users').select('id').eq('email', email).limit(1);
  if (existing?.length) return res.status(409).json({ error: 'Email already registered.' });

  const { data, error } = await supabase
    .from('users')
    .insert({ name, email, password, role, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}` })
    .select();

  if (error) return res.status(500).json({ error: 'Database error.' });
  const newUser = data[0];

  const token = uuidv4();
  sessions[token] = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, avatar: newUser.avatar };

  res.status(201).json({ token, user: sessions[token] });
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
