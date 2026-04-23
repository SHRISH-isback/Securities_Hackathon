import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Shield } from 'lucide-react'

export default function App() {
  const location = useLocation()

  React.useEffect(() => {
    const el = document.getElementById('page-transition')
    if (el) { el.classList.add('active'); setTimeout(() => el.classList.remove('active'), 250) }
  }, [location])

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      <header className="nav-glass px-6 md:px-10 py-4">
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-blue-400 font-bold text-xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <Shield className="w-6 h-6" />
            InsightGuard
          </Link>
          <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
            {[
              { to: '/', label: 'Home', exact: true },
              { to: '/analyzer', label: 'Analyzer' },
              { to: '/compare', label: 'Compare' },
              { to: '/about', label: 'About' },
            ].map(({ to, label, exact }) => {
              const isActive = exact ? location.pathname === to : location.pathname.startsWith(to)
              return (
                <li key={to}>
                  <Link
                    to={to}
                    className={`text-sm font-medium transition-colors ${isActive ? 'text-blue-400' : 'text-slate-400 hover:text-slate-100'}`}
                  >
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </header>

      <main className="flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-white/10 text-center py-5 text-slate-500 text-sm">
        © {new Date().getFullYear()} InsightGuard — Not financial advice.
      </footer>

      <div id="page-transition" aria-hidden="true" />
    </div>
  )
}
