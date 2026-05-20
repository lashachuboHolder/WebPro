const express = require('express');
const router = express.Router();
const { donations } = require('../store');

router.get('/users/:id/donations', (req, res) => {
  const id = Number(req.params.id);
  res.json(donations.filter(d => d.donorId === id));
});

module.exports = router;
