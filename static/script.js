document.addEventListener("DOMContentLoaded", () => {
    // Theme handling
    const root = document.documentElement;
    const themeToggle = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");
    const themeLabel = document.getElementById("theme-label");

    const applyTheme = (theme) => {
        if (!root) return;
        root.setAttribute('data-theme', theme);
        if (themeIcon && themeLabel) {
            if (theme === 'dark') { themeIcon.textContent = '🌞'; themeLabel.textContent = 'Light'; }
            else { themeIcon.textContent = '🌙'; themeLabel.textContent = 'Dark'; }
        }
    };
    const savedTheme = localStorage.getItem('theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(savedTheme);
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const newTheme = (root.getAttribute('data-theme') === 'dark') ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });
    }
    const form = document.getElementById("analysis-form");
    // Prefill from URL params
    const params = new URLSearchParams(window.location.search);
    const maybeSet = (id, key) => { const el = document.getElementById(id); if (el && params.get(key)) el.value = params.get(key); };
    maybeSet('company_name', 'company_name');
    maybeSet('symbol', 'symbol');
    const txt = document.getElementById('announcement_text');
    if (txt && params.get('announcement_text')) txt.value = params.get('announcement_text');

    if (form) {
        const resultContainer = document.getElementById("result-container");
        const loader = document.getElementById("loader");

        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const formData = new FormData(form);
            const companyName = formData.get("company_name");
            const symbol = formData.get("symbol");
            const announcementText = formData.get("announcement_text");

            if (!companyName || !symbol || !announcementText) {
                resultContainer.innerHTML = `<p class="error">Please fill out all fields.</p>`;
                resultContainer.style.display = "block";
                return;
            }

            loader.style.display = "block";
            resultContainer.style.display = "none";
            resultContainer.classList.remove('visible');

            try {
                const response = await fetch("/api/analyze", {
                    method: "POST",
                    body: formData,
                });

                const result = await response.json();
                displayResults(result);

            } catch (error) {
                console.error("Analysis error:", error);
                resultContainer.innerHTML = `<p class="error">An unexpected error occurred. Please check the console and try again.</p>`;
            } finally {
                loader.style.display = "none";
                resultContainer.style.display = "block";
                setTimeout(() => resultContainer.classList.add('visible'), 10);
            }
        });
    }

    function displayResults(result) {
        let content = '<h2>Analysis Result:</h2>';
        if (result.error) {
            content += `<p class="error">${result.error}</p>`;
        } else {
            const flagsList = result.flags.length > 0 
                ? `<ul>${result.flags.map(flag => `<li>${flag}</li>`).join('')}</ul>`
                : '<p>No specific red flags were detected.</p>';

            const deductionsList = (result.breakdown && result.breakdown.deductions && result.breakdown.deductions.length)
                ? `<ul class="deductions-list">${result.breakdown.deductions.map(d => `<li><span>${d.reason}</span><span class="badge">-${d.penalty}</span></li>`).join('')}</ul>`
                : '';

            const mlChips = (result.ml_insights && result.ml_insights.top_terms && result.ml_insights.top_terms.length)
                ? `<div class="ml-insights"><h3>ML Top Terms</h3><div class="chips">${result.ml_insights.top_terms.map(t => `<span class="chip">${t.term} · ${Math.round(t.weight * 100)}%</span>`).join('')}</div></div>`
                : '';

            // Actions: share & download
            const shareUrl = `${window.location.origin}${window.location.pathname}?company_name=${encodeURIComponent(companyName)}&symbol=${encodeURIComponent(symbol)}&announcement_text=${encodeURIComponent(announcementText)}`;
            const downloadBtn = `<button id="download-json" class="cta-button" type="button">Download JSON</button>`;
            const shareBtn = `<button id="share-link" class="cta-button" type="button">Share Link</button>`;

            content += `
                <div class="dashboard">
                    <div class="score-widget">
                        <div class="score-circle score-${result.credibility.toLowerCase()}" id="score-circle">
                            <span id="score-value">0</span>
                        </div>
                        <p class="credibility-text">${result.credibility}</p>
                        <div style="display:flex; gap:8px; justify-content:center; margin-top:8px;">
                            ${downloadBtn}
                            ${shareBtn}
                        </div>
                    </div>
                    <div class="flags-widget">
                        <h3>Flags Raised:</h3>
                        ${flagsList}
                        <div class="deductions">
                            <h3>Score Breakdown</h3>
                            ${deductionsList}
                        </div>
                        ${mlChips}
                    </div>
                </div>
            `;
        }
        const resultContainer = document.getElementById("result-container");
        resultContainer.innerHTML = content;
        
        if (!result.error) {
            animateScore(result.score);
            const circle = document.getElementById('score-circle');
            if (circle) { circle.classList.remove('pop'); void circle.offsetWidth; circle.classList.add('pop'); }

            // Bind actions
            const dl = document.getElementById('download-json');
            if (dl) {
                dl.addEventListener('click', () => {
                    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = 'analysis.json';
                    document.body.appendChild(a); a.click(); a.remove();
                    URL.revokeObjectURL(url);
                });
            }
            const shareBtn = document.getElementById('share-link');
            if (shareBtn) {
                shareBtn.addEventListener('click', async () => {
                    try {
                        await navigator.clipboard.writeText(shareUrl);
                        shareBtn.textContent = 'Copied!';
                        setTimeout(() => shareBtn.textContent = 'Share Link', 1200);
                    } catch {}
                });
            }
        }
    }

    function animateScore(targetScore) {
        const scoreElement = document.getElementById("score-value");
        if (!scoreElement) return;

        let startTimestamp = null;
        const duration = 1500; // Animation duration in ms
        const startScore = 0;

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // Ease-out cubic function for a smoother animation
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const currentScore = Math.floor(easedProgress * (targetScore - startScore) + startScore);
            
            scoreElement.textContent = currentScore;

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                scoreElement.textContent = targetScore; // Ensure it ends on the exact score
            }
        };

        window.requestAnimationFrame(step);
    }

    // Reveal on scroll
    const revealElements = document.querySelectorAll('.feature-card, .hero-section, .container, .about-section');
    const markReveal = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    };
    const observer = new IntersectionObserver(markReveal, { threshold: 0.08 });
    revealElements.forEach(el => { el.classList.add('reveal'); observer.observe(el); });

    // Ripple effects
    const rippleTargets = document.querySelectorAll('.cta-button, input[type="submit"]');
    rippleTargets.forEach(el => {
        el.addEventListener('click', (e) => {
            const rect = el.getBoundingClientRect();
            const ink = document.createElement('span');
            ink.className = 'ripple-ink';
            ink.style.left = (e.clientX - rect.left) + 'px';
            ink.style.top = (e.clientY - rect.top) + 'px';
            el.appendChild(ink);
            setTimeout(() => ink.remove(), 650);
        });
    });

    // Page transition on navigation
    const overlay = document.getElementById('page-transition');
    document.querySelectorAll('a[href]').forEach(a => {
        const href = a.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('http')) return;
        a.addEventListener('click', (e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            e.preventDefault();
            if (overlay) overlay.classList.add('active');
            setTimeout(() => { window.location.href = href; }, 200);
        });
    });
});
