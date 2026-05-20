import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CampaignCard from '../components/CampaignCard'

function HeartStatIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-emerald-600">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  )
}

function PeopleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-emerald-600">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  )
}

function TrendingIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-emerald-600">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-emerald-600">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  )
}

const stats = [
  { icon: <HeartStatIcon />, value: '$15B+', label: 'Raised on FundHope' },
  { icon: <PeopleIcon />,    value: '100M+', label: 'Donors worldwide' },
  { icon: <TrendingIcon />,  value: '2M+',   label: 'Campaigns funded' },
  { icon: <ShieldIcon />,    value: '100%',  label: 'Protected donations' },
]

export default function HomePage() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:3000/api/campaigns')
      .then(r => r.json())
      .then(data => { setCampaigns(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-400 px-8 py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-white leading-tight mb-4">
            The #1 Free Fundraising Platform
          </h1>
          <p className="text-white/80 text-lg mb-10 max-w-xl">
            Start your fundraising campaign in minutes. No fees, no pressure, and maximum support from our community.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link
              to="/login"
              className="bg-white text-gray-800 font-semibold px-7 py-3 rounded-full hover:bg-gray-50 transition-colors text-sm"
            >
              Start a FundHope
            </Link>
            <a
              href="#campaigns"
              className="bg-emerald-700/60 hover:bg-emerald-800/70 text-white font-semibold px-7 py-3 rounded-full transition-colors text-sm"
            >
              Explore campaigns
            </a>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-8 py-14 grid grid-cols-2 sm:grid-cols-4 gap-8">
          {stats.map(s => (
            <div key={s.label} className="flex flex-col items-center gap-2 text-center">
              {s.icon}
              <span className="text-3xl font-bold text-gray-900">{s.value}</span>
              <span className="text-sm text-gray-500">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Campaigns */}
      <div id="campaigns" className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Active Campaigns</h2>
          <p className="text-gray-500 mt-1">Support causes you care about.</p>
        </div>

        {loading ? (
          <p className="text-gray-400 text-center py-20">Loading...</p>
        ) : campaigns.length === 0 ? (
          <p className="text-gray-400 text-center py-20">No campaigns yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map(c => <CampaignCard key={c.id} campaign={c} />)}
          </div>
        )}
      </div>
    </div>
  )
}
