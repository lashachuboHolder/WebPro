import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import CampaignPage from './pages/CampaignPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AdminPage from './pages/AdminPage'
import DonorPage from './pages/DonorPage'

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })

  function handleLogin(userData) {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  function handleLogout() {
    setUser(null)
    localStorage.removeItem('user')
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/"               element={<HomePage />} />
          <Route path="/campaigns/:id"  element={<CampaignPage user={user} />} />
          <Route path="/login"          element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/dashboard"      element={<DashboardPage user={user} />} />
          <Route path="/admin"          element={<AdminPage user={user} />} />
          <Route path="/history"        element={<DonorPage user={user} />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
