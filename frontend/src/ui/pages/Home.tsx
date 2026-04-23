import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, Activity, TrendingUp, Play } from 'lucide-react'

const legit = '/analyzer?company_name=Acme%20Corp&symbol=ACME&announcement_text=' +
  encodeURIComponent('We are pleased to announce a new strategic partnership with Globex Inc. Quarterly earnings in line with expectations.')
const suspicious = '/analyzer?company_name=Alpha%20Invest&symbol=ALPH&announcement_text=' +
  encodeURIComponent('Unprecedented returns guaranteed! Act now for insider opportunity to skyrocket your wealth with no risk.')

const features = [
  {
    icon: <Activity className="w-6 h-6 text-blue-400" />,
    title: 'Real-Time Analysis',
    desc: 'Live financial data and news APIs assess credibility of corporate announcements.',
  },
  {
    icon: <TrendingUp className="w-6 h-6 text-purple-400" />,
    title: 'Data-Driven Scoring',
    desc: 'Our engine produces a weighted credibility score based on multiple factors.',
  },
  {
    icon: <Shield className="w-6 h-6 text-green-400" />,
    title: 'Investor Protection',
    desc: "Aligned with SEBI's Safe Space initiative to safeguard retail investors.",
  },
  {
    icon: <Play className="w-6 h-6 text-yellow-400" />,
    title: 'Try Examples',
    desc: 'Jump in with sample announcements to see the analyzer in action.',
    extra: (
      <div className="flex gap-3 mt-3">
        <Link className="btn-ghost text-xs" to={legit}>Legit Example</Link>
        <Link className="btn-ghost text-xs" to={suspicious}>Suspicious Example</Link>
      </div>
    ),
  },
]

export default function Home() {
  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      {/* Hero */}
      <div className="text-center py-20 px-6 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 backdrop-blur-lg space-y-6">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full text-blue-300 text-sm font-medium">
          <Shield className="w-4 h-4" /> AI-Powered Securities Fraud Detection
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-100" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Welcome to InsightGuard
        </h1>
        <p className="text-lg text-slate-400 max-w-xl mx-auto">
          Your first line of defense against securities fraud. Analyze corporate announcements with ML-powered credibility scoring.
        </p>
        <Link className="btn-primary" to="/analyzer">
          <Shield className="w-5 h-5" /> Analyze an Announcement
        </Link>
      </div>

      {/* Features */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-200 text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>How We Protect You</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map(({ icon, title, desc, extra }) => (
            <div key={title} className="glass-card p-6 space-y-2">
              {icon}
              <h3 className="font-semibold text-slate-200">{title}</h3>
              <p className="text-sm text-slate-400 text-left">{desc}</p>
              {extra}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
