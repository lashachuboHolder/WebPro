import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from './api';
import CampaignCard from './CampaignCard';

const CATEGORIES = ['All Categories', 'Tech', 'Food', 'Health', 'Lifestyle', 'Education', 'Environment'];

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || 'All Categories');

  const fetchCampaigns = (cat, q) => {
    setLoading(true);
    const params = new URLSearchParams({ status: 'active' });
    if (cat && cat !== 'All Categories') params.append('category', cat);
    if (q) params.append('search', q);
    api.get(`/campaigns?${params}`)
      .then(r => setCampaigns(r.data.campaigns))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCampaigns(category, search); }, [category]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCampaigns(category, search);
  };

  return (
    <div>
      <div className="campaigns-hero">
        <div className="container">
          <h1 className="page-title">Explore Campaigns</h1>
          <p className="page-subtitle">Discover projects from creators making a difference</p>
          <form onSubmit={handleSearch} className="search-form">
            <input
              className="form-control search-input"
              placeholder="Search campaigns..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>
      </div>

      <div className="container" style={{ padding: '28px 20px' }}>
        <div className="filter-row">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`filter-chip ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >{cat}</button>
          ))}
        </div>

        {loading ? <div className="spinner" /> : (
          <>
            <p className="results-count">{campaigns.length} campaigns found</p>
            {campaigns.length === 0 ? (
              <div className="empty-state">
                <div className="icon">🔍</div>
                <h3>No campaigns found</h3>
                <p>Try a different search or category</p>
              </div>
            ) : (
              <div className="campaigns-grid">
                {campaigns.map(c => <CampaignCard key={c.id} campaign={c} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Campaigns;
