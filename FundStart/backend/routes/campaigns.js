const express = require('express');
const router = express.Router();
const { supabase, camel } = require('../lib/supabase');
const { authenticate, requireRole } = require('../middleware/auth');

function enrich(c) {
  return {
    ...c,
    progressPercent: Math.round((c.raisedAmount / c.goalAmount) * 100),
    daysLeft: Math.max(0, Math.ceil((new Date(c.endDate) - new Date()) / (1000 * 60 * 60 * 24)))
  };
}

router.get('/influencer/:influencerId', authenticate, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.id !== req.params.influencerId) {
    return res.status(403).json({ error: 'Forbidden.' });
  }

  const { data: campaigns, error: cErr } = await supabase
    .from('campaigns')
    .select('*')
    .eq('influencer_id', req.params.influencerId);

  if (cErr) return res.status(500).json({ error: 'Database error.' });

  const { data: donations, error: dErr } = await supabase
    .from('donations')
    .select('id, campaign_id')
    .in('campaign_id', campaigns.map(c => c.id));

  if (dErr) return res.status(500).json({ error: 'Database error.' });

  const result = camel(campaigns).map(c => ({
    ...enrich(c),
    donationCount: donations.filter(d => d.campaign_id === c.id).length
  }));

  res.json({ campaigns: result, total: result.length });
});

router.get('/', async (req, res) => {
  const { category, search, status } = req.query;

  let query = supabase.from('campaigns').select('*');
  if (status && status !== 'all') query = query.eq('status', status);
  if (category && category !== 'All Categories') query = query.eq('category', category);
  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: 'Database error.' });

  const result = camel(data).map(enrich);
  res.json({ campaigns: result, total: result.length });
});

router.get('/:id', async (req, res) => {
  const { data: campaigns, error: cErr } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', req.params.id)
    .limit(1);

  if (cErr) return res.status(500).json({ error: 'Database error.' });
  if (!campaigns.length) return res.status(404).json({ error: 'Campaign not found.' });

  const { data: donations, error: dErr } = await supabase
    .from('donations')
    .select('id')
    .eq('campaign_id', req.params.id);

  if (dErr) return res.status(500).json({ error: 'Database error.' });

  const campaign = camel(campaigns[0]);
  res.json({ campaign: { ...enrich(campaign), donationCount: donations.length } });
});

router.post('/', authenticate, requireRole('influencer', 'admin'), async (req, res) => {
  const { title, description, shortDescription, image, category, goalAmount, endDate } = req.body;
  if (!title || !description || !goalAmount || !endDate) {
    return res.status(400).json({ error: 'Title, description, goal amount, and end date are required.' });
  }
  if (Number(goalAmount) <= 0) {
    return res.status(400).json({ error: 'Goal amount must be greater than 0.' });
  }

  const goal = Number(goalAmount);
  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      influencer_id: req.user.id,
      title,
      description,
      short_description: shortDescription || description.slice(0, 100) + '...',
      image: image || 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=800',
      category: category || 'General',
      goal_amount: goal,
      raised_amount: 0,
      investor_count: 0,
      backers: 0,
      end_date: endDate,
      status: 'active',
      milestone_amount: Math.round(goal * 0.5)
    })
    .select();

  if (error) return res.status(500).json({ error: 'Database error.' });
  res.status(201).json({ campaign: camel(data[0]), message: 'Campaign created successfully.' });
});

router.put('/:id', authenticate, requireRole('influencer', 'admin'), async (req, res) => {
  const { data: found, error: fErr } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', req.params.id)
    .limit(1);

  if (fErr) return res.status(500).json({ error: 'Database error.' });
  if (!found.length) return res.status(404).json({ error: 'Campaign not found.' });

  const campaign = camel(found[0]);
  if (req.user.role === 'influencer' && campaign.influencerId !== req.user.id) {
    return res.status(403).json({ error: 'You can only edit your own campaigns.' });
  }

  const allowed = { title: 'title', description: 'description', shortDescription: 'short_description',
    image: 'image', category: 'category', goalAmount: 'goal_amount', endDate: 'end_date', status: 'status' };

  const updates = {};
  for (const [jsKey, dbKey] of Object.entries(allowed)) {
    if (req.body[jsKey] !== undefined) updates[dbKey] = req.body[jsKey];
  }

  const { data, error } = await supabase
    .from('campaigns')
    .update(updates)
    .eq('id', req.params.id)
    .select();

  if (error) return res.status(500).json({ error: 'Database error.' });
  res.json({ campaign: camel(data[0]), message: 'Campaign updated successfully.' });
});

router.delete('/:id', authenticate, requireRole('influencer', 'admin'), async (req, res) => {
  const { data: found, error: fErr } = await supabase
    .from('campaigns')
    .select('influencer_id')
    .eq('id', req.params.id)
    .limit(1);

  if (fErr) return res.status(500).json({ error: 'Database error.' });
  if (!found.length) return res.status(404).json({ error: 'Campaign not found.' });

  if (req.user.role === 'influencer' && found[0].influencer_id !== req.user.id) {
    return res.status(403).json({ error: 'You can only delete your own campaigns.' });
  }

  const { error } = await supabase.from('campaigns').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: 'Database error.' });
  res.json({ message: 'Campaign deleted successfully.' });
});

module.exports = router;
