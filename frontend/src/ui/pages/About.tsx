import React from 'react'
import { Shield, Info } from 'lucide-react'

export default function About() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-100" style={{ fontFamily: 'Poppins, sans-serif' }}>About InsightGuard</h1>
        <p className="text-slate-400">Protecting retail investors with AI-powered analysis.</p>
      </div>
      <div className="glass-card p-6 space-y-3">
        <div className="flex items-center gap-2 text-blue-400 font-semibold">
          <Shield className="w-5 h-5" /> Mission
        </div>
        <p className="text-sm text-slate-300 text-left">
          InsightGuard protects retail investors by analyzing corporate announcements and surfacing credibility signals using rule-based checks, live financial data, and machine learning.
        </p>
      </div>
      <div className="glass-card p-6 space-y-3">
        <div className="flex items-center gap-2 text-yellow-400 font-semibold">
          <Info className="w-5 h-5" /> Disclaimer
        </div>
        <p className="text-sm text-slate-300 text-left">
          Information provided by InsightGuard is for educational purposes only and is <strong className="text-slate-100">not financial advice</strong>. Always conduct your own research before making investment decisions.
        </p>
      </div>
    </div>
  )
}
