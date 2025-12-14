import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'

export default function App() {
  const [theme, setTheme] = React.useState<string>(() =>
    localStorage.getItem('theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  )
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])
  const location = useLocation()
  React.useEffect(() => {
    const el = document.getElementById('page-transition')
    if (el) { el.classList.add('active'); setTimeout(()=> el.classList.remove('active'), 250) }
  }, [location])
  return (
    <div className="page-container">
      <header>
        <nav>
          <Link to="/" className="logo">SkapSec</Link>
          <ul>
            <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link></li>
            <li><Link to="/analyzer" className={location.pathname.startsWith('/analyzer') ? 'active' : ''}>Analyzer</Link></li>
            <li><Link to="/compare" className={location.pathname.startsWith('/compare') ? 'active' : ''}>Compare</Link></li>
            <li><Link to="/about" className={location.pathname.startsWith('/about') ? 'active' : ''}>About</Link></li>
          </ul>
          <div className="theme-toggle" role="button" aria-label="Toggle theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            <span>{theme === 'dark' ? '🌞' : '🌙'}</span>
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </div>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <footer>
        <p>© SkapSec</p>
      </footer>
      <div id="page-transition" aria-hidden="true"></div>
    </div>
  )
}
