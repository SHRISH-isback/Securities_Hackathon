import React from 'react'
import { useSearchParams } from 'react-router-dom'

type Analysis = {
  score: number
  credibility: 'High' | 'Medium' | 'Low'
  flags: string[]
  breakdown: { initial_score: number, deductions: { reason: string, penalty: number, category: string }[] }
  ml_insights?: { suspicion_probability: number, top_terms: { term: string, weight: number }[] }
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
      setTimeout(()=>{
        const circle = document.getElementById('score-circle')
        if (circle){ circle.classList.remove('pop'); void circle.offsetWidth; circle.classList.add('pop') }
      }, 50)
    } finally {
      setLoading(false)
    }
  }

  const shareUrl = `${location.origin}${location.pathname}?company_name=${encodeURIComponent(companyName)}&symbol=${encodeURIComponent(symbol)}&announcement_text=${encodeURIComponent(text)}`

  return (
    <div className="container">
      <h1>Corporate Announcement Analyzer</h1>
      <p>Enter details for a real-time credibility analysis.</p>
      <form onSubmit={onSubmit}>
        <label>Company Name:</label>
        <input value={companyName} onChange={e=>setCompanyName(e.target.value)} required />
        <label>Stock Symbol:</label>
        <input value={symbol} onChange={e=>setSymbol(e.target.value)} required />
        <label>Announcement Text:</label>
        <textarea rows={8} value={text} onChange={e=>setText(e.target.value)} required />
        <input type="submit" value="Analyze Announcement" />
      </form>
      {loading && <div id="loader"></div>}
      {result && !loading && (
        <div id="result-container" className="visible">
          <h2>Analysis Result:</h2>
          {('error' in (result as any)) ? <p className='error'>{(result as any).error}</p> : (
            <div className="dashboard">
              <div className="score-widget">
                <div className={`score-circle score-${result.credibility.toLowerCase()}`} id="score-circle">
                  <span>{result.score}</span>
                </div>
                <p className="credibility-text">{result.credibility}</p>
                <div style={{display:'flex', gap:8, justifyContent:'center'}}>
                  <button type='button' className='cta-button' onClick={()=>{
                    const blob = new Blob([JSON.stringify(result, null, 2)], {type:'application/json'})
                    const url = URL.createObjectURL(blob); const a = document.createElement('a');
                    a.href = url; a.download = 'analysis.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
                  }}>Download JSON</button>
                  <button type='button' className='cta-button' onClick={async()=>{
                    try{ await navigator.clipboard.writeText(shareUrl) }catch{}
                  }}>Share Link</button>
                </div>
              </div>
              <div className="flags-widget">
                <h3>Flags Raised:</h3>
                {result.flags?.length ? <ul>{result.flags.map((f,i)=><li key={i}>{f}</li>)}</ul> : <p>No specific red flags were detected.</p>}
                <div className='deductions'>
                  <h3>Score Breakdown</h3>
                  <ul className='deductions-list'>
                    {result.breakdown.deductions.map((d,i)=>(
                      <li key={i}><span>{d.reason}</span><span className='badge'>-{d.penalty}</span></li>
                    ))}
                  </ul>
                </div>
                {result.ml_insights?.top_terms?.length ? (
                  <div className='ml-insights'>
                    <h3>ML Top Terms</h3>
                    <div className='chips'>
                      {result.ml_insights.top_terms.map((t,i)=>(<span className='chip' key={i}>{t.term} · {Math.round(t.weight*100)}%</span>))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
