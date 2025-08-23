import re
from .data import get_company_financials, find_news_on_partnership

def check_sensational_language(text):
    """
    Checks for sensationalist keywords in the text.
    Returns a list of flags.
    """
    flags = []
    sensational_keywords = ["groundbreaking", "revolutionary", "guaranteed", "will double", "explosive growth", "once-in-a-lifetime"]
    if any(re.search(r'\b' + keyword + r'\b', text, re.IGNORECASE) for keyword in sensational_keywords):
        flags.append("Use of sensational or overly promotional language.")
    return flags

def check_historical_mismatch(text, company_name, symbol):
    """
    Compares claims against historical financial data fetched from an API.
    Returns a list of flags.
    """
    flags = []
    financials = get_company_financials(symbol)
    
    if financials and financials.get("profit_margin") not in ["N/A", None]:
        # Example check: Compare claims of "massive profits" against actual profit margin
        if re.search(r"(massive|huge|unprecedented) profits", text, re.IGNORECASE):
            try:
                # Check if profit margin is low (e.g., less than 5%)
                if float(financials["profit_margin"]) < 0.05:
                    flags.append(f"Claims of huge profits are inconsistent with the company's reported profit margin of {float(financials['profit_margin']):.2%}.")
            except (ValueError, TypeError):
                # Handle cases where profit_margin is not a valid number
                pass
    return flags

def check_partnership_verification(text, company_name):
    """
    Verifies partnership announcements by searching for news articles.
    Returns a list of flags.
    """
    flags = []
    match = re.search(r"partnership with ([\w\s\.]+)", text, re.IGNORECASE)
    if match:
        partner_name = match.group(1).strip().rstrip('.')
        # Use the new function to search for news
        if not find_news_on_partnership(company_name, partner_name):
            flags.append(f"No news articles found confirming the partnership between {company_name} and {partner_name}.")
    return flags

def check_pressure_tactics(text):
    """
    Looks for language that creates a false sense of urgency.
    Returns a list of flags.
    """
    flags = []
    if re.search(r"act now|limited time|before it's too late|don't miss out", text, re.IGNORECASE):
        flags.append("Contains high-pressure language urging immediate action.")
    return flags

def check_lack_of_specifics(text):
    """
    Checks for a lack of concrete data or figures.
    Returns a list of flags.
    """
    flags = []
    # Penalize if the text has very few numbers
    if len(re.findall(r'\d', text)) < 2:
        flags.append("Lacks specific data, figures, or metrics.")
    return flags
