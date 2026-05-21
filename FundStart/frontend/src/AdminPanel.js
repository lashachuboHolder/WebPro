import React, { useEffect, useState } from 'react';
import api from './api';

const AdminPanel = () => {
  const [stats, setStats] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [donations, setDonations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [actionMsg, setActionMsg] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, campRes, donRes, userRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/campaigns'),
        api.get('/donations'),
        api.get('/admin/users')
      ]);
      setStats(statsRes.data);
      setCampaigns(campRes.data.campaigns);
      setDonations(donRes.data.donations);
      setUsers(userRes.data.users);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/admin/campaigns/${id}/status`, { status });
      setActionMsg(`Campaign status updated to ${status}`);
      fetchAll();
    } catch (e) { setActionMsg(e.response?.data?.error || 'Failed to update.'); }
  };

  const deleteDonation = async (id) => {
    if (!window.confirm('Remove this donation?')) return;
    try { await api.delete(`/donations/${id}`); setActionMsg('Donation removed.'); fetchAll(); }
    catch {}
  };

  if (loading) return <div className="spinner" />;

  const { stats: s, recentDonations, categoryStats } = stats || {};

  return (
    <div>
      <div className="admin-header">
        <div className="container">
          <h1 className="admin-title">🛡️ Admin Panel</h1>
          <p style={{ color: '#94a3b8' }}>Platform overview and moderation tools</p>
        </div>
      </div>

      <div className="container admin-body">
        {actionMsg && (
          <div className="alert alert-success">
            {actionMsg}
            <button onClick={() => setActionMsg('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
          </div>
        )}

        <div className="dash-tabs">
          {['overview', 'campaigns', 'donations', 'users'].map(tab => (
            <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && s && (
          <>
            <div className="admin-stats-grid">
              <div className="stat-card"><div className="stat-value">${s.totalRaised?.toLocaleString()}</div><div className="stat-label">Total Raised</div></div>
              <div className="stat-card"><div className="stat-value">{s.activeCampaigns}</div><div className="stat-label">Active Campaigns</div></div>
              <div className="stat-card"><div className="stat-value">{s.totalCampaigns}</div><div className="stat-label">Total Campaigns</div></div>
              <div className="stat-card"><div className="stat-value">{s.totalDonations}</div><div className="stat-label">Total Donations</div></div>
              <div className="stat-card"><div className="stat-value">{s.influencers}</div><div className="stat-label">Influencers</div></div>
              <div className="stat-card"><div className="stat-value">{s.donors}</div><div className="stat-label">Donors</div></div>
            </div>
            <h2 className="section-heading">Recent Activity</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Donor</th><th>Campaign</th><th>Amount</th><th>Date</th></tr></thead>
                <tbody>
                  {(recentDonations || []).map(d => (
                    <tr key={d.id}>
                      <td>{d.donorName}</td>
                      <td>{d.campaignTitle}</td>
                      <td><strong>${d.amount?.toLocaleString()}</strong></td>
                      <td>{new Date(d.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h2 className="section-heading">Category Breakdown</h2>
            <div className="category-stats">
              {Object.entries(categoryStats || {}).map(([cat, data]) => (
                <div key={cat} className="cat-stat-card">
                  <div className="cat-name">{cat}</div>
                  <div className="cat-count">{data.count} campaigns</div>
                  <div className="cat-raised">${data.raised?.toLocaleString()} raised</div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'campaigns' && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Campaign</th><th>Influencer</th><th>Progress</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {campaigns.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.category}</div>
                    </td>
                    <td>{c.influencerName}</td>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{c.progressPercent}%</div>
                      <div className="progress-bar-wrap" style={{ width: 80, marginTop: 4 }}>
                        <div className="progress-bar-fill" style={{ width: `${Math.min(c.progressPercent, 100)}%` }} />
                      </div>
                    </td>
                    <td><span className={`badge ${c.status === 'active' ? 'badge-green' : c.status === 'flagged' ? 'badge-yellow' : 'badge-red'}`}>{c.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {c.status !== 'active' && <button className="btn btn-sm btn-secondary" onClick={() => updateStatus(c.id, 'active')}>Activate</button>}
                        {c.status !== 'flagged' && <button className="btn btn-sm" style={{ background: '#fef9c3', color: '#92400e' }} onClick={() => updateStatus(c.id, 'flagged')}>Flag</button>}
                        {c.status !== 'suspended' && <button className="btn btn-sm btn-danger" onClick={() => updateStatus(c.id, 'suspended')}>Suspend</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'donations' && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Donor</th><th>Campaign</th><th>Amount</th><th>Payment</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {donations.map(d => (
                  <tr key={d.id}>
                    <td>{d.donorName}</td>
                    <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.campaignTitle}</td>
                    <td><strong>${d.amount?.toLocaleString()}</strong></td>
                    <td><span className="badge badge-navy">{d.paymentMethod}</span></td>
                    <td>{new Date(d.createdAt).toLocaleDateString()}</td>
                    <td><button className="btn btn-sm btn-danger" onClick={() => deleteDonation(d.id)}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Campaigns</th><th>Donations</th><th>Joined</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <img src={u.avatar} alt={u.name} style={{ width: 28, height: 28, borderRadius: '50%' }} />
                        <strong>{u.name}</strong>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td><span className={`badge ${u.role === 'admin' ? 'badge-navy' : u.role === 'influencer' ? 'badge-green' : 'badge-gray'}`}>{u.role}</span></td>
                    <td>{u.campaignCount}</td>
                    <td>{u.donationCount}</td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
