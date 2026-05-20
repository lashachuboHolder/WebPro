import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function DashboardPage({ user }) {
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState([])
  const [stats, setStats] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', goalAmount: '', endDate: '' })
  const [editId, setEditId] = useState(null)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    if (!user || user.role !== 'influencer') { navigate('/'); return }
    loadData()
  }, [user])

  function loadData() {
    fetch(`http://localhost:3000/api/users/${user.id}/campaigns`)
      .then(r => r.json()).then(setCampaigns)
    fetch(`http://localhost:3000/api/users/${user.id}/stats`)
      .then(r => r.json()).then(setStats)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const url = editId
      ? `http://localhost:3000/api/campaigns/${editId}`
      : 'http://localhost:3000/api/campaigns'
    const res = await fetch(url, {
      method: editId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, influencerId: user.id, requesterId: user.id }),
    })
    if (res.ok) {
      setForm({ title: '', description: '', goalAmount: '', endDate: '' })
      setEditId(null)
      setMsg({ type: 'success', text: editId ? 'Campaign updated.' : 'Campaign created!' })
      loadData()
    }
  }

  async function handleDelete(id) {
    await fetch(`http://localhost:3000/api/campaigns/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requesterId: user.id }),
    })
    loadData()
  }

  function startEdit(c) {
    setEditId(c.id)
    setForm({ title: c.title, description: c.description, goalAmount: c.goalAmount, endDate: c.endDate })
    setMsg(null)
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Influencer Dashboard</h1>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Campaigns', value: stats.totalCampaigns },
            { label: 'Total Raised', value: `$${(stats.totalRaised ?? 0).toLocaleString()}` },
            { label: 'Donations', value: stats.totalDonations },
            { label: 'Donors', value: stats.totalDonors },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <p className="text-2xl font-bold text-violet-600">{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <h2 className="font-semibold text-gray-800 mb-4">{editId ? 'Edit Campaign' : 'Create New Campaign'}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            placeholder="Title"
            value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            required
          />
          <input
            type="number"
            placeholder="Goal amount ($)"
            value={form.goalAmount}
            onChange={e => setForm(p => ({ ...p, goalAmount: e.target.value }))}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            required
          />
          <input
            placeholder="Description"
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 sm:col-span-2"
          />
          <input
            type="date"
            value={form.endDate}
            onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            required
          />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2 rounded-xl text-sm transition-colors">
              {editId ? 'Update' : 'Create'}
            </button>
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setForm({ title: '', description: '', goalAmount: '', endDate: '' }) }}
                className="flex-1 border border-gray-200 text-gray-500 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            )}
          </div>
        </form>
        {msg && <p className={`mt-3 text-sm ${msg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>{msg.text}</p>}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-4">My Campaigns</h2>
        {campaigns.length === 0 ? (
          <p className="text-gray-400 text-sm">No campaigns yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {campaigns.map(c => (
              <li key={c.id} className="py-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{c.title || '(no title)'}</p>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                    <div className="bg-violet-500 h-1.5 rounded-full" style={{ width: `${Math.min(c.progress, 100)}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">${(c.raisedAmount ?? 0).toLocaleString()} of ${(c.goalAmount ?? 0).toLocaleString()}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => startEdit(c)} className="text-xs px-3 py-1.5 border border-violet-300 text-violet-600 rounded-lg hover:bg-violet-50 transition-colors">Edit</button>
                  <button onClick={() => handleDelete(c.id)} className="text-xs px-3 py-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
