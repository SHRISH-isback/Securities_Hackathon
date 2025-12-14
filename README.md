# SkapSec

## Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR-USERNAME/YOUR-REPO)

### One-Click Deployment Steps:

1. Click the "Deploy with Vercel" button above
2. Connect your GitHub account
3. Vercel will automatically detect the configuration
4. Click "Deploy"
5. Your backend API will be live at `https://your-project.vercel.app`

### Manual Deployment to Vercel

**Prerequisites:**
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Vercel CLI: `npm install -g vercel`

**Deploy Backend:**
```bash
# From the project root directory
vercel

# For production deployment
vercel --prod
```

**Environment Variables (Optional):**
Set these in your Vercel project dashboard:
- `FRONTEND_ORIGIN` - Your frontend URL (e.g., `https://your-frontend.vercel.app`)
- Add any API keys if needed (e.g., `ALPHA_VANTAGE_API_KEY`, `NEWS_API_KEY`)

**Deploy Frontend (if using the React frontend):**
```bash
cd frontend
vercel

# For production
vercel --prod
```
Set frontend environment variable:
- `VITE_API_BASE` - Your backend URL (e.g., `https://your-backend.vercel.app`)

## Local Development

- Backend (Flask):
  - Python 3.10+
  - Install deps: `pip install -r requirements.txt`
  - Run: `python app.py` (starts on http://localhost:5000)

- Frontend (React):
  - Node 18+
  - `cd frontend && npm install`
  - Create `.env` (see `.env.example`):
    - `VITE_API_BASE=http://localhost:5000`
  - Run: `npm run dev` (starts on http://localhost:3000)

## Deployment (Vercel)

This repo supports deploying backend and frontend as two Vercel projects.

1) Backend (Flask API)
- Project Root: repository root (contains `vercel.json`)
- Build: handled by `@vercel/python`
- Environment Variables:
  - `FRONTEND_ORIGIN=https://YOUR-REACT-APP.vercel.app`
- Output: `https://YOUR-BACKEND.vercel.app`

2) Frontend (React)
- Project Root: `frontend/`
- `frontend/vercel.json` sets SPA rewrites
- Environment Variables:
  - `VITE_API_BASE=https://YOUR-BACKEND.vercel.app`

### Notes
- CORS: Flask reads `FRONTEND_ORIGIN` to allow the React domain.
- Local dev uses Vite proxy (port 3000 -> 5000) only in dev. In production, React calls the backend using `VITE_API_BASE`.

# SkapSec: AI-Powered Corporate Announcement Analyzer

![SkapSec Banner](https://user-images.githubusercontent.com/80538469/211161334-8b663f69-8d09-4ba8-972b-c03ba01a40a2.png)


**SkapSec** is a web application designed to protect retail investors by providing a real-time credibility analysis of corporate announcements. Aligned with SEBI's Safe Space initiative, this tool leverages a hybrid AI model to flag potentially fraudulent or misleading information, empowering users to make more informed investment decisions.

## Key Features

- **Hybrid Analysis Engine:** Combines rule-based checks with a machine learning model (`scikit-learn`) to provide a nuanced credibility score.
- **Real-Time Data Integration:** Cross-verifies announcement claims against live financial data from **Alpha Vantage** and real-time news sentiment from the **News API**.
- **Comprehensive Scoring:** Generates a weighted credibility score (from 0 to 100) and raises specific flags based on sensational language, financial mismatches, and other red flags.
- **Modern & Interactive UI:** A multi-page web interface built with **Flask**, featuring a vibrant, responsive design, smooth animations, and a clear presentation of analysis results.
- **Investor Protection Focus:** Specifically designed to identify tactics commonly used in market manipulation, such as pressure tactics, vagueness, and unverifiable claims.

## How It Works

1.  **User Input:** The user provides the company name, stock symbol, and the text of the corporate announcement.
2.  **Rule-Based Checks:** The system first runs a series of pre-defined checks:
    -   Scans for sensational or overly promotional language.
    -   Verifies claims (e.g., partnerships) against recent news.
    -   Checks for financial inconsistencies using live market data.
    -   Identifies high-pressure tactics or guarantees of returns.
3.  **Machine Learning Analysis:** The announcement text is then fed into a trained `LogisticRegression` model, which calculates the probability of the text being suspicious based on patterns learned from historical data.
4.  **Credibility Score Calculation:** A final credibility score is computed by deducting points from a starting score of 100. The penalty for each triggered flag is determined by its weight, with the ML model's suspicion probability also contributing to the final score.
5.  **Results Display:** The result is presented in an intuitive dashboard, showing the final score, a credibility level (High, Medium, or Low), and a list of all the specific flags that were raised.

## Technology Stack

- **Backend:** Python, Flask
- **Machine Learning:** Scikit-learn, Pandas
- **Data APIs:**
    -   [Alpha Vantage API](https://www.alphavantage.co/) for financial data.
    -   [News API](https://newsapi.org/) for news sentiment analysis.
- **Frontend:** HTML, CSS, JavaScript
- **Deployment:** (Not yet implemented, but suitable for platforms like Heroku, Vercel, or AWS)

## Setup and Installation

Follow these steps to run the project locally:

**1. Clone the Repository:**
```bash
git clone https://github.com/your-username/SkapSec.git
cd SkapSec
```

**2. Create and Activate a Virtual Environment:**
```bash
# For Linux/macOS
python3 -m venv .venv
source .venv/bin/activate

# For Windows
python -m venv .venv
.venv\Scripts\activate
```

**3. Install Dependencies:**
```bash
pip install -r requirements.txt
```

**4. Set Up Environment Variables:**
Create a `.env` file in the root directory and add your API keys:
```
ALPHA_VANTAGE_API_KEY="YOUR_ALPHA_VANTAGE_KEY"
NEWS_API_KEY="YOUR_NEWS_API_KEY"
```

**5. Run the Application:**
```bash
flask run
```
The application will be available at `http://127.0.0.1:5000`.

## Project Structure
```
/
├── analyzer/             # Core analysis logic
│   ├── __init__.py
│   ├── checks.py         # Rule-based checks
│   ├── data.py           # API data fetching
│   ├── engine.py         # Main analysis engine
│   └── ml_model.py       # ML classifier
├── static/               # CSS and JavaScript files
├── templates/            # HTML templates
│   ├── _includes/        # Reusable partials (header, footer)
│   ├── about.html
│   ├── analyzer.html
│   ├── base.html
│   └── index.html
├── .env                  # API keys (local)
├── app.py                # Flask application routes
├── requirements.txt      # Python dependencies
└── README.md
```

## Disclaimer

The analysis provided by SkapSec is for informational purposes only and should not be considered financial advice. Always conduct your own thorough research before making any investment decisions.