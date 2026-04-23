import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'

export default function App() {
  const location = useLocation()
  React.useEffect(() => {
    const el = document.getElementById('page-transition')
    if (el) { el.classList.add('active'); setTimeout(()=> el.classList.remove('active'), 250) }
  }, [location])
  return (
    <div style={{minHeight:'100vh', display:'flex', flexDirection:'column', background:'#020617'}}>
      <header style={{position:'sticky', top:0, zIndex:1000, borderBottom:'1px solid rgba(255,255,255,0.07)', backdropFilter:'blur(12px)', background:'rgba(2,6,23,0.8)'}}>
        <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
          <Link to="/" className="text-white font-bold text-lg" style={{fontFamily:'JetBrains Mono, monospace', letterSpacing:'-0.02em', textDecoration:'none'}}>
            Insight<span style={{color:'#34d399'}}>Guard</span>
          </Link>
          <ul className="flex gap-6 list-none m-0 p-0">
            {[
              {to:'/', label:'Home', exact:true},
              {to:'/analyzer', label:'Analyzer'},
              {to:'/compare', label:'Compare'},
              {to:'/about', label:'About'},
            ].map(({to, label, exact}) => {
              const active = exact ? location.pathname === to : location.pathname.startsWith(to)
              return (
                <li key={to}>
                  <Link
                    to={to}
                    style={{
                      color: active ? '#34d399' : '#94a3b8',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      transition: 'color 0.2s',
                    }}
                  >
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </header>
      <main style={{flex:1}}>
        <Outlet />
      </main>
      <footer style={{background:'rgba(2,6,23,0.9)', borderTop:'1px solid rgba(255,255,255,0.07)', padding:'20px', textAlign:'center'}}>
        <p style={{color:'#475569', fontSize:'0.75rem', fontFamily:'JetBrains Mono, monospace', margin:0}}>© InsightGuard — SEBI Safe Space Initiative</p>
      </footer>
      <div id="page-transition" aria-hidden="true"></div>
    </div>
  )
}
