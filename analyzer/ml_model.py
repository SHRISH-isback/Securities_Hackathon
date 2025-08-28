from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import pandas as pd

class AnnouncementClassifier:
    """
    A mock ML model to classify announcements.
    
    In a real-world scenario, this class would load a pre-trained, more 
    sophisticated model. For this project, we train a simple model on a
    small, representative dataset to demonstrate the integration of ML.
    """
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.model = LogisticRegression()
        self._train_model()

    def _train_model(self):
        """
        Trains the model on a small, hardcoded dataset.
        
        The data represents examples of "normal" (label 0) and "suspicious" (label 1)
        announcements. The vocabulary is intentionally biased to make the model
        sensitive to keywords often found in fraudulent statements.
        """
        # Sample data: 1 for suspicious, 0 for normal
        training_data = {
            'text': [
                "Company reports record profits and expects strong future growth.",
                "We are pleased to announce a new strategic partnership.",
                "Quarterly earnings are in line with market expectations.",
                "Our new product launch has been a resounding success.",
                "Unprecedented returns guaranteed, this is a once-in-a-lifetime opportunity.",
                "Massive profits expected, stock value to skyrocket, insider information.",
                "Guaranteed high returns with no risk, act now before it's too late.",
                "This secret investment is sure to triple in value, limited slots available."
            ],
            'label': [0, 0, 0, 0, 1, 1, 1, 1]
        }
        df = pd.DataFrame(training_data)
        
        X = self.vectorizer.fit_transform(df['text'])
        y = df['label']
        self.model.fit(X, y)

    def predict_suspicion(self, text: str) -> float:
        """
        Predicts the probability that an announcement is suspicious.

        Args:
            text: The announcement text to analyze.

        Returns:
            A float between 0 and 1, where 1 indicates a high probability
            of being suspicious.
        """
        text_vector = self.vectorizer.transform([text])
        # Predict the probability of the "suspicious" class (label 1)
        probability = self.model.predict_proba(text_vector)[0][1]
        return probability

    def explain_top_terms(self, text: str, top_k: int = 5):
        """
        Returns the top contributing terms for the suspicious class using a
        simple linear model explanation: term_weight * tfidf_value.

        Args:
            text: The announcement text to analyze.
            top_k: Number of top terms to return.

        Returns:
            List of dicts: [{ 'term': str, 'weight': float }]
        """
        text_vector = self.vectorizer.transform([text])
        # For LogisticRegression, coef_[0] corresponds to the positive class weights if binary
        class_index = 1  # suspicious class
        coefs = self.model.coef_[0]
        feature_names = self.vectorizer.get_feature_names_out()

        # Compute contribution per feature: weight * value
        contributions = text_vector.multiply(coefs).toarray()[0]

        # Select top positive contributions
        indexed = [(feature_names[i], contributions[i]) for i in range(len(feature_names)) if contributions[i] > 0]
        indexed.sort(key=lambda x: x[1], reverse=True)
        top = indexed[:top_k]

        # Normalize weights to 0..1 for display
        max_contrib = top[0][1] if top else 1.0
        normalized = [{"term": term, "weight": (contrib / max_contrib) if max_contrib > 0 else 0.0} for term, contrib in top]
        return normalized
