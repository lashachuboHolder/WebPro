import { useEffect, useState } from 'react'

function App() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('http://localhost:3000/api/campaigns')
      .then(res => res.json())
      .then(data => { setCampaigns(data); setLoading(false) })
      .catch(() => { setError('Could not connect to server.'); setLoading(false) })
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen text-gray-500 text-lg">
      Loading campaigns...
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center min-h-screen text-red-500 text-lg">
      {error}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Campaigns</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map(c => {
          const pct = Math.min(c.progress, 100)
          return (
            <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col gap-3">
              <h2 className="text-lg font-semibold text-gray-800">{c.title || '(no title)'}</h2>
              <p className="text-sm text-gray-500 flex-1">{c.description || '(no description)'}</p>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-violet-500 h-2 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex justify-between text-sm text-gray-600">
                <span>${c.raisedAmount.toLocaleString()} raised</span>
                <span>{c.progress}% of ${c.goalAmount.toLocaleString()}</span>
              </div>

              {c.endDate && (
                <p className="text-xs text-gray-400">Ends: {c.endDate}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default App
