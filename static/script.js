document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("analysis-form");
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
                // Add a class to trigger the animation
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

            content += `
                <div class="dashboard">
                    <div class="score-widget">
                        <div class="score-circle score-${result.credibility.toLowerCase()}">
                            <span id="score-value">0</span>
                        </div>
                        <p class="credibility-text">${result.credibility}</p>
                    </div>
                    <div class="flags-widget">
                        <h3>Flags Raised:</h3>
                        ${flagsList}
                    </div>
                </div>
            `;
        }
        const resultContainer = document.getElementById("result-container");
        resultContainer.innerHTML = content;
        
        if (!result.error) {
            animateScore(result.score);
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
});
