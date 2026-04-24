import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { Shield, Activity, Info, Download, Share2 } from 'lucide-react'
import CredibilityGauge from '../components/CredibilityGauge'
import AuditTrail from '../components/AuditTrail'

type Deduction = { reason: string; penalty: number; category: string }
type Analysis = {
  score: number
  credibility: 'High' | 'Medium' | 'Low'
  flags: string[]
  breakdown: { initial_score: number; deductions: Deduction[] }
  ml_insights?: { suspicion_probability: number; top_terms: { term: string; weight: number }[] }
  hype_score?: number
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col space-y-1">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
        {icon}
        {label}
      </label>
      {children}
    </div>
  )
}

export default function Analyzer() {
  const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || ''
  const [params] = useSearchParams()
  const [companyName, setCompanyName] = React.useState(params.get('company_name') || '')
  const [symbol, setSymbol] = React.useState(params.get('symbol') || '')
  const [text, setText] = React.useState(params.get('announcement_text') || '')
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<Analysis | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setResult(null); setError(null)
    const fd = new FormData()
    fd.append('company_name', companyName)
    fd.append('symbol', symbol)
    fd.append('announcement_text', text)
    try {
      const r = await fetch(`${API_BASE}/api/analyze`, { method: 'POST', body: fd })
      const j = await r.json()
      if ('error' in j) { setError(j.error) } else { setResult(j) }
    } catch (err) {
      setError('Failed to reach the API. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const shareUrl = `${location.origin}${location.pathname}?company_name=${encodeURIComponent(companyName)}&symbol=${encodeURIComponent(symbol)}&announcement_text=${encodeURIComponent(text)}`

  const downloadJson = () => {
    if (!result) return
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'analysis.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
  }

  const copyLink = async () => { try { await navigator.clipboard.writeText(shareUrl) } catch {} }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-100" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Corporate Announcement Analyzer
        </h1>
        <p className="text-slate-400">Enter details for a real-time credibility analysis.</p>
      </div>

      {/* Form */}
      <div className="glass-card p-6">
        <form onSubmit={onSubmit} className="flex flex-col space-y-6">
          <Field label="Company Name" icon={<Shield className="w-4 h-4 text-blue-400" />}>
            <input
              className="glass-input"
              placeholder="e.g. Acme Corp"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              required
            />
          </Field>

          <Field label="Stock Symbol" icon={<Activity className="w-4 h-4 text-blue-400" />}>
            <input
              className="glass-input"
              placeholder="e.g. ACME"
              value={symbol}
              onChange={e => setSymbol(e.target.value)}
              required
            />
          </Field>

          <Field label="Announcement Text" icon={<Info className="w-4 h-4 text-blue-400" />}>
            <textarea
              className="glass-input resize-none"
              rows={8}
              placeholder="Paste the corporate announcement here..."
              value={text}
              onChange={e => setText(e.target.value)}
              required
            />
          </Field>

          <button type="submit" className="btn-primary justify-center" disabled={loading}>
            {loading ? 'Analyzing…' : <><Shield className="w-4 h-4" /> Analyze Announcement</>}
          </button>
        </form>
      </div>

      {/* Loader */}
      {loading && <div id="loader" />}

      {/* Audit Trail */}
      <div className="glass-card px-4 py-2">
        <AuditTrail />
      </div>

      {/* Error */}
      {error && (
        <div className="glass-card p-4 border-red-500/30 bg-red-500/10 text-red-300 text-sm">{error}</div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="space-y-4">
          {/* Gauge + actions */}
          <div className="glass-card p-6 flex flex-col items-center space-y-4">
            <CredibilityGauge score={result.score} size={220} />
            {result.hype_score !== undefined && (
              <p className="text-xs text-slate-400">Hype Score: <span className="font-semibold text-yellow-400">{result.hype_score}</span></p>
            )}
            <div className="flex gap-3">
              <button type="button" className="btn-ghost text-sm" onClick={downloadJson}>
                <Download className="w-4 h-4" /> Download JSON
              </button>
              <button type="button" className="btn-ghost text-sm" onClick={copyLink}>
                <Share2 className="w-4 h-4" /> Copy Link
              </button>
            </div>
          </div>

          {/* Flags */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-semibold text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" /> Flags Raised
            </h3>
            {result.flags?.length
              ? <ul className="space-y-2">{result.flags.map((f, i) => (
                <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">⚠</span>{f}
                </li>
              ))}</ul>
              : <p className="text-sm text-slate-400">No specific red flags were detected.</p>
            }
          </div>

          {/* Score breakdown */}
          {result.breakdown.deductions.length > 0 && (
            <div className="glass-card p-6 space-y-3">
              <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400" /> Score Breakdown
              </h3>
              <ul className="space-y-2">
                {result.breakdown.deductions.map((d, i) => (
                  <li key={i} className="flex items-center justify-between text-sm text-slate-300">
                    <span>{d.reason}</span>
                    <span className="badge ml-2 shrink-0">-{d.penalty}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ML insights */}
          {result.ml_insights?.top_terms?.length ? (
            <div className="glass-card p-6 space-y-3">
              <h3 className="font-semibold text-slate-200">ML Top Terms</h3>
              <div className="flex flex-wrap gap-2">
                {result.ml_insights.top_terms.map((t, i) => (
                  <span className="chip" key={i}>{t.term} · {Math.round(t.weight * 100)}%</span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
