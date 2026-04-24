import re
from .data import get_company_financials, find_news_on_partnership, compare_claims_to_financials

# Sensationalist keywords used by the Hype Score feature
HYPE_KEYWORDS = [
    "moon", "mooning", "moonshot",
    "guaranteed", "guarantee",
    "unprecedented",
    "skyrocket", "skyrocketing",
    "explosive", "explode",
    "revolutionary", "revolution",
    "groundbreaking",
    "once-in-a-lifetime",
    "will double", "will triple", "10x", "100x",
    "no risk", "risk-free",
    "act now", "limited time", "before it's too late",
    "insider", "secret",
    "massive profits", "huge profits",
]

# Pre-compiled hype keyword patterns (word-boundary anchored, case-insensitive)
_HYPE_PATTERNS = [re.compile(r'\b' + re.escape(kw) + r'\b', re.IGNORECASE) for kw in HYPE_KEYWORDS]

# Pre-compiled sensational keyword patterns
_SENSATIONAL_KEYWORDS = [
    "groundbreaking", "revolutionary", "guaranteed", "will double",
    "explosive growth", "once-in-a-lifetime",
]
_SENSATIONAL_PATTERNS = [
    re.compile(r'\b' + re.escape(kw) + r'\b', re.IGNORECASE) for kw in _SENSATIONAL_KEYWORDS
]

# Pre-compiled pressure-tactic pattern
_PRESSURE_PATTERN = re.compile(
    r"act now|limited time|before it's too late|don't miss out", re.IGNORECASE
)


def compute_hype_score(text: str) -> int:
    """
    Counts how many distinct sensationalist keywords appear in the text.

    Returns an integer >= 0. Higher values indicate more promotional language.
    """
    return sum(1 for pattern in _HYPE_PATTERNS if pattern.search(text))


def check_sensational_language(text: str) -> list[str]:
    """
    Checks for sensationalist keywords in the text.
    Returns a list of flags.
    """
    flags = []
    if any(pattern.search(text) for pattern in _SENSATIONAL_PATTERNS):
        flags.append("Use of sensational or overly promotional language.")
    return flags


def check_historical_mismatch(text: str, company_name: str, symbol: str) -> list[str]:
    """
    Compares claims against historical financial data and real-time fundamentals.
    Returns a list of flags.
    """
    flags = []

    # Alpha Vantage OVERVIEW + GLOBAL_QUOTE based claim comparison
    av_flags = compare_claims_to_financials(text, symbol)
    flags.extend(av_flags)

    # Fallback: basic profit-margin check from get_company_financials
    if not av_flags:
        financials = get_company_financials(symbol)
        if financials and financials.get("profit_margin") not in ["N/A", None]:
            if re.search(r"(massive|huge|unprecedented) profits", text, re.IGNORECASE):
                try:
                    if float(financials["profit_margin"]) < 0.05:
                        flags.append(
                            f"Claims of huge profits are inconsistent with the company's "
                            f"reported profit margin of {float(financials['profit_margin']):.2%}."
                        )
                except (ValueError, TypeError):
                    pass

    return flags


def check_partnership_verification(text: str, company_name: str) -> list[str]:
    """
    Verifies partnership announcements by searching for news articles.
    Returns a list of flags.
    """
    flags = []
    match = re.search(r"partnership with ([\w\s\.]+)", text, re.IGNORECASE)
    if match:
        partner_name = match.group(1).strip().rstrip(".")
        if not find_news_on_partnership(company_name, partner_name):
            flags.append(
                f"No news articles found confirming the partnership between {company_name} and {partner_name}."
            )
    return flags


def check_pressure_tactics(text: str) -> list[str]:
    """
    Looks for language that creates a false sense of urgency.
    Returns a list of flags.
    """
    flags = []
    if _PRESSURE_PATTERN.search(text):
        flags.append("Contains high-pressure language urging immediate action.")
    return flags


def check_lack_of_specifics(text: str) -> list[str]:
    """
    Checks for a lack of concrete data or figures.
    Returns a list of flags.
    """
    flags = []
    if len(re.findall(r'\d', text)) < 2:
        flags.append("Lacks specific data, figures, or metrics.")
    return flags


