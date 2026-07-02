import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const THEME_STORAGE_KEY = 'fundstart-theme';

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  return savedTheme === 'dark' ? 'dark' : 'light';
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === 'dark' ? 'light' : 'dark'
    );
  };

  const isActive = (path) =>
    location.pathname.startsWith(path) ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          Fundstart
        </Link>

        <div className="navbar-links">
          <Link
            to="/campaigns"
            className={`nav-link ${isActive('/campaigns')}`}
          >
            Campaigns
          </Link>

          {user?.role === 'influencer' && (
            <Link
              to="/dashboard"
              className={`nav-link ${isActive('/dashboard')}`}
            >
              Dashboard
            </Link>
          )}

          {user?.role === 'donor' && (
            <Link
              to="/my-donations"
              className={`nav-link ${isActive('/my-donations')}`}
            >
              My Donations
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className={`nav-link ${isActive('/admin')}`}
            >
              Admin Panel
            </Link>
          )}
        </div>

        <div className="navbar-actions">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            title="Switch between light mode and dark mode"
          >
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>

          {user ? (
            <>
              <div className="user-info">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="user-avatar"
                />
                <div>
                  <div className="user-name">{user.name}</div>
                  <div className="user-role">{user.role}</div>
                </div>
              </div>

              <button
                className="btn btn-outline btn-sm"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
