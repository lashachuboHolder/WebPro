import { Link } from 'react-router-dom'

export default function CampaignCard({ campaign }) {
  const pct = Math.min(campaign.progress ?? 0, 100)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      <div className="bg-gradient-to-br from-emerald-50 to-teal-100 h-36 flex items-center justify-center">
        <span className="text-emerald-400 text-4xl">🎯</span>
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <h2 className="text-base font-semibold text-gray-800 leading-snug">
          {campaign.title || '(no title)'}
        </h2>
        <p className="text-sm text-gray-500 flex-1 line-clamp-2">
          {campaign.description || 'No description provided.'}
        </p>

        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>${(campaign.raisedAmount ?? 0).toLocaleString()} raised</span>
            <span>{pct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-1">Goal: ${(campaign.goalAmount ?? 0).toLocaleString()}</p>
        </div>

        {campaign.endDate && (
          <p className="text-xs text-gray-400">Ends: {campaign.endDate}</p>
        )}

        <Link
          to={`/campaigns/${campaign.id}`}
          className="mt-auto block text-center bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2 rounded-xl transition-colors"
        >
          View Campaign
        </Link>
      </div>
    </div>
  )
}
