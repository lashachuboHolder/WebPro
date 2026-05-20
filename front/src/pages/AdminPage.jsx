import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminPage({ user }) {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [campaigns, setCampaigns] = useState([])
  const [donations, setDonations] = useState([])
  const [tab, setTab] = useState('campaigns')

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return }
    loadData()
  }, [user])

  function loadData() {
    fetch('http://localhost:3000/api/admin/stats').then(r => r.json()).then(setStats)
    fetch('http://localhost:3000/api/admin/campaigns').then(r => r.json()).then(setCampaigns)
    fetch('http://localhost:3000/api/admin/donations').then(r => r.json()).then(setDonations)
  }

  async function deleteCampaign(id) {
    await fetch(`http://localhost:3000/api/admin/campaigns/${id}`, { method: 'DELETE' })
    loadData()
  }

  async function deleteDonation(id) {
    await fetch(`http://localhost:3000/api/admin/donations/${id}`, { method: 'DELETE' })
    loadData()
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Panel</h1>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Campaigns', value: stats.totalCampaigns },
            { label: 'Donations', value: stats.totalDonations },
            { label: 'Total Raised', value: `$${(stats.totalRaised ?? 0).toLocaleString()}` },
            { label: 'Donors', value: stats.totalDonors },
            { label: 'Avg Donation', value: `$${stats.avgDonation ?? 0}` },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <p className="text-xl font-bold text-violet-600">{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('campaigns')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === 'campaigns' ? 'bg-violet-600 text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
          Campaigns ({campaigns.length})
        </button>
        <button onClick={() => setTab('donations')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === 'donations' ? 'bg-violet-600 text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
          Donations ({donations.length})
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {tab === 'campaigns' ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Progress</th>
                <th className="px-4 py-3 text-left">Raised</th>
                <th className="px-4 py-3 text-left">End Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {campaigns.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{c.title || '(no title)'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-100 rounded-full h-1.5">
                        <div className="bg-violet-500 h-1.5 rounded-full" style={{ width: `${Math.min(c.progress, 100)}%` }} />
                      </div>
                      <span className="text-gray-400 text-xs">{c.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">${(c.raisedAmount ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-400">{c.endDate || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => deleteCampaign(c.id)} className="text-xs text-red-500 hover:text-red-700 font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Donor</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Campaign</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {donations.map(d => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{d.donorName}</td>
                  <td className="px-4 py-3 text-violet-600 font-semibold">${(d.amount ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-500">#{d.campaignId}</td>
                  <td className="px-4 py-3 text-gray-400">{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => deleteDonation(d.id)} className="text-xs text-red-500 hover:text-red-700 font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
