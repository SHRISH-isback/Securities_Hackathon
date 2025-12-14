import React from 'react'
import { Link } from 'react-router-dom'

export default function Home(){
  const legit = '/analyzer?company_name=Acme%20Corp&symbol=ACME&announcement_text=' + encodeURIComponent('We are pleased to announce a new strategic partnership with Globex Inc. Quarterly earnings in line with expectations.')
  const suspicious = '/analyzer?company_name=Alpha%20Invest&symbol=ALPH&announcement_text=' + encodeURIComponent('Unprecedented returns guaranteed! Act now for insider opportunity to skyrocket your wealth with no risk.')
  return (
    <>
      <div className="hero-section">
        <h1>Welcome to SkapSec</h1>
        <p className="subtitle">Your first line of defense against securities fraud.</p>
        <Link className="cta-button" to="/analyzer">Analyze an Announcement</Link>
      </div>
      <div className="features-section">
        <h2>How We Protect You</h2>
        <div className="features-grid">
          <div className="feature-card"><h3>Real-Time Analysis</h3><p>We use live financial data and news APIs to assess the credibility of corporate announcements.</p></div>
          <div className="feature-card"><h3>Data-Driven Scoring</h3><p>Our engine provides a weighted credibility score based on multiple factors.</p></div>
          <div className="feature-card"><h3>Investor Protection</h3><p>Aligned with SEBI's Safe Space initiative to safeguard retail investors.</p></div>
          <div className="feature-card">
            <h3>Try Examples</h3>
            <p>Jump in with sample announcements to see the analyzer in action.</p>
            <div className="button-group">
              <Link className="cta-button" to={legit}>Legit Example</Link>
              <Link className="cta-button" to={suspicious}>Suspicious Example</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
