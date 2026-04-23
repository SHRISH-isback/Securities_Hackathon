from . import checks
from .ml_model import AnnouncementClassifier

# Instantiate the classifier once at module load time.
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

# Hype score: max penalty and per-keyword penalty
HYPE_SCORE_MAX_PENALTY = 15
HYPE_SCORE_PER_KEYWORD = 3


def analyze_announcement(text: str, company_name: str, symbol: str) -> dict:
    """
    Analyzes a corporate announcement by running rule-based checks, computing a
    Hype Score from sensationalist keywords, and applying an ML model prediction.
    """
    score = 100
    all_flags = []
    deductions = []

    # 1. Rule-based checks
    for check_function, weight in RULE_WEIGHTS.items():
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

    # 2. Hype Score
    hype_score = checks.compute_hype_score(text)
    if hype_score > 0:
        hype_penalty = min(hype_score * HYPE_SCORE_PER_KEYWORD, HYPE_SCORE_MAX_PENALTY)
        score -= hype_penalty
        flag_text = f"Hype Score {hype_score}: announcement contains {hype_score} sensationalist keyword(s)."
        all_flags.append(flag_text)
        deductions.append({"reason": flag_text, "penalty": hype_penalty, "category": "Hype Score"})

    # 3. ML model prediction
    suspicion_prob = classifier.predict_suspicion(text)
    top_terms = classifier.explain_top_terms(text, top_k=6)

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

    # Ensure score stays in [0, 100]
    score = max(0, min(100, score))

    return {
        "score": score,
        "credibility": credibility,
        "flags": all_flags,
        "hype_score": hype_score,
        "breakdown": {
            "initial_score": 100,
            "deductions": deductions,
        },
        "ml_insights": {
            "suspicion_probability": suspicion_prob,
            "top_terms": top_terms,
        },
    }

