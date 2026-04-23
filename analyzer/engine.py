from . import checks
from .ml_model import AnnouncementClassifier
from .data import get_company_financials
import re

# Instantiate the classifier. In a real app, this might be loaded once at startup.
classifier = AnnouncementClassifier()

# Each check function is associated with a weight.
# Higher weights mean a greater impact on the credibility score.
RULE_WEIGHTS = {
    checks.check_sensational_language: 20,
    checks.check_historical_mismatch: 25,
    checks.check_partnership_verification: 20,
    checks.check_pressure_tactics: 10,
    checks.check_lack_of_specifics: 5,
}

# Weight for the ML model's prediction
ML_SUSPICION_WEIGHT = 35
ML_FLAG_THRESHOLD = 0.6  # Probability threshold to raise a flag

# Penalty for a financial mismatch (claims high profits but EPS is negative)
FINANCIAL_MISMATCH_WEIGHT = 30

_HIGH_PROFIT_PATTERN = re.compile(
    r"(high profit|record profit|massive profit|huge profit|profit surge|profit skyrocket|"
    r"strong profit|big profit|enormous profit|enormous gain|record earning|high earning|"
    r"exceptional profit|extraordinary profit)",
    re.IGNORECASE,
)


def _check_financial_mismatch(text, symbol):
    """
    Compares 'high profits' claims in the announcement text against the
    Alpha Vantage EPS value. Returns a list of flags.

    Args:
        text (str): The announcement text to analyze.
        symbol (str): The company's stock ticker symbol used to fetch financials.

    Returns:
        list[str]: A list of flag strings; empty if no mismatch is detected.
    """
    flags = []
    if not _HIGH_PROFIT_PATTERN.search(text):
        return flags

    financials = get_company_financials(symbol)
    if not financials:
        return flags

    eps = financials.get("eps", "N/A")
    if eps in ("N/A", None, ""):
        return flags

    try:
        eps_value = float(eps)
    except (ValueError, TypeError):
        return flags

    if eps_value < 0:
        flags.append(
            f"Financial Mismatch: announcement claims high profits but Alpha Vantage "
            f"reports a negative EPS of {eps_value:.2f}."
        )
    return flags


def analyze_announcement(text, company_name, symbol):
    """
    Analyzes a corporate announcement by running a series of checks and an ML model.
    """
    score = 100
    all_flags = []
    deductions = []

    # 1. Rule-based checks
    for check_function, weight in RULE_WEIGHTS.items():
        # Pass necessary arguments to each check function
        args = {}
        if "company_name" in check_function.__code__.co_varnames:
            args["company_name"] = company_name
        if "symbol" in check_function.__code__.co_varnames:
            args["symbol"] = symbol
        
        flags = check_function(text, **args)
        
        if flags:
            score -= weight
            all_flags.extend(flags)
            for flag in flags:
                deductions.append({"reason": flag, "penalty": weight, "category": "Rule-Based"})

    # 2. Financial mismatch check (Alpha Vantage EPS vs. "high profits" claims)
    mismatch_flags = _check_financial_mismatch(text, symbol)
    if mismatch_flags:
        score -= FINANCIAL_MISMATCH_WEIGHT
        all_flags.extend(mismatch_flags)
        for flag in mismatch_flags:
            deductions.append({"reason": flag, "penalty": FINANCIAL_MISMATCH_WEIGHT, "category": "Financial Mismatch"})

    # 3. ML model prediction
    suspicion_prob = classifier.predict_suspicion(text)
    top_terms = classifier.explain_top_terms(text, top_k=6)
    
    # The score penalty is proportional to the model's suspicion probability
    ml_penalty = int(ML_SUSPICION_WEIGHT * suspicion_prob)
    score -= ml_penalty
    
    if suspicion_prob > ML_FLAG_THRESHOLD:
        flag_text = f"ML model flags content as {int(suspicion_prob * 100)}% suspicious."
        all_flags.append(flag_text)
        deductions.append({"reason": flag_text, "penalty": ml_penalty, "category": "AI Analysis"})

    # Determine credibility level based on the final score
    credibility = "High"
    if score < 50:
        credibility = "Low"
    elif score < 75:
        credibility = "Medium"
    
    # Ensure score doesn't go below zero
    score = max(0, score)

    return {
        "score": score, 
        "credibility": credibility, 
        "flags": all_flags,
        "breakdown": {
            "initial_score": 100,
            "deductions": deductions
        },
        "ml_insights": {
            "suspicion_probability": suspicion_prob,
            "top_terms": top_terms
        }
    }
