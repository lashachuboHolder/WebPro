import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import api from './api';
import CampaignCard from './CampaignCard';

const CATEGORIES = ['Tech', 'Food', 'Health', 'Lifestyle', 'Education', 'Environment'];
const emptyForm = { title: '', description: '', shortDescription: '', image: '', category: 'Tech', goalAmount: '', endDate: '' };

const Dashboard = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('campaigns');
  const [showForm, setShowForm] = useState(false);
  const [editCampaign, setEditCampaign] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const campRes = await api.get(`/campaigns/influencer/${user.id}`);
      setCampaigns(campRes.data.campaigns);
      const donPromises = campRes.data.campaigns.map(c =>
        api.get(`/donations/campaign/${c.id}`).then(r => r.data.donations).catch(() => [])
      );
      const allDons = (await Promise.all(donPromises)).flat();
      allDons.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setDonations(allDons);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const totalRaised = campaigns.reduce((sum, c) => sum + c.raisedAmount, 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const pendingCampaigns = campaigns.filter(c => c.status === 'pending').length;
  const totalInvestors = campaigns.reduce((sum, c) => sum + c.investorCount, 0);

  const openCreate = () => { setEditCampaign(null); setForm(emptyForm); setError(''); setShowForm(true); };
  const openEdit = (c) => {
    setEditCampaign(c);
    setForm({ title: c.title, description: c.description, shortDescription: c.shortDescription, image: c.image, category: c.category, goalAmount: c.goalAmount, endDate: c.endDate?.slice(0, 10) });
    setError(''); setShowForm(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/upload', formData);
      setForm(f => ({ ...f, image: res.data.url }));
    } catch {
      setError('Image upload failed.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      if (editCampaign) { await api.put(`/campaigns/${editCampaign.id}`, form); setSuccess('Campaign updated!'); }
      else { await api.post('/campaigns', form); setSuccess('Campaign created!'); }
      setShowForm(false); fetchData();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to save campaign.');
    } finally { setSaving(false); }
  };

  const handleSubmit = async (c) => {
    try { await api.put(`/campaigns/${c.id}/submit`); setSuccess('Campaign submitted for admin review!'); fetchData(); }
    catch (e) { setError(e.response?.data?.error || 'Failed to submit campaign.'); }
  };

  const handleDelete = async (c) => {
    try { await api.delete(`/campaigns/${c.id}`); setDeleteModal(null); fetchData(); }
    catch (e) { alert(e.response?.data?.error || 'Failed to delete.'); }
  };

  return (
    <div>
      <div className="dashboard-header">
        <div className="container">
          <div className="dash-welcome">
            <img src={user.avatar} alt={user.name} className="dash-avatar" />
            <div>
              <h1 className="dash-title">Welcome, {user.name}</h1>
              <p className="dash-sub">Manage your campaigns and track your impact</p>
            </div>
          </div>
          <div className="dash-stats">
            <div className="stat-card"><div className="stat-value">{activeCampaigns}</div><div className="stat-label">Active Campaigns</div></div>
            <div className="stat-card"><div className="stat-value">{pendingCampaigns}</div><div className="stat-label">Pending Review</div></div>
            <div className="stat-card"><div className="stat-value">{totalInvestors}</div><div className="stat-label">Total Investors</div></div>
            <div className="stat-card"><div className="stat-value">${totalRaised.toLocaleString()}</div><div className="stat-label">Total Funding</div></div>
          </div>
        </div>
      </div>

      <div className="container dash-body">
        {success && <div className="alert alert-success">{success} <button onClick={() => setSuccess('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button></div>}

        <div className="dash-tabs">
          <button className={`tab-btn ${activeTab === 'campaigns' ? 'active' : ''}`} onClick={() => setActiveTab('campaigns')}>My Campaigns ({campaigns.length})</button>
          <button className={`tab-btn ${activeTab === 'donations' ? 'active' : ''}`} onClick={() => setActiveTab('donations')}>Donation History ({donations.length})</button>
        </div>

        {activeTab === 'campaigns' && (
          <>
            <div className="tab-actions">
              <button className="btn btn-primary" onClick={openCreate}>+ New Campaign</button>
            </div>
            {loading ? <div className="spinner" /> : campaigns.length === 0 ? (
              <div className="empty-state">
                <h3>No campaigns yet</h3>
                <p>Create your first campaign to start raising funds!</p>
                <button className="btn btn-primary" onClick={openCreate}>Create Campaign</button>
              </div>
            ) : (
              <div className="campaigns-grid">
                {campaigns.map(c => (
                  <CampaignCard key={c.id} campaign={c} showActions onEdit={openEdit} onDelete={c => setDeleteModal(c)} onSubmit={handleSubmit} />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'donations' && (
          <div className="table-wrap">
            {donations.length === 0 ? (
              <div className="empty-state"><div className="icon"></div><h3>No donations yet</h3></div>
            ) : (
              <table>
                <thead>
                  <tr><th>Donor</th><th>Campaign</th><th>Amount</th><th>Payment</th><th>Date</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {donations.map(d => {
                    const camp = campaigns.find(c => c.id === d.campaignId);
                    return (
                      <tr key={d.id}>
                        <td><strong>{d.donorName}</strong></td>
                        <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{camp?.title || 'Unknown'}</td>
                        <td><strong>${d.amount.toLocaleString()}</strong></td>
                        <td><span className="badge badge-navy">{d.paymentMethod}</span></td>
                        <td>{new Date(d.createdAt).toLocaleDateString()}</td>
                        <td><span className="badge badge-green">{d.status}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editCampaign ? 'Edit Campaign' : 'Create Campaign'}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label className="form-label">Campaign Title *</label>
              <input className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Raising Capital for EV Startup" />
            </div>
            <div className="form-group">
              <label className="form-label">Short Description</label>
              <input className="form-control" value={form.shortDescription} onChange={e => setForm({ ...form, shortDescription: e.target.value })} placeholder="Brief one-liner" />
            </div>
            <div className="form-group">
              <label className="form-label">Full Description *</label>
              <textarea className="form-control" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe your campaign..." />
            </div>
            <div className="form-group">
              <label className="form-label">Cover Image</label>
              <input type="file" accept="image/*" className="form-control" onChange={handleImageUpload} disabled={uploadingImage} />
              {uploadingImage && <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Uploading...</p>}
              {form.image && <img src={form.image} alt="Preview" style={{ marginTop: 8, width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 8 }} />}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Goal Amount ($) *</label>
                <input type="number" className="form-control" value={form.goalAmount} onChange={e => setForm({ ...form, goalAmount: e.target.value })} placeholder="50000" min="1" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">End Date *</label>
              <input type="date" className="form-control" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} min={new Date().toISOString().slice(0, 10)} />
            </div>
            {!editCampaign && (
              <p className="campaign-workflow-note" style={{ marginBottom: 12 }}>
                📝 New campaigns are saved as a draft first. Submit for review from your dashboard when you're ready to go live.
              </p>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editCampaign ? 'Update Campaign' : 'Save as Draft'}
              </button>
              <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteModal && (
        <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Delete Campaign?</h2>
            <p style={{ color: 'var(--text-muted)', margin: '12px 0 24px', fontSize: 14 }}>
              Are you sure you want to delete "<strong>{deleteModal.title}</strong>"? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => handleDelete(deleteModal)}>Delete</button>
              <button className="btn btn-outline" onClick={() => setDeleteModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
