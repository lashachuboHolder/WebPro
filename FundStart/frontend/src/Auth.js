import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const doLogin = async (e, demoEmail, demoPass) => {
    if (e) e.preventDefault();
    const em = demoEmail || email;
    const pw = demoPass || password;
    setLoading(true); setError('');
    try {
      const user = await login(em, pw);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'influencer') navigate('/dashboard');
      else navigate('/campaigns');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const DEMOS = [
    { role: 'Admin', email: 'admin@fundstart.com', pass: 'admin123' },
    { role: 'Influencer', email: 'olivia@fundstart.com', pass: 'olivia123' },
    { role: 'Influencer', email: 'marcus@fundstart.com', pass: 'marcus123' },
    { role: 'Donor', email: 'sarah@example.com', pass: 'sarah123' },
  ];

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="card-body">
          <div className="auth-logo">
            <span className="auth-brand">Fundstart</span>
          </div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-sub">Sign in to your account</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={doLogin}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="demo-accounts">
            <p className="demo-title">Quick Login</p>
            <div className="demo-grid">
              {DEMOS.map(d => (
                <button key={d.email} className="demo-btn" onClick={() => doLogin(null, d.email, d.pass)}>
                  <span className="demo-role">{d.role}</span>
                  <span className="demo-email">{d.email}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'donor' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const user = await register(form.name, form.email, form.password, form.role);
      if (user.role === 'influencer') navigate('/dashboard');
      else navigate('/campaigns');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="card-body">
          <div className="auth-logo">
            <span className="auth-brand">Fundstart</span>
          </div>
          <h1 className="auth-title">Create account</h1>
          <p className="auth-sub">Join thousands making a difference</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-control" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" required minLength={6} />
            </div>
            <div className="form-group">
              <label className="form-label">I want to...</label>
              <div className="role-select">
                <button type="button" className={`role-btn ${form.role === 'donor' ? 'active' : ''}`} onClick={() => setForm({ ...form, role: 'donor' })}>
                  <span className="role-label">Donate to Campaigns</span>
                  <span className="role-desc">Support creators you love</span>
                </button>
                <button type="button" className={`role-btn ${form.role === 'influencer' ? 'active' : ''}`} onClick={() => setForm({ ...form, role: 'influencer' })}>
                  <span className="role-label">Create Campaigns</span>
                  <span className="role-desc">Raise funds for your project</span>
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
