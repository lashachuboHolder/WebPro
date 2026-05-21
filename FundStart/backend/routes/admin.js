const express = require('express');
const router = express.Router();
const { users, campaigns, donations } = require('../data/seed');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/stats', authenticate, requireRole('admin'), (req, res) => {
  const totalRaised = campaigns.reduce((sum, c) => sum + c.raisedAmount, 0);
  const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalUsers = users.filter(u => u.role !== 'admin').length;
  const influencers = users.filter(u => u.role === 'influencer').length;
  const donors = users.filter(u => u.role === 'donor').length;

  const categoryStats = {};
  campaigns.forEach(c => {
    if (!categoryStats[c.category]) categoryStats[c.category] = { count: 0, raised: 0 };
    categoryStats[c.category].count++;
    categoryStats[c.category].raised += c.raisedAmount;
  });

  const recentDonations = donations
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map(d => {
      const campaign = campaigns.find(c => c.id === d.campaignId);
      return { ...d, campaignTitle: campaign?.title || 'Unknown' };
    });

  res.json({
    stats: {
      totalRaised,
      totalDonations: donations.length,
      activeCampaigns,
      totalCampaigns: campaigns.length,
      totalUsers,
      influencers,
      donors
    },
    categoryStats,
    recentDonations
  });
});

router.get('/users', authenticate, requireRole('admin'), (req, res) => {
  const safeUsers = users.map(({ password, ...u }) => ({
    ...u,
    campaignCount: campaigns.filter(c => c.influencerId === u.id).length,
    donationCount: donations.filter(d => d.donorId === u.id).length
  }));
  res.json({ users: safeUsers, total: safeUsers.length });
});

router.get('/campaigns', authenticate, requireRole('admin'), (req, res) => {
  const enriched = campaigns.map(c => {
    const influencer = users.find(u => u.id === c.influencerId);
    return {
      ...c,
      influencerName: influencer?.name || 'Unknown',
      progressPercent: Math.round((c.raisedAmount / c.goalAmount) * 100),
      daysLeft: Math.max(0, Math.ceil((new Date(c.endDate) - new Date()) / (1000 * 60 * 60 * 24))),
      donationCount: donations.filter(d => d.campaignId === c.id).length
    };
  });
  res.json({ campaigns: enriched, total: enriched.length });
});

router.put('/campaigns/:id/status', authenticate, requireRole('admin'), (req, res) => {
  const idx = campaigns.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Campaign not found.' });

  const { status } = req.body;
  if (!['active', 'suspended', 'completed', 'flagged'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }

  campaigns[idx].status = status;
  res.json({ campaign: campaigns[idx], message: `Campaign status updated to ${status}.` });
});

module.exports = router;
