const express = require('express');
const router = express.Router();
const { campaigns, donations } = require('../store');

router.get('/campaigns', (req, res) => {
  res.json(campaigns.map(c => ({
    ...c,
    progress: Math.round((c.raisedAmount / c.goalAmount) * 100),
  })));
});

router.get('/donations', (req, res) => {
  res.json(donations);
});

router.delete('/campaigns/:id', (req, res) => {
  const idx = campaigns.findIndex(c => c.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'campaign not found' });
  campaigns.splice(idx, 1);
  res.json({ message: 'campaign deleted' });
});

router.delete('/donations/:id', (req, res) => {
  const idx = donations.findIndex(d => d.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'donation not found' });

  const donation = donations[idx];
  const campaign = campaigns.find(c => c.id === donation.campaignId);
  if (campaign) campaign.raisedAmount -= donation.amount;

  donations.splice(idx, 1);
  res.json({ message: 'donation deleted' });
});

module.exports = router;
