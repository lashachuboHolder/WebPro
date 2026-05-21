const express = require('express');
const router = express.Router();
const { campaigns, donations, newId } = require('../store');

router.get('/', (req, res) => {
  const result = campaigns.map(c => ({
    ...c,
    progress: Math.round((c.raisedAmount / c.goalAmount) * 100),
  }));
  res.json(result);
});

router.get('/:id', (req, res) => {
  const campaign = campaigns.find(c => c.id === Number(req.params.id));
  if (!campaign) return res.status(404).json({ error: 'campaign not found' });
  res.json({ ...campaign, progress: Math.round((campaign.raisedAmount / campaign.goalAmount) * 100) });
});

router.post('/', (req, res) => {
  const { influencerId, title, description, goalAmount, endDate } = req.body;
  if (!influencerId || !title || !goalAmount || !endDate)
    return res.status(400).json({ error: 'creadidentials missing' });

  const campaign = {
    id: newId('campaigns'),
    influencerId: Number(influencerId),
    title,
    description: description || '',
    goalAmount: Number(goalAmount),
    raisedAmount: 0,
    endDate,
    createdAt: new Date().toISOString(),
  };
  campaigns.push(campaign);
  res.status(201).json(campaign);
});

router.put('/:id', (req, res) => {
  const campaign = campaigns.find(c => c.id === Number(req.params.id));
  if (!campaign) return res.status(404).json({ error: 'campaign not found' });

  const { requesterId } = req.body;
  if (campaign.influencerId !== Number(requesterId))
    return res.status(403).json({ error: 'not authorized' });

  const { title, description, goalAmount, endDate } = req.body;
  if (title)       campaign.title       = title;
  if (description) campaign.description = description;
  if (goalAmount)  campaign.goalAmount  = Number(goalAmount);
  if (endDate)     campaign.endDate     = endDate;

  res.json(campaign);
});

router.delete('/:id', (req, res) => {
  const idx = campaigns.findIndex(c => c.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'campaign not found' });

  const { requesterId } = req.body;
  if (campaigns[idx].influencerId !== Number(requesterId))
    return res.status(403).json({ error: 'not authorized' });

  campaigns.splice(idx, 1);
  res.json({ message: 'campaign deleted' });
});

router.get('/:id/stats', (req, res) => {
  const campaign = campaigns.find(c => c.id === Number(req.params.id));
  if (!campaign) return res.status(404).json({ error: 'campaign not found' });

  const campDonations = donations.filter(d => d.campaignId === campaign.id);
  const donorCount = new Set(campDonations.map(d => d.donorId)).size;
  const avgDonation = campDonations.length
    ? campDonations.reduce((sum, d) => sum + d.amount, 0) / campDonations.length
    : 0;
  const daysLeft = campaign.endDate
    ? Math.max(0, Math.ceil((new Date(campaign.endDate) - new Date()) / 86400000))
    : null;

  res.json({
    campaignId: campaign.id,
    title: campaign.title,
    goalAmount: campaign.goalAmount,
    raisedAmount: campaign.raisedAmount,
    progress: Math.round((campaign.raisedAmount / campaign.goalAmount) * 100),
    donationCount: campDonations.length,
    donorCount,
    avgDonation: Math.round(avgDonation * 100) / 100,
    daysLeft,
  });
});

router.get('/:id/donations', (req, res) => {
  const id = Number(req.params.id);
  res.json(donations.filter(d => d.campaignId === id));
});

router.post('/:id/donations', (req, res) => {
  const campaign = campaigns.find(c => c.id === Number(req.params.id));
  if (!campaign) return res.status(404).json({ error: 'campaign not found' });

  const { donorId, donorName, amount } = req.body;
  if (!donorId || !amount || Number(amount) <= 0)
    return res.status(400).json({ error: 'no donor ID or ammount < 0' });

  const donation = {
    id: newId('donations'),
    campaignId: campaign.id,
    donorId: Number(donorId),
    donorName: donorName || 'Anonymous',
    amount: Number(amount),
    createdAt: new Date().toISOString(),
  };
  donations.push(donation);
  campaign.raisedAmount += donation.amount;

  res.status(201).json({ donation, campaign });
});

module.exports = router;
