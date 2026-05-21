import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname.startsWith(path) ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span>🌱</span> Fundstart
        </Link>

        <div className="navbar-links">
          <Link to="/campaigns" className={`nav-link ${isActive('/campaigns')}`}>Campaigns</Link>
          {user?.role === 'influencer' && (
            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>Dashboard</Link>
          )}
          {user?.role === 'donor' && (
            <Link to="/my-donations" className={`nav-link ${isActive('/my-donations')}`}>My Donations</Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className={`nav-link ${isActive('/admin')}`}>Admin Panel</Link>
          )}
        </div>

        <div className="navbar-actions">
          {user ? (
            <>
              <div className="user-info">
                <img src={user.avatar} alt={user.name} className="user-avatar" />
                <div>
                  <div className="user-name">{user.name}</div>
                  <div className="user-role">{user.role}</div>
                </div>
              </div>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
