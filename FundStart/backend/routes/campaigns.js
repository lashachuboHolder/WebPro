const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { campaigns, donations } = require('../data/seed');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/influencer/:influencerId', authenticate, (req, res) => {
  if (req.user.role !== 'admin' && req.user.id !== req.params.influencerId) {
    return res.status(403).json({ error: 'Forbidden.' });
  }
  const result = campaigns
    .filter(c => c.influencerId === req.params.influencerId)
    .map(c => ({
      ...c,
      progressPercent: Math.round((c.raisedAmount / c.goalAmount) * 100),
      daysLeft: Math.max(0, Math.ceil((new Date(c.endDate) - new Date()) / (1000 * 60 * 60 * 24))),
      donationCount: donations.filter(d => d.campaignId === c.id).length
    }));
  res.json({ campaigns: result, total: result.length });
});

router.get('/', (req, res) => {
  const { category, search, status } = req.query;
  let result = [...campaigns];

  if (status && status !== 'all') {
    result = result.filter(c => c.status === status);
  }
  if (category && category !== 'All Categories') {
    result = result.filter(c => c.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    );
  }

  const enriched = result.map(c => ({
    ...c,
    progressPercent: Math.round((c.raisedAmount / c.goalAmount) * 100),
    daysLeft: Math.max(0, Math.ceil((new Date(c.endDate) - new Date()) / (1000 * 60 * 60 * 24)))
  }));

  res.json({ campaigns: enriched, total: enriched.length });
});

router.get('/:id', (req, res) => {
  const campaign = campaigns.find(c => c.id === req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found.' });

  const campaignDonations = donations.filter(d => d.campaignId === campaign.id);
  res.json({
    campaign: {
      ...campaign,
      progressPercent: Math.round((campaign.raisedAmount / campaign.goalAmount) * 100),
      daysLeft: Math.max(0, Math.ceil((new Date(campaign.endDate) - new Date()) / (1000 * 60 * 60 * 24))),
      donationCount: campaignDonations.length
    }
  });
});

router.post('/', authenticate, requireRole('influencer', 'admin'), (req, res) => {
  const { title, description, shortDescription, image, category, goalAmount, endDate } = req.body;
  if (!title || !description || !goalAmount || !endDate) {
    return res.status(400).json({ error: 'Title, description, goal amount, and end date are required.' });
  }

  const newCampaign = {
    id: uuidv4(),
    influencerId: req.user.id,
    title,
    description,
    shortDescription: shortDescription || description.slice(0, 100) + '...',
    image: image || 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=800',
    category: category || 'General',
    goalAmount: Number(goalAmount),
    raisedAmount: 0,
    investorCount: 0,
    backers: 0,
    startDate: new Date().toISOString(),
    endDate,
    status: 'active',
    milestoneAmount: Math.round(Number(goalAmount) * 0.5),
    createdAt: new Date().toISOString()
  };

  campaigns.push(newCampaign);
  res.status(201).json({ campaign: newCampaign, message: 'Campaign created successfully.' });
});

router.put('/:id', authenticate, requireRole('influencer', 'admin'), (req, res) => {
  const idx = campaigns.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Campaign not found.' });

  const campaign = campaigns[idx];
  if (req.user.role === 'influencer' && campaign.influencerId !== req.user.id) {
    return res.status(403).json({ error: 'You can only edit your own campaigns.' });
  }

  const allowed = ['title', 'description', 'shortDescription', 'image', 'category', 'goalAmount', 'endDate', 'status'];
  allowed.forEach(field => {
    if (req.body[field] !== undefined) campaign[field] = req.body[field];
  });
  campaigns[idx] = campaign;
  res.json({ campaign, message: 'Campaign updated successfully.' });
});

router.delete('/:id', authenticate, requireRole('influencer', 'admin'), (req, res) => {
  const idx = campaigns.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Campaign not found.' });

  const campaign = campaigns[idx];
  if (req.user.role === 'influencer' && campaign.influencerId !== req.user.id) {
    return res.status(403).json({ error: 'You can only delete your own campaigns.' });
  }

  campaigns.splice(idx, 1);
  res.json({ message: 'Campaign deleted successfully.' });
});

module.exports = router;
