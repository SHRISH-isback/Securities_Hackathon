from . import checks
from .ml_model import AnnouncementClassifier

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
ML_FLAG_THRESHOLD = 0.6 # Probability threshold to raise a flag

def analyze_announcement(text, company_name, symbol):
    """
    Analyzes a corporate announcement by running a series of checks and an ML model.
    """
    score = 100
    all_flags = []

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

    # 2. ML model prediction
    suspicion_prob = classifier.predict_suspicion(text)
    
    # The score penalty is proportional to the model's suspicion probability
    score -= int(ML_SUSPICION_WEIGHT * suspicion_prob)
    
    if suspicion_prob > ML_FLAG_THRESHOLD:
        all_flags.append(f"ML model flags content as {int(suspicion_prob * 100)}% suspicious.")

    # Determine credibility level based on the final score
    credibility = "High"
    if score < 50:
        credibility = "Low"
    elif score < 75:
        credibility = "Medium"
    
    # Ensure score doesn't go below zero
    score = max(0, score)

    return {"score": score, "credibility": credibility, "flags": all_flags}
