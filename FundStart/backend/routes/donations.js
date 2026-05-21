const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { donations, campaigns, users } = require('../data/seed');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/my', authenticate, (req, res) => {
  const myDonations = donations
    .filter(d => d.donorId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(d => {
      const campaign = campaigns.find(c => c.id === d.campaignId);
      return { ...d, campaignTitle: campaign?.title || 'Unknown', campaignImage: campaign?.image };
    });
  res.json({ donations: myDonations, total: myDonations.length });
});

router.get('/campaign/:campaignId', authenticate, (req, res) => {
  const campaign = campaigns.find(c => c.id === req.params.campaignId);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found.' });

  if (req.user.role === 'influencer' && campaign.influencerId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden.' });
  }

  const campDonations = donations
    .filter(d => d.campaignId === req.params.campaignId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ donations: campDonations, total: campDonations.length });
});

router.get('/', authenticate, requireRole('admin'), (req, res) => {
  const enriched = donations
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(d => {
      const campaign = campaigns.find(c => c.id === d.campaignId);
      return { ...d, campaignTitle: campaign?.title || 'Unknown' };
    });
  res.json({ donations: enriched, total: enriched.length });
});

router.post('/', authenticate, (req, res) => {
  const { campaignId, amount, message, paymentMethod } = req.body;
  if (!campaignId || !amount) {
    return res.status(400).json({ error: 'Campaign ID and amount are required.' });
  }

  const campaign = campaigns.find(c => c.id === campaignId);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found.' });
  if (campaign.status !== 'active') return res.status(400).json({ error: 'Campaign is not active.' });

  const numAmount = Number(amount);
  if (numAmount <= 0) return res.status(400).json({ error: 'Amount must be positive.' });

  const tax = Math.round(numAmount * 0.1);
  const convenienceFee = 5;
  const totalPaid = numAmount + tax + convenienceFee;

  const donation = {
    id: uuidv4(),
    campaignId,
    donorId: req.user.id,
    donorName: req.user.name,
    donorAvatar: req.user.avatar,
    amount: numAmount,
    message: message || '',
    paymentMethod: paymentMethod || 'VISA',
    tax,
    convenienceFee,
    totalPaid,
    createdAt: new Date().toISOString(),
    status: 'completed'
  };

  donations.push(donation);

  const campIdx = campaigns.findIndex(c => c.id === campaignId);
  campaigns[campIdx].raisedAmount += numAmount;
  campaigns[campIdx].investorCount += 1;

  res.status(201).json({
    donation,
    message: 'Donation successful! Thank you for your support.',
    campaign: {
      raisedAmount: campaigns[campIdx].raisedAmount,
      progressPercent: Math.round((campaigns[campIdx].raisedAmount / campaigns[campIdx].goalAmount) * 100)
    }
  });
});

// DELETE /api/donations/:id — Admin only
router.delete('/:id', authenticate, requireRole('admin'), (req, res) => {
  const idx = donations.findIndex(d => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Donation not found.' });

  const donation = donations[idx];
  const campIdx = campaigns.findIndex(c => c.id === donation.campaignId);
  if (campIdx !== -1) {
    campaigns[campIdx].raisedAmount = Math.max(0, campaigns[campIdx].raisedAmount - donation.amount);
    campaigns[campIdx].investorCount = Math.max(0, campaigns[campIdx].investorCount - 1);
  }

  donations.splice(idx, 1);
  res.json({ message: 'Donation removed successfully.' });
});

module.exports = router;
