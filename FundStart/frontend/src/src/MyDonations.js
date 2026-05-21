import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from './api';
import { useAuth } from './AuthContext';

const MyDonations = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/donations/my')
      .then(r => setDonations(r.data.donations))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
  const totalPaid = donations.reduce((sum, d) => sum + (d.totalPaid || d.amount), 0);

  return (
    <div>
      <div className="donations-header">
        <div className="container">
          <div className="donor-welcome">
            <img src={user.avatar} alt={user.name} className="donor-avatar" />
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800 }}>Welcome, {user.name} 👋</h1>
              <p style={{ color: '#94a3b8', marginTop: 3 }}>Your donation history and impact</p>
            </div>
          </div>
          <div className="donor-stats">
            <div className="stat-card"><div className="stat-value">{donations.length}</div><div className="stat-label">Total Donations</div></div>
            <div className="stat-card"><div className="stat-value">${totalDonated.toLocaleString()}</div><div className="stat-label">Amount Donated</div></div>
            <div className="stat-card"><div className="stat-value">${totalPaid.toLocaleString()}</div><div className="stat-label">Total Paid</div></div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '28px 20px' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 18, color: 'var(--navy)' }}>Donation History</h2>

        {loading ? <div className="spinner" /> : donations.length === 0 ? (
          <div className="empty-state">
            <div className="icon">💚</div>
            <h3>No donations yet</h3>
            <p>Browse campaigns and make your first donation!</p>
            <Link to="/campaigns" className="btn btn-primary">Explore Campaigns</Link>
          </div>
        ) : (
          <div className="donations-list">
            {donations.map(d => (
              <div key={d.id} className="donation-item card">
                <div className="card-body">
                  <div className="donation-left">
                    {d.campaignImage && <img src={d.campaignImage} alt={d.campaignTitle} className="donation-campaign-img" />}
                    <div>
                      <h3 className="donation-campaign-title">{d.campaignTitle}</h3>
                      <p className="donation-date">{new Date(d.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      {d.message && <p className="donation-message">"{d.message}"</p>}
                    </div>
                  </div>
                  <div className="donation-right">
                    <div className="donation-amount">${d.amount.toLocaleString()}</div>
                    <div className="donation-detail">
                      <span className="badge badge-navy">{d.paymentMethod}</span>
                      <span className="badge badge-green">{d.status}</span>
                    </div>
                    <div className="donation-total-paid">Total paid: ${(d.totalPaid || d.amount).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <Link to="/campaigns" className="btn btn-primary">Donate to More Campaigns →</Link>
        </div>
      </div>
    </div>
  );
};

export default MyDonations;
