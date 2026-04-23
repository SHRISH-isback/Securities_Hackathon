import React from 'react'
import { Link } from 'react-router-dom'

export default function Home(){
  const legit = '/analyzer?company_name=Acme%20Corp&symbol=ACME&announcement_text=' + encodeURIComponent('We are pleased to announce a new strategic partnership with Globex Inc. Quarterly earnings in line with expectations.')
  const suspicious = '/analyzer?company_name=Alpha%20Invest&symbol=ALPH&announcement_text=' + encodeURIComponent('Unprecedented returns guaranteed! Act now for insider opportunity to skyrocket your wealth with no risk.')
  return (
    <div className="min-h-screen" style={{background:'#020617', backgroundImage:'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize:'28px 28px', backgroundAttachment:'fixed'}}>
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-28">
        {/* Top Badge */}
        <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs" style={{fontFamily:'JetBrains Mono, monospace'}}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
          Powered by Alpha Vantage &amp; SEBI Safe Space
        </span>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight max-w-4xl mb-6">
          Your First Line of Defense Against{' '}
          <span style={{background:'linear-gradient(90deg, #4ade80, #22d3ee)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text'}}>
            Securities Fraud.
          </span>
        </h1>

        <p className="text-slate-400 text-lg max-w-xl mb-10 leading-relaxed">
          AI-powered analysis of corporate announcements. Detect pump-and-dump schemes, financial mismatches, and deceptive language in seconds.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/analyzer" className="px-7 py-3 rounded-lg font-semibold text-slate-900 text-base" style={{background:'linear-gradient(90deg, #4ade80, #22d3ee)'}}>
            Analyze an Announcement
          </Link>
          <Link to={suspicious} className="px-7 py-3 rounded-lg font-semibold text-white text-base border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
            Try Suspicious Example
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-center text-slate-400 text-xs uppercase tracking-widest mb-10" style={{fontFamily:'JetBrains Mono, monospace'}}>How InsightGuard Protects You</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {title:'Real-Time Analysis', body:'Live Alpha Vantage financials and news cross-referencing on every scan.'},
            {title:'ML Fraud Detection', body:'Scikit-Learn model trained to detect pump-and-dump phrases with n-gram logic.'},
            {title:'SEBI Safe Space', body:"Aligned with SEBI's investor-protection initiative for retail market safety."},
          ].map(f => (
            <div key={f.title} className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <div className="w-8 h-8 rounded-md bg-emerald-500/20 flex items-center justify-center mb-4">
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block"></span>
              </div>
              <h3 className="text-white font-semibold text-base mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center gap-6">
          <Link to={legit} className="text-slate-400 text-sm underline underline-offset-4 hover:text-white transition-colors">Legit Example →</Link>
          <Link to={suspicious} className="text-slate-400 text-sm underline underline-offset-4 hover:text-white transition-colors">Suspicious Example →</Link>
        </div>
      </section>
    </div>
  )
}
