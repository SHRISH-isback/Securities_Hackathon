import React from 'react'

type Analysis = {
  score: number
  credibility: 'High'|'Medium'|'Low'
  flags: string[]
  ml_insights?: { top_terms: { term: string, weight: number }[] }
}

export default function Compare(){
  const API_BASE = (import.meta as any).env?.VITE_API_BASE || ''
  const [loading, setLoading] = React.useState(false)
  const [left, setLeft] = React.useState<Analysis|null>(null)
  const [right, setRight] = React.useState<Analysis|null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setLeft(null); setRight(null);
    const fd = new FormData(e.target as HTMLFormElement)
    try{
      const r = await fetch(`${API_BASE}/api/compare`, { method: 'POST', body: fd })
      const j = await r.json()
      setLeft(j.left); setRight(j.right)
    } finally { setLoading(false) }
  }

  const Panel = (title: string, r: Analysis | null) => (
    <div className='dashboard' style={{gridTemplateColumns:'1fr 2fr'}}>
      {r ? (
        <>
          <div className='score-widget'>
            <div className={`score-circle score-${r.credibility.toLowerCase()}`}><span>{r.score}</span></div>
            <p className='credibility-text'>{r.credibility}</p>
          </div>
          <div>
            <h3>{title}</h3>
            {r.flags?.length ? <ul>{r.flags.map((f,i)=><li key={i}>{f}</li>)}</ul> : <p>No flags.</p>}
            {r.ml_insights?.top_terms?.length ? (<div className='ml-insights'><h3>ML Top Terms</h3><div className='chips'>{r.ml_insights.top_terms.map((t,i)=>(<span className='chip' key={i}>{t.term} · {Math.round(t.weight*100)}%</span>))}</div></div>) : null}
          </div>
        </>
      ) : <p>Submit to compare.</p>}
    </div>
  )

  return (
    <div className='container'>
      <h1>Compare Two Announcements</h1>
      <p>Analyze two announcements side-by-side to see which is more credible.</p>
      <form onSubmit={onSubmit} id='compare-form'>
        <div className='dashboard' style={{gridTemplateColumns:'1fr 1fr'}}>
          <div>
            <h3>Announcement A</h3>
            <label>Company Name</label>
            <input name='left_company_name' required />
            <label>Stock Symbol</label>
            <input name='left_symbol' required />
            <label>Text</label>
            <textarea rows={6} name='left_announcement_text' required />
          </div>
          <div>
            <h3>Announcement B</h3>
            <label>Company Name</label>
            <input name='right_company_name' required />
            <label>Stock Symbol</label>
            <input name='right_symbol' required />
            <label>Text</label>
            <textarea rows={6} name='right_announcement_text' required />
          </div>
        </div>
        <div style={{marginTop:16,textAlign:'center'}}>
          <input type='submit' value='Compare' />
        </div>
      </form>
      {loading && <div id='loader'></div>}
      {!loading && (left || right) && (
        <div id='compare-result' className='visible'>
          <div className='dashboard' style={{gridTemplateColumns:'1fr 1fr'}}>
            {Panel('Announcement A', left)}
            {Panel('Announcement B', right)}
          </div>
        </div>
      )}
    </div>
  )
}
