import os
import re
import requests
from dotenv import load_dotenv
from newsapi import NewsApiClient

# Load environment variables from .env file
load_dotenv()

# --- Alpha Vantage for Financial Data ---
ALPHAVANTAGE_API_KEY = os.getenv("ALPHAVANTAGE_API_KEY")
AV_BASE_URL = "https://www.alphavantage.co/query"


def _av_get(params: dict) -> dict | None:
    """Helper: execute an Alpha Vantage request and return parsed JSON or None."""
    if not ALPHAVANTAGE_API_KEY or ALPHAVANTAGE_API_KEY == "YOUR_API_KEY_HERE":
        return None
    try:
        resp = requests.get(AV_BASE_URL, params={**params, "apikey": ALPHAVANTAGE_API_KEY}, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        # Alpha Vantage returns {"Note": "..."} when rate-limited
        if "Note" in data or "Information" in data:
            return None
        return data
    except requests.exceptions.RequestException as e:
        print(f"Alpha Vantage request error: {e}")
        return None
    except Exception as e:
        print(f"Alpha Vantage unexpected error: {e}")
        return None


def fetch_global_quote(symbol: str) -> dict | None:
    """
    Fetches the GLOBAL_QUOTE endpoint for the given ticker.

    Returns a dict with keys like 'price', 'change_percent', etc., or None
    if unavailable.
    """
    data = _av_get({"function": "GLOBAL_QUOTE", "symbol": symbol})
    if not data:
        return None
    quote = data.get("Global Quote", {})
    if not quote:
        return None
    return {
        "price": quote.get("05. price"),
        "change_percent": quote.get("10. change percent"),
        "volume": quote.get("06. volume"),
    }


def fetch_company_overview(symbol: str) -> dict | None:
    """
    Fetches the OVERVIEW endpoint for the given ticker.

    Returns selected fundamentals (EPS, RevenueTTM, ProfitMargin, etc.)
    or None if unavailable.
    """
    data = _av_get({"function": "OVERVIEW", "symbol": symbol})
    if not data or not data.get("Symbol"):
        return None
    return {
        "name": data.get("Name"),
        "eps": data.get("EPS"),
        "revenue_ttm": data.get("RevenueTTM"),
        "profit_margin": data.get("ProfitMargin"),
        "pe_ratio": data.get("PERatio"),
        "52_week_high": data.get("52WeekHigh"),
        "52_week_low": data.get("52WeekLow"),
    }


def get_company_financials(symbol: str) -> dict:
    """
    Returns a merged dict of GLOBAL_QUOTE + OVERVIEW data.
    Falls back to mock data if the API key is absent.
    """
    if not ALPHAVANTAGE_API_KEY or ALPHAVANTAGE_API_KEY == "YOUR_API_KEY_HERE":
        print("Warning: Alpha Vantage API key not set. Using mock data.")
        return {"revenue_growth": "N/A", "profit_margin": "N/A"}

    overview = fetch_company_overview(symbol) or {}
    quote = fetch_global_quote(symbol) or {}
    return {**overview, **quote}


def compare_claims_to_financials(text: str, symbol: str) -> list[str]:
    """
    Compares common announcement claims against actual financial data.

    Returns a list of discrepancy flags (empty if no issues found or no data).
    """
    flags = []
    overview = fetch_company_overview(symbol)
    if not overview:
        return flags

    # --- EPS check: "record profits" vs actual EPS ---
    if re.search(r"\b(record profits?|record earnings?|highest.*profit|best.*earnings?)\b", text, re.IGNORECASE):
        try:
            eps = float(overview.get("eps") or "nan")
            if eps < 0:
                flags.append(
                    f"Announcement claims record profits, but reported EPS is {eps:.2f} (negative)."
                )
        except (ValueError, TypeError):
            pass

    # --- Revenue check: "record revenue" vs RevenueTTM ---
    if re.search(r"\b(record revenue|unprecedented revenue|highest.*revenue)\b", text, re.IGNORECASE):
        try:
            rev = float(overview.get("revenue_ttm") or "nan")
            # Flag if revenue is negligible (< $1 M) while claiming "record"
            if 0 < rev < 1_000_000:
                flags.append(
                    f"Announcement claims record revenue, but trailing twelve-month revenue is only ${rev:,.0f}."
                )
        except (ValueError, TypeError):
            pass

    # --- Profit margin check: "massive profits" ---
    if re.search(r"\b(massive|huge|unprecedented)\s+profits?\b", text, re.IGNORECASE):
        try:
            margin = float(overview.get("profit_margin") or "nan")
            if margin < 0.05:
                flags.append(
                    f"Claims of massive profits are inconsistent with the company's profit margin of {margin:.2%}."
                )
        except (ValueError, TypeError):
            pass

    return flags


# --- News API for Announcement Verification ---
NEWS_API_KEY = os.getenv("NEWS_API_KEY")


def find_news_on_partnership(company_a: str, company_b: str) -> bool:
    """
    Searches for news articles mentioning a partnership between two companies.
    Returns True if a relevant article is found, False otherwise.
    """
    if not NEWS_API_KEY or NEWS_API_KEY == "YOUR_API_KEY_HERE":
        print("Warning: News API key not set. Skipping partnership verification.")
        return False

    try:
        newsapi = NewsApiClient(api_key=NEWS_API_KEY)
        query = f'"{company_a}" AND "{company_b}" AND (partnership OR "joint venture" OR agreement)'
        articles = newsapi.get_everything(q=query, language="en", sort_by="relevancy")
        return articles["totalResults"] > 0
    except Exception as e:
        print(f"Error fetching news from News API: {e}")
        return False

