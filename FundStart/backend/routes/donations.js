const express = require('express');
const router = express.Router();
const { supabase, camel } = require('../lib/supabase');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/my', authenticate, async (req, res) => {
  const { data, error } = await supabase
    .from('donations')
    .select('*, campaigns(title, image)')
    .eq('donor_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: 'Database error.' });

  const result = camel(data).map(d => ({
    ...d,
    campaignTitle: d.campaigns?.title || 'Unknown',
    campaignImage: d.campaigns?.image,
    campaigns: undefined
  }));

  res.json({ donations: result, total: result.length });
});

router.get('/campaign/:campaignId', authenticate, async (req, res) => {
  const { data: campaigns, error: cErr } = await supabase
    .from('campaigns')
    .select('influencer_id')
    .eq('id', req.params.campaignId)
    .limit(1);

  if (cErr) return res.status(500).json({ error: 'Database error.' });
  if (!campaigns.length) return res.status(404).json({ error: 'Campaign not found.' });

  if (req.user.role === 'influencer' && campaigns[0].influencer_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden.' });
  }

  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .eq('campaign_id', req.params.campaignId)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: 'Database error.' });
  const result = camel(data);
  res.json({ donations: result, total: result.length });
});

router.get('/', authenticate, requireRole('admin'), async (req, res) => {
  const { data, error } = await supabase
    .from('donations')
    .select('*, campaigns(title)')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: 'Database error.' });

  const result = camel(data).map(d => ({
    ...d,
    campaignTitle: d.campaigns?.title || 'Unknown',
    campaigns: undefined
  }));

  res.json({ donations: result, total: result.length });
});

router.post('/', authenticate, async (req, res) => {
  const { campaignId, amount, message, paymentMethod } = req.body;
  if (!campaignId || !amount) return res.status(400).json({ error: 'Campaign ID and amount are required.' });

  const { data: campaigns, error: cErr } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .limit(1);

  if (cErr) return res.status(500).json({ error: 'Database error.' });
  if (!campaigns.length) return res.status(404).json({ error: 'Campaign not found.' });

  const campaign = camel(campaigns[0]);
  if (campaign.status !== 'active') return res.status(400).json({ error: 'Campaign is not active.' });

  const numAmount = Number(amount);
  if (numAmount <= 0) return res.status(400).json({ error: 'Amount must be positive.' });

  const tax = Math.round(numAmount * 0.1);
  const convenienceFee = 5;
  const totalPaid = numAmount + tax + convenienceFee;

  const { data: donData, error: dErr } = await supabase
    .from('donations')
    .insert({
      campaign_id: campaignId,
      donor_id: req.user.id,
      donor_name: req.user.name,
      donor_avatar: req.user.avatar,
      amount: numAmount,
      message: message || '',
      payment_method: paymentMethod || 'VISA',
      tax,
      convenience_fee: convenienceFee,
      total_paid: totalPaid,
      status: 'completed'
    })
    .select();

  if (dErr) return res.status(500).json({ error: 'Database error.' });

  const newRaised = campaign.raisedAmount + numAmount;
  const newCount = campaign.investorCount + 1;
  await supabase
    .from('campaigns')
    .update({ raised_amount: newRaised, investor_count: newCount })
    .eq('id', campaignId);

  res.status(201).json({
    donation: camel(donData[0]),
    message: 'Donation successful! Thank you for your support.',
    campaign: {
      raisedAmount: newRaised,
      progressPercent: Math.round((newRaised / campaign.goalAmount) * 100)
    }
  });
});

router.delete('/:id', authenticate, requireRole('admin'), async (req, res) => {
  const { data: found, error: fErr } = await supabase
    .from('donations')
    .select('*')
    .eq('id', req.params.id)
    .limit(1);

  if (fErr) return res.status(500).json({ error: 'Database error.' });
  if (!found.length) return res.status(404).json({ error: 'Donation not found.' });

  const donation = camel(found[0]);

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('raised_amount, investor_count')
    .eq('id', donation.campaignId)
    .limit(1);

  if (campaigns?.length) {
    const c = camel(campaigns[0]);
    await supabase
      .from('campaigns')
      .update({
        raised_amount: Math.max(0, c.raisedAmount - donation.amount),
        investor_count: Math.max(0, c.investorCount - 1)
      })
      .eq('id', donation.campaignId);
  }

  const { error } = await supabase.from('donations').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: 'Database error.' });
  res.json({ message: 'Donation removed successfully.' });
});

module.exports = router;
