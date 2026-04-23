import React from 'react'

const steps = [
  {
    id: 1,
    phase: 'Ingestion',
    label: 'Scans text for keywords, pressure tactics, and sensational language.',
    amber: false,
  },
  {
    id: 2,
    phase: 'Cross-Reference',
    label: 'Fetches Alpha Vantage financials & News API to verify claims.',
    amber: true,
  },
  {
    id: 3,
    phase: 'ML Logic',
    label: 'Runs Scikit-Learn weights with n-gram pump-and-dump detection.',
    amber: true,
  },
  {
    id: 4,
    phase: 'Verdict',
    label: 'Generates Credibility Certificate with score and detailed breakdown.',
    amber: false,
  },
]

export default function AuditTrail() {
  return (
    <div className="w-full py-10 px-2">
      <p className="text-center text-slate-500 text-xs uppercase tracking-widest mb-8" style={{fontFamily:'JetBrains Mono, monospace'}}>
        Audit Trail
      </p>
      <div className="relative flex flex-col sm:flex-row items-stretch sm:items-start justify-between gap-0">
        {/* Connecting line (desktop) */}
        <div className="hidden sm:block absolute top-6 left-0 right-0 h-px" style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(52,211,153,0.4) 20%, rgba(251,191,36,0.5) 50%, rgba(52,211,153,0.4) 80%, transparent 100%)',
          boxShadow: '0 0 8px 1px rgba(52,211,153,0.2)',
        }} />

        {steps.map((step, idx) => (
          <div key={step.id} className="relative flex-1 flex flex-col items-center text-center px-3">
            {/* Step circle */}
            <div
              className="relative z-10 w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-bold mb-4"
              style={step.amber
                ? {borderColor:'rgba(251,191,36,0.6)', background:'rgba(251,191,36,0.1)', color:'#fbbf24'}
                : {borderColor:'rgba(52,211,153,0.6)', background:'rgba(52,211,153,0.1)', color:'#34d399'}
              }
            >
              {step.id}
            </div>

            <h4 className="text-sm font-semibold mb-1" style={{color: step.amber ? '#fbbf24' : '#34d399', fontFamily:'JetBrains Mono, monospace'}}>
              {step.phase}
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed max-w-[160px]">{step.label}</p>

            {/* Vertical connector (mobile) */}
            {idx < steps.length - 1 && (
              <div className="sm:hidden w-px h-6 mt-4" style={{background:'rgba(52,211,153,0.3)'}} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
