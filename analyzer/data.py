import os
import requests
from dotenv import load_dotenv
from newsapi import NewsApiClient

# Load environment variables from .env file
load_dotenv()

# --- Alpha Vantage for Financial Data ---
ALPHAVANTAGE_API_KEY = os.getenv("ALPHAVANTAGE_API_KEY")
AV_BASE_URL = "https://www.alphavantage.co/query"

def get_company_financials(symbol):
    """
    Fetches company overview data from Alpha Vantage.
    In a real-world scenario, you would need to map company names to ticker symbols.
    For this example, we'll assume the 'symbol' is the company's stock ticker.
    """
    if not ALPHAVANTAGE_API_KEY or ALPHAVANTAGE_API_KEY == "YOUR_API_KEY_HERE":
        # Return mock data if API key is not set
        print("Warning: Alpha Vantage API key not set. Using mock data.")
        return {"revenue_growth": "N/A", "profit_margin": "N/A"}

    params = {
        "function": "OVERVIEW",
        "symbol": symbol,
        "apikey": ALPHAVANTAGE_API_KEY
    }
    try:
        response = requests.get(AV_BASE_URL, params=params)
        response.raise_for_status()
        data = response.json()
        
        # Extract relevant metrics
        # Note: Alpha Vantage's free tier may not provide direct revenue growth.
        # We'll use ProfitMargin as an example.
        profit_margin = data.get("ProfitMargin", "N/A")
        
        return {
            "revenue_growth": "N/A", # Placeholder as this metric isn't in OVERVIEW
            "profit_margin": profit_margin
        }
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data from Alpha Vantage: {e}")
        return None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None

# --- News API for Announcement Verification ---
NEWS_API_KEY = os.getenv("NEWS_API_KEY")

def find_news_on_partnership(company_a, company_b):
    """
    Searches for news articles mentioning a partnership between two companies.
    Returns True if a relevant article is found, False otherwise.
    """
    if not NEWS_API_KEY or NEWS_API_KEY == "YOUR_API_KEY_HERE":
        print("Warning: News API key not set. Skipping partnership verification.")
        return False # Cannot verify without a key

    try:
        newsapi = NewsApiClient(api_key=NEWS_API_KEY)
        # Construct a precise query
        query = f'"{company_a}" AND "{company_b}" AND (partnership OR "joint venture" OR agreement)'
        
        articles = newsapi.get_everything(q=query, language='en', sort_by='relevancy')
        
        return articles['totalResults'] > 0
    except Exception as e:
        print(f"Error fetching news from News API: {e}")
        return False
