import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from './api';
import { useAuth } from './AuthContext';

const PAYMENT_METHODS = ['VISA', 'Mastercard', 'GCPS', 'NCTO'];
const PRESET_AMOUNTS = [100, 222, 500];

const CampaignDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDonate, setShowDonate] = useState(false);
  const [amount, setAmount] = useState(132);
  const [message, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('VISA');
  const [donating, setDonating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/campaigns/${id}`),
      api.get(`/donations/campaign/${id}`).catch(() => ({ data: { donations: [] } }))
    ]).then(([campRes, donRes]) => {
      setCampaign(campRes.data.campaign);
      setDonations(donRes.data.donations || []);
    }).catch(() => navigate('/campaigns'))
      .finally(() => setLoading(false));
  }, [id]);

  const tax = Math.round(amount * 0.1);
  const totalPaid = Number(amount) + tax + 5;

  const handleDonate = async () => {
    if (!user) return navigate('/login');
    setDonating(true); setError('');
    try {
      await api.post('/donations', { campaignId: id, amount: Number(amount), message, paymentMethod });
      setSuccess('🎉 Thank you for your donation!');
      setShowDonate(false);
      const res = await api.get(`/campaigns/${id}`);
      setCampaign(res.data.campaign);
    } catch (e) {
      setError(e.response?.data?.error || 'Donation failed. Please try again.');
    } finally {
      setDonating(false);
    }
  };

  if (loading) return <div className="spinner" />;
  if (!campaign) return null;

  const { title, description, image, category, goalAmount, raisedAmount, progressPercent, investorCount, daysLeft, status, endDate } = campaign;

  return (
    <div>
      {success && <div className="success-banner">{success}</div>}

      <div className="detail-hero">
        <img src={image} alt={title} className="detail-hero-img" />
        <div className="detail-hero-overlay" />
        <div className="container detail-hero-content">
          <span className="badge badge-navy">{category}</span>
          <h1 className="detail-title">{title}</h1>
          <div className="detail-meta-row">
            <span>⏰ {daysLeft} days left</span>
            <span>•</span>
            <span>📅 Ends {new Date(endDate).toLocaleDateString()}</span>
            <span>•</span>
            <span className={`badge ${status === 'active' ? 'badge-green' : 'badge-red'}`}>{status}</span>
          </div>
        </div>
      </div>

      <div className="container detail-body">
        <div className="detail-left">
          <div className="detail-section">
            <h2 className="detail-section-title">About This Campaign</h2>
            <p className="detail-description">{description}</p>
          </div>

          {donations.length > 0 && (
            <div className="detail-section">
              <h2 className="detail-section-title">Backed by Investors</h2>
              <div className="backers-list">
                {donations.slice(0, 5).map(d => (
                  <div key={d.id} className="backer-item">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${d.donorName}`} alt={d.donorName} className="backer-avatar" />
                    <div>
                      <div className="backer-name">{d.donorName}</div>
                      <div className="backer-amount">${d.amount.toLocaleString()}</div>
                      {d.message && <p className="backer-msg">"{d.message}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <div className="card">
            <div className="card-body">
              <div className="raised-amount">${raisedAmount?.toLocaleString()}</div>
              <div className="raised-label">raised of ${goalAmount?.toLocaleString()} goal</div>
              <div className="progress-bar-wrap" style={{ margin: '12px 0' }}>
                <div className="progress-bar-fill" style={{ width: `${Math.min(progressPercent, 100)}%` }} />
              </div>
              <div className="sidebar-stats">
                <div className="s-stat"><span className="s-val">{progressPercent}%</span><span className="s-lbl">funded</span></div>
                <div className="s-stat"><span className="s-val">{investorCount}</span><span className="s-lbl">backers</span></div>
                <div className="s-stat"><span className="s-val">{daysLeft}</span><span className="s-lbl">days left</span></div>
              </div>
              {status === 'active' ? (
                <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 14 }} onClick={() => setShowDonate(true)}>
                  💚 Donate Now
                </button>
              ) : (
                <div className="alert alert-error" style={{ marginTop: 14, textAlign: 'center' }}>
                  Campaign is {status}
                </div>
              )}
              {!user && (
                <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                  <a href="/login" style={{ color: 'var(--green-dark)' }}>Login</a> to donate
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Donate Modal */}
      {showDonate && (
        <div className="modal-overlay" onClick={() => setShowDonate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Donate to Campaign</h2>
              <button className="modal-close" onClick={() => setShowDonate(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label className="form-label">Amount ($)</label>
              <div className="amount-presets">
                {PRESET_AMOUNTS.map(a => (
                  <button key={a} className={`preset-btn ${amount === a ? 'active' : ''}`} onClick={() => setAmount(a)}>${a}</button>
                ))}
              </div>
              <input type="number" className="form-control" value={amount} onChange={e => setAmount(e.target.value)} min={1} placeholder="Custom amount" style={{ marginTop: 8 }} />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <div className="payment-methods">
                {PAYMENT_METHODS.map(m => (
                  <button key={m} className={`payment-btn ${paymentMethod === m ? 'active' : ''}`} onClick={() => setPaymentMethod(m)}>{m}</button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Message (optional)</label>
              <textarea className="form-control" value={message} onChange={e => setMessage(e.target.value)} placeholder="Leave a message of support..." rows={2} />
            </div>
            <div className="donate-summary">
              <div className="summary-row"><span>Amount</span><span>${Number(amount).toLocaleString()}</span></div>
              <div className="summary-row"><span>Tax (10%)</span><span>${tax}</span></div>
              <div className="summary-row"><span>Convenience Fee</span><span>$5</span></div>
              <div className="summary-row total"><span>Total</span><span>${totalPaid.toLocaleString()}</span></div>
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleDonate} disabled={donating || !amount}>
              {donating ? 'Processing...' : `Donate $${totalPaid}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignDetail;
