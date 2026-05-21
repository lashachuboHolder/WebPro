const express = require('express');
const router = express.Router();
const { donations, campaigns } = require('../store');

router.get('/users/:id/donations', (req, res) => {
  const id = Number(req.params.id);
  res.json(donations.filter(d => d.donorId === id));
});

router.get('/users/:id/campaigns', (req, res) => {
  const id = Number(req.params.id);
  res.json(campaigns.filter(c => c.influencerId === id).map(c => ({
    ...c,
    progress: Math.round((c.raisedAmount / c.goalAmount) * 100),
  })));
});

router.get('/users/:id/stats', (req, res) => {
  const id = Number(req.params.id);
  const userCampaigns = campaigns.filter(c => c.influencerId === id);
  const campaignIds = new Set(userCampaigns.map(c => c.id));
  const userDonations = donations.filter(d => campaignIds.has(d.campaignId));

  res.json({
    totalCampaigns: userCampaigns.length,
    totalRaised: userCampaigns.reduce((sum, c) => sum + c.raisedAmount, 0),
    totalDonations: userDonations.length,
    totalDonors: new Set(userDonations.map(d => d.donorId)).size,
  });
});

module.exports = router;
