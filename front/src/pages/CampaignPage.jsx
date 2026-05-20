import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

export default function CampaignPage({ user }) {
  const { id } = useParams()
  const [campaign, setCampaign] = useState(null)
  const [donations, setDonations] = useState([])
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState(null)

  useEffect(() => {
    fetch(`http://localhost:3000/api/campaigns/${id}`)
      .then(r => r.json()).then(setCampaign)
    fetch(`http://localhost:3000/api/campaigns/${id}/donations`)
      .then(r => r.json()).then(setDonations)
  }, [id])

  async function handleDonate(e) {
    e.preventDefault()
    if (!user) return setMessage({ type: 'error', text: 'Please log in to donate.' })
    const res = await fetch(`http://localhost:3000/api/campaigns/${id}/donations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ donorId: user.id, donorName: user.name, amount: Number(amount) }),
    })
    const data = await res.json()
    if (res.ok) {
      setCampaign(data.campaign)
      setDonations(prev => [...prev, data.donation])
      setAmount('')
      setMessage({ type: 'success', text: `Thanks for donating $${amount}!` })
    } else {
      setMessage({ type: 'error', text: data.error })
    }
  }

  if (!campaign) return <p className="text-center py-20 text-gray-400">Loading...</p>

  const pct = Math.min(Math.round((campaign.raisedAmount / campaign.goalAmount) * 100), 100)

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-2xl h-48 flex items-center justify-center mb-6">
        <span className="text-6xl">🎯</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">{campaign.title || '(no title)'}</h1>
      <p className="text-gray-500 mb-6">{campaign.description || 'No description.'}</p>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span className="font-semibold text-emerald-700 text-lg">${(campaign.raisedAmount ?? 0).toLocaleString()} raised</span>
          <span className="text-gray-400">of ${(campaign.goalAmount ?? 0).toLocaleString()} goal</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
          <div className="bg-emerald-500 h-3 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>{pct}% funded</span>
          <span>{donations.length} donation{donations.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">Make a Donation</h2>
        <form onSubmit={handleDonate} className="flex gap-3">
          <input
            type="number"
            min="1"
            placeholder="Amount ($)"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            required
          />
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-xl text-sm transition-colors"
          >
            Donate
          </button>
        </form>
        {message && (
          <p className={`mt-3 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
            {message.text}
          </p>
        )}
      </div>

      {donations.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Recent Donations</h2>
          <ul className="divide-y divide-gray-100">
            {[...donations].reverse().map(d => (
              <li key={d.id} className="py-3 flex justify-between text-sm">
                <span className="text-gray-700 font-medium">{d.donorName}</span>
                <span className="text-emerald-600 font-semibold">${(d.amount ?? 0).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
