import React from 'react'
import { Activity, Shield } from 'lucide-react'
import CredibilityGauge from '../components/CredibilityGauge'

type Analysis = {
  score: number
  credibility: 'High' | 'Medium' | 'Low'
  flags: string[]
  ml_insights?: { top_terms: { term: string; weight: number }[] }
}

function Panel({ title, r }: { title: string; r: Analysis | null }) {
  return (
    <div className="glass-card p-5 space-y-4">
      <h3 className="font-semibold text-slate-200">{title}</h3>
      {r ? (
        <>
          <CredibilityGauge score={r.score} size={160} />
          <div className="space-y-1">
            {r.flags?.length
              ? <ul className="space-y-1">{r.flags.map((f, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-1"><span className="text-red-400">⚠</span>{f}</li>
              ))}</ul>
              : <p className="text-xs text-slate-400">No flags.</p>
            }
          </div>
          {r.ml_insights?.top_terms?.length ? (
            <div className="flex flex-wrap gap-2">
              {r.ml_insights.top_terms.map((t, i) => (
                <span className="chip" key={i}>{t.term} · {Math.round(t.weight * 100)}%</span>
              ))}
            </div>
          ) : null}
        </>
      ) : <p className="text-sm text-slate-500">Submit to compare.</p>}
    </div>
  )
}

export default function Compare() {
  const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || ''
  const [loading, setLoading] = React.useState(false)
  const [left, setLeft] = React.useState<Analysis | null>(null)
  const [right, setRight] = React.useState<Analysis | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setLeft(null); setRight(null)
    const fd = new FormData(e.target as HTMLFormElement)
    try {
      const r = await fetch(`${API_BASE}/api/compare`, { method: 'POST', body: fd })
      const j = await r.json()
      setLeft(j.left); setRight(j.right)
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-100" style={{ fontFamily: 'Poppins, sans-serif' }}>Compare Two Announcements</h1>
        <p className="text-slate-400">Analyze two announcements side-by-side to see which is more credible.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { prefix: 'left', title: 'Announcement A' },
            { prefix: 'right', title: 'Announcement B' },
          ].map(({ prefix, title }) => (
            <div key={prefix} className="glass-card p-5 flex flex-col space-y-4">
              <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />{title}
              </h3>
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-medium text-slate-400">Company Name</label>
                <input className="glass-input" name={`${prefix}_company_name`} placeholder="e.g. Acme Corp" required />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-medium text-slate-400">Stock Symbol</label>
                <input className="glass-input" name={`${prefix}_symbol`} placeholder="e.g. ACME" required />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-medium text-slate-400">Announcement Text</label>
                <textarea className="glass-input resize-none" rows={5} name={`${prefix}_announcement_text`} placeholder="Paste announcement…" required />
              </div>
            </div>
          ))}
        </div>
        <div className="text-center">
          <button type="submit" className="btn-primary" disabled={loading}>
            <Activity className="w-4 h-4" />{loading ? 'Comparing…' : 'Compare'}
          </button>
        </div>
      </form>

      {loading && <div id="loader" />}

      {!loading && (left || right) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Panel title="Announcement A" r={left} />
          <Panel title="Announcement B" r={right} />
        </div>
      )}
    </div>
  )
}
