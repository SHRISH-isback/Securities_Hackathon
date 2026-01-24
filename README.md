# InsightGuard

## AI-Powered Corporate Announcement Analyzer

> Your first line of defense against securities fraud

## 📋 Overview

**InsightGuard** is a web application designed to protect retail investors by providing real-time credibility analysis of corporate announcements. Aligned with SEBI's Safe Space initiative, this tool leverages a hybrid AI model to flag potentially fraudulent or misleading information, empowering users to make more informed investment decisions.

## ✨ Key Features

- **🤖 Hybrid Analysis Engine:** Combines rule-based checks with a machine learning model (scikit-learn) to provide nuanced credibility scoring
- **📊 Real-Time Data Integration:** Cross-verifies announcement claims against live financial data from Alpha Vantage and real-time news sentiment from News API
- **🎯 Comprehensive Scoring:** Generates weighted credibility scores (0-100) and raises specific flags based on sensational language, financial mismatches, and red flags
- **🎨 Modern Interactive UI:** Multi-page web interface with vibrant, responsive design and smooth animations
- **🛡️ Investor Protection Focus:** Specifically designed to identify market manipulation tactics like pressure tactics, vagueness, and unverifiable claims

## 🔍 How It Works

1. **User Input:** Provide company name, stock symbol, and announcement text
2. **Rule-Based Checks:** 
   - Scans for sensational or overly promotional language
   - Verifies claims against recent news
   - Checks for financial inconsistencies using live market data
   - Identifies high-pressure tactics or guaranteed returns
3. **Machine Learning Analysis:** Text is analyzed by a trained LogisticRegression model for suspicious patterns
4. **Credibility Score:** Final score calculated by deducting points from 100 based on triggered flags
5. **Results Display:** Intuitive dashboard showing score, credibility level, and specific flags

## 🛠️ Technology Stack

- **Backend:** Python, Flask, Flask-CORS
- **Machine Learning:** Scikit-learn, Pandas
- **Frontend:** React, TypeScript, Vite
- **Data APIs:**
  - [Alpha Vantage API](https://www.alphavantage.co/) - Financial data
  - [News API](https://newsapi.org/) - News sentiment analysis

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- API keys for Alpha Vantage and News API

### Installation

**1. Clone the Repository**
```bash
git clone https://github.com/your-username/InsightGuard.git
cd InsightGuard
```

**2. Backend Setup**
```bash
# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

**3. Environment Configuration**

Create a `.env` file in the root directory:
```env
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
NEWS_API_KEY=your_news_api_key
FRONTEND_ORIGIN=http://localhost:3000
```

**4. Frontend Setup**
```bash
cd frontend
npm install

# Create frontend/.env file
echo "VITE_API_BASE=http://localhost:5000" > .env
```

### Running the Application

**Terminal 1 - Backend:**
```bash
# From project root
python app.py
# Server starts at http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Application opens at http://localhost:3000
```

## 📁 Project Structure

```
InsightGuard/
├── analyzer/              # Core analysis logic
│   ├── checks.py         # Rule-based validation checks
│   ├── data.py           # API data fetching utilities
│   ├── engine.py         # Main analysis orchestration
│   └── ml_model.py       # Machine learning classifier
├── api/                  # Serverless API entry point
│   └── index.py
├── frontend/             # React application
│   ├── src/
│   │   ├── main.tsx
│   │   └── ui/
│   │       ├── App.tsx
│   │       ├── styles.css
│   │       └── pages/
│   │           ├── Home.tsx
│   │           ├── Analyzer.tsx
│   │           ├── Compare.tsx
│   │           └── About.tsx
│   ├── package.json
│   └── vite.config.js
├── static/               # Legacy static assets
├── templates/            # Flask HTML templates
├── app.py               # Flask application entry point
├── requirements.txt     # Python dependencies
└── README.md
```

## 🎯 Usage Example

1. Navigate to the Analyzer page
2. Enter company details:
   - **Company Name:** Acme Corp
   - **Stock Symbol:** ACME
   - **Announcement:** "We are pleased to announce a new strategic partnership..."
3. Click "Analyze"
4. Review the credibility score and detailed analysis

### Sample Scenarios

**Legitimate Announcement:**
> "We are pleased to announce a new strategic partnership with Globex Inc. Quarterly earnings in line with expectations."

**Suspicious Announcement:**
> "Unprecedented returns guaranteed! Act now for insider opportunity to skyrocket your wealth with no risk."

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## ⚠️ Disclaimer

The analysis provided by InsightGuard is for informational purposes only and should not be considered financial advice. Always conduct your own thorough research and consult with qualified financial advisors before making any investment decisions.

## 📄 License

This project is licensed under the terms specified in the LICENSE file.

---

**Built with ❤️ for SEBI's Safe Space Initiative**
