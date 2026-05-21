import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Navbar from './Navbar';
import Home from './Home';
import { Login, Register } from './Auth';
import Campaigns from './Campaigns';
import CampaignDetail from './CampaignDetail';
import Dashboard from './Dashboard';
import MyDonations from './MyDonations';
import AdminPanel from './AdminPanel';
import './index.css';

// Protects routes based on user role
const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/campaigns/:id" element={<CampaignDetail />} />
        <Route path="/dashboard" element={
          <ProtectedRoute roles={['influencer']}><Dashboard /></ProtectedRoute>
        } />
        <Route path="/my-donations" element={
          <ProtectedRoute roles={['donor']}><MyDonations /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}><AdminPanel /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
