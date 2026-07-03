import React from 'react';
import { Link } from 'react-router-dom';

const STATUS_CLASS = {
  draft: 'badge-gray',
  pending: 'badge-yellow',
  active: 'badge-green',
  completed: 'badge-navy',
  suspended: 'badge-red',
  flagged: 'badge-yellow'
};

const STATUS_LABEL = {
  draft: 'Draft',
  pending: 'Pending Review',
  active: 'Active',
  completed: 'Completed',
  suspended: 'Suspended',
  flagged: 'Flagged'
};

const CampaignCard = ({ campaign, showActions, onEdit, onDelete, onSubmit }) => {
  const { id, title, shortDescription, image, category, goalAmount, raisedAmount, progressPercent, backers, daysLeft, status } = campaign;

  return (
    <div className="campaign-card card">
      <div className="campaign-card-img-wrap">
        <img src={image} alt={title} className="campaign-card-img" loading="lazy" />
        <span className={`badge ${STATUS_CLASS[status] || 'badge-gray'} campaign-status-badge`}>{STATUS_LABEL[status] || status}</span>
        <span className="badge badge-navy campaign-category-badge">{category}</span>
      </div>
      <div className="card-body">
        <h3 className="campaign-title">{title}</h3>
        <p className="campaign-desc">{shortDescription}</p>
        <div className="campaign-meta">
          <div className="meta-item">
            <span className="meta-value">${raisedAmount?.toLocaleString()}</span>
            <span className="meta-label">of ${goalAmount?.toLocaleString()} goal</span>
          </div>
          <div className="meta-item text-right">
            <span className="meta-value">{progressPercent}%</span>
            <span className="meta-label">funded</span>
          </div>
        </div>
        <div className="progress-bar-wrap" style={{ marginBottom: 10 }}>
          <div className="progress-bar-fill" style={{ width: `${Math.min(progressPercent, 100)}%` }} />
        </div>
        <div className="campaign-stats">
          <span>{backers} backers</span>
          <span>{daysLeft} days left</span>
        </div>
        {showActions && status === 'pending' && (
          <p className="campaign-workflow-note">⏳ Awaiting admin approval — not visible to the public yet.</p>
        )}
        {showActions && status === 'draft' && (
          <p className="campaign-workflow-note">📝 Draft — submit it for review to go live.</p>
        )}
        <div className="campaign-card-actions" style={{ marginTop: 12 }}>
          {status === 'active' || status === 'completed' ? (
            <Link to={`/campaigns/${id}`} className="btn btn-primary btn-sm" style={{ flex: 1 }}>View Campaign</Link>
          ) : showActions ? (
            <Link to={`/campaigns/${id}`} className="btn btn-outline btn-sm" style={{ flex: 1 }}>Preview</Link>
          ) : null}
          {showActions && (
            <>
              {status === 'draft' && (
                <button className="btn btn-secondary btn-sm" onClick={() => onSubmit?.(campaign)}>Submit for Review</button>
              )}
              <button className="btn btn-outline btn-sm" onClick={() => onEdit?.(campaign)}>Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => onDelete?.(campaign)}>Delete</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;
