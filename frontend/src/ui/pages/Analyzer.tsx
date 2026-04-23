import React from 'react'
import { useSearchParams } from 'react-router-dom'
import AuditTrail from '../components/AuditTrail'

type Analysis = {
  score: number
  credibility: 'High' | 'Medium' | 'Low'
  flags: string[]
  breakdown: { initial_score: number, deductions: { reason: string, penalty: number, category: string }[] }
  ml_insights?: { suspicion_probability: number, top_terms: { term: string, weight: number }[] }
}

const monoFont: React.CSSProperties = {fontFamily: 'JetBrains Mono, ui-monospace, monospace'}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-slate-500 text-xs uppercase tracking-widest" style={monoFont}>{label}</label>
      {children}
    </div>
  )
}

const inputBase: React.CSSProperties = {
  ...monoFont,
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid rgba(255,255,255,0.15)',
  outline: 'none',
  color: '#e2e8f0',
  padding: '6px 0',
  fontSize: '0.95rem',
  width: '100%',
}

export default function Analyzer(){
  const API_BASE = (import.meta as any).env?.VITE_API_BASE || ''
  const [params] = useSearchParams()
  const [companyName, setCompanyName] = React.useState(params.get('company_name') || '')
  const [symbol, setSymbol] = React.useState(params.get('symbol') || '')
  const [text, setText] = React.useState(params.get('announcement_text') || '')
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<Analysis | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setResult(null)
    const fd = new FormData()
    fd.append('company_name', companyName)
    fd.append('symbol', symbol)
    fd.append('announcement_text', text)
    try{
      const r = await fetch(`${API_BASE}/api/analyze`, { method: 'POST', body: fd })
      const j = await r.json()
      setResult(j)
    } finally {
      setLoading(false)
    }
  }

  const shareUrl = `${location.origin}${location.pathname}?company_name=${encodeURIComponent(companyName)}&symbol=${encodeURIComponent(symbol)}&announcement_text=${encodeURIComponent(text)}`

  const scoreColor = result?.credibility === 'High' ? '#34d399' : result?.credibility === 'Medium' ? '#fbbf24' : '#f87171'

  return (
    <div className="min-h-screen px-4 py-12" style={{background:'#020617', backgroundImage:'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize:'28px 28px', backgroundAttachment:'fixed'}}>
      <div className="max-w-5xl mx-auto">

        {/* Two-column dashboard layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start mb-6">

          {/* Left column */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
              <span className="text-emerald-400 text-xs uppercase tracking-widest" style={monoFont}>System Online</span>
            </div>
            <h2 className="text-white font-extrabold tracking-tighter leading-none" style={{fontSize:'clamp(2rem, 5vw, 3rem)'}}>
              VALIDATE<br/>THE DATA
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Submit a corporate announcement to run rule-based, financial, and ML analysis. Each submission generates a full credibility certificate.
            </p>
            <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4 space-y-2">
              {[
                {label:'Rule Engine', value:'Active'},
                {label:'Alpha Vantage', value:'Connected'},
                {label:'ML Model', value:'Loaded'},
              ].map(s => (
                <div key={s.label} className="flex justify-between text-xs" style={monoFont}>
                  <span className="text-slate-500">{s.label}</span>
                  <span className="text-emerald-400">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column – glassmorphism card */}
          <div className="lg:col-span-3 rounded-2xl border border-white/10 p-7 backdrop-blur-xl" style={{background:'rgba(255,255,255,0.05)'}}>
            <h3 className="text-white font-semibold text-base mb-6" style={monoFont}>New Analysis</h3>
            <form onSubmit={onSubmit} className="flex flex-col gap-6">
              <Field label="Company Name">
                <input
                  style={inputBase}
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  required
                  placeholder="e.g. Acme Corp"
                  onFocus={e => (e.target.style.borderBottomColor = '#34d399')}
                  onBlur={e => (e.target.style.borderBottomColor = 'rgba(255,255,255,0.15)')}
                />
              </Field>
              <Field label="Stock Symbol">
                <input
                  style={inputBase}
                  value={symbol}
                  onChange={e => setSymbol(e.target.value)}
                  required
                  placeholder="e.g. ACME"
                  onFocus={e => (e.target.style.borderBottomColor = '#34d399')}
                  onBlur={e => (e.target.style.borderBottomColor = 'rgba(255,255,255,0.15)')}
                />
              </Field>
              <Field label="Announcement Text">
                <textarea
                  style={{...inputBase, resize:'vertical', borderBottom:'1px solid rgba(255,255,255,0.15)'}}
                  rows={6}
                  value={text}
                  onChange={e => setText(e.target.value)}
                  required
                  placeholder="Paste the corporate announcement here…"
                  onFocus={e => (e.currentTarget.style.borderBottomColor = '#34d399')}
                  onBlur={e => (e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.15)')}
                />
              </Field>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg font-semibold text-slate-900 text-sm transition-opacity disabled:opacity-50"
                style={{background:'linear-gradient(90deg, #4ade80, #22d3ee)', ...monoFont}}
              >
                {loading ? 'Analyzing…' : 'Run Analysis →'}
              </button>
            </form>
          </div>
        </div>

        {/* Audit Trail */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-4 py-2 mb-8">
          <AuditTrail />
        </div>

        {/* Results */}
        {result && !loading && (
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-7">
            {'error' in (result as any) ? (
              <p className="text-red-400 text-sm" style={monoFont}>{(result as any).error}</p>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-semibold text-base" style={monoFont}>Credibility Certificate</h3>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="px-4 py-1.5 rounded-lg border border-white/10 text-slate-300 text-xs hover:bg-white/10 transition-colors"
                      style={monoFont}
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(result, null, 2)], {type:'application/json'})
                        const url = URL.createObjectURL(blob); const a = document.createElement('a');
                        a.href = url; a.download = 'analysis.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
                      }}
                    >
                      Download JSON
                    </button>
                    <button
                      type="button"
                      className="px-4 py-1.5 rounded-lg border border-white/10 text-slate-300 text-xs hover:bg-white/10 transition-colors"
                      style={monoFont}
                      onClick={async () => { try{ await navigator.clipboard.writeText(shareUrl) }catch{} }}
                    >
                      Share Link
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Score */}
                  <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 p-6">
                    <div className="w-24 h-24 rounded-full border-4 flex items-center justify-center mb-3" style={{borderColor: scoreColor}}>
                      <span className="text-3xl font-bold" style={{color: scoreColor, ...monoFont}}>{result.score}</span>
                    </div>
                    <span className="text-xs uppercase tracking-widest" style={{color: scoreColor, ...monoFont}}>{result.credibility} Credibility</span>
                    {result.ml_insights && (
                      <span className="mt-2 text-slate-500 text-xs" style={monoFont}>
                        ML suspicion: {Math.round(result.ml_insights.suspicion_probability * 100)}%
                      </span>
                    )}
                  </div>

                  {/* Flags */}
                  <div className="md:col-span-2 flex flex-col gap-4">
                    <div>
                      <h4 className="text-slate-400 text-xs uppercase tracking-widest mb-2" style={monoFont}>Flags Raised</h4>
                      {result.flags?.length ? (
                        <ul className="space-y-1">
                          {result.flags.map((f, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                              <span className="text-amber-400 mt-0.5">⚠</span>
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      ) : <p className="text-emerald-400 text-sm">No red flags detected.</p>}
                    </div>

                    <div>
                      <h4 className="text-slate-400 text-xs uppercase tracking-widest mb-2" style={monoFont}>Score Breakdown</h4>
                      <div className="space-y-1">
                        {result.breakdown.deductions.length === 0
                          ? <p className="text-slate-500 text-xs" style={monoFont}>No deductions applied.</p>
                          : result.breakdown.deductions.map((d, i) => (
                            <div key={i} className="flex justify-between items-center text-xs py-1 border-b border-white/5">
                              <span className="text-slate-400">{d.reason}</span>
                              <span className="text-red-400 ml-4 shrink-0" style={monoFont}>-{d.penalty}</span>
                            </div>
                          ))
                        }
                      </div>
                    </div>

                    {result.ml_insights?.top_terms?.length ? (
                      <div>
                        <h4 className="text-slate-400 text-xs uppercase tracking-widest mb-2" style={monoFont}>ML Top Terms</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.ml_insights.top_terms.map((t, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs" style={monoFont}>
                              {t.term} · {Math.round(t.weight * 100)}%
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
