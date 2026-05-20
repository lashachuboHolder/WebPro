import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function DonorPage({ user }) {
  const navigate = useNavigate()
  const [donations, setDonations] = useState([])

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetch(`http://localhost:3000/api/users/${user.id}/donations`)
      .then(r => r.json()).then(setDonations)
  }, [user])

  const total = donations.reduce((sum, d) => sum + (d.amount ?? 0), 0)

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">My Donations</h1>
      <p className="text-gray-400 text-sm mb-6">Total donated: <span className="text-violet-600 font-semibold">${total.toLocaleString()}</span></p>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {donations.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-12">No donations yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {[...donations].reverse().map(d => (
              <li key={d.id} className="px-6 py-4 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-800">Campaign #{d.campaignId}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '—'}
                  </p>
                </div>
                <span className="text-violet-600 font-semibold">${(d.amount ?? 0).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
