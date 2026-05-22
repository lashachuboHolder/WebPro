import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from './api';
import CampaignCard from './CampaignCard';
import { useAuth } from './AuthContext';

const Home = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/campaigns?status=active')
      .then(r => setCampaigns(r.data.campaigns.slice(0, 6)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <h1>Fund the Future <span>Together</span></h1>
        <p>Where influencers create campaigns and fans make big ideas real. Every donation creates impact.</p>
        <div className="hero-btns">
          <Link to="/campaigns" className="btn btn-primary btn-lg">Explore Campaigns</Link>
          {user?.role === 'influencer' && (
            <Link to="/dashboard" className="btn btn-outline btn-lg">Start a Campaign</Link>
          )}
        </div>
        <div className="hero-stats">
          <div className="h-stat"><span className="h-stat-val">$500K+</span><span className="h-stat-lbl">Total Raised</span></div>
          <div className="h-stat"><span className="h-stat-val">200+</span><span className="h-stat-lbl">Campaigns</span></div>
          <div className="h-stat"><span className="h-stat-val">5K+</span><span className="h-stat-lbl">Donors</span></div>
        </div>
      </section>

      {/* Categories */}
      <div className="categories-section">
        <div className="categories-row">
          {['Tech', 'Food', 'Health', 'Lifestyle', 'Education', 'Environment'].map(cat => (
            <Link key={cat} to={`/campaigns?category=${cat}`} className="category-chip">{cat}</Link>
          ))}
        </div>
      </div>

      {/* Popular Campaigns */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Popular Campaigns</h2>
              <p className="section-sub">Discover campaigns making an impact right now</p>
            </div>
            <Link to="/campaigns" className="btn btn-outline">See All →</Link>
          </div>
          {loading ? <div className="spinner" /> : (
            <div className="campaigns-grid">
              {campaigns.map(c => <CampaignCard key={c.id} campaign={c} />)}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section">
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center' }}>How It Works</h2>
          <div className="steps-grid">
            {[
              { step: '01', title: 'Create a Campaign', desc: 'Influencers set a goal, describe their project, and launch.' },
              { step: '02', title: 'Share With Community', desc: 'Share your campaign page with fans and followers.' },
              { step: '03', title: 'Receive Donations', desc: 'Fans donate any amount and track progress in real time.' },
              { step: '04', title: 'Achieve Your Goal', desc: 'Hit your milestone and bring your vision to life.' },
            ].map(s => (
              <div key={s.step} className="step-card">
                <div className="step-number">STEP {s.step}</div>
                <div className="step-icon">{s.icon}</div>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>Ready to make an impact?</h2>
        <p>Join thousands of influencers and donors on Fundstart.</p>
        <Link to="/register" className="btn btn-primary btn-lg">Get Started Free</Link>
      </section>
    </div>
  );
};

export default Home;
