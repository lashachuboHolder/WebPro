const express = require('express');
const router = express.Router();
const { supabase, camel } = require('../lib/supabase');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/stats', authenticate, requireRole('admin'), async (req, res) => {
  const [
    { data: campaigns },
    { data: donations },
    { data: users }
  ] = await Promise.all([
    supabase.from('campaigns').select('*'),
    supabase.from('donations').select('*, campaigns(title)').order('created_at', { ascending: false }),
    supabase.from('users').select('id, role')
  ]);

  const c = camel(campaigns);
  const d = camel(donations);

  const totalRaised = c.reduce((sum, x) => sum + Number(x.raisedAmount), 0);
  const activeCampaigns = c.filter(x => x.status === 'active').length;
  const influencers = users.filter(u => u.role === 'influencer').length;
  const donors = users.filter(u => u.role === 'donor').length;

  const categoryStats = {};
  c.forEach(x => {
    if (!categoryStats[x.category]) categoryStats[x.category] = { count: 0, raised: 0 };
    categoryStats[x.category].count++;
    categoryStats[x.category].raised += Number(x.raisedAmount);
  });

  const recentDonations = d.slice(0, 5).map(x => ({
    ...x,
    campaignTitle: x.campaigns?.title || 'Unknown',
    campaigns: undefined
  }));

  res.json({
    stats: {
      totalRaised,
      totalDonations: d.length,
      activeCampaigns,
      totalCampaigns: c.length,
      totalUsers: influencers + donors,
      influencers,
      donors
    },
    categoryStats,
    recentDonations
  });
});

router.get('/users', authenticate, requireRole('admin'), async (req, res) => {
  const [{ data: users }, { data: campaigns }, { data: donations }] = await Promise.all([
    supabase.from('users').select('id, name, email, role, avatar, created_at'),
    supabase.from('campaigns').select('id, influencer_id'),
    supabase.from('donations').select('id, donor_id')
  ]);

  const result = camel(users).map(u => ({
    ...u,
    campaignCount: campaigns.filter(c => c.influencer_id === u.id).length,
    donationCount: donations.filter(d => d.donor_id === u.id).length
  }));

  res.json({ users: result, total: result.length });
});

router.get('/campaigns', authenticate, requireRole('admin'), async (req, res) => {
  const [{ data: campaigns }, { data: donations }] = await Promise.all([
    supabase.from('campaigns').select('*, users(name)'),
    supabase.from('donations').select('id, campaign_id')
  ]);

  const result = camel(campaigns).map(c => ({
    ...c,
    influencerName: c.users?.name || 'Unknown',
    users: undefined,
    progressPercent: Math.round((c.raisedAmount / c.goalAmount) * 100),
    daysLeft: Math.max(0, Math.ceil((new Date(c.endDate) - new Date()) / (1000 * 60 * 60 * 24))),
    donationCount: donations.filter(d => d.campaign_id === c.id).length
  }));

  res.json({ campaigns: result, total: result.length });
});

router.put('/campaigns/:id/status', authenticate, requireRole('admin'), async (req, res) => {
  const { status } = req.body;
  if (!['active', 'suspended', 'completed', 'flagged'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }

  const { data, error } = await supabase
    .from('campaigns')
    .update({ status })
    .eq('id', req.params.id)
    .select();

  if (error) return res.status(500).json({ error: 'Database error.' });
  if (!data.length) return res.status(404).json({ error: 'Campaign not found.' });

  res.json({ campaign: camel(data[0]), message: `Campaign status updated to ${status}.` });
});

module.exports = router;
