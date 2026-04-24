from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
import numpy as np
import pandas as pd


class AnnouncementClassifier:
    """
    ML model to classify corporate announcements as normal or suspicious.

    Uses a sklearn Pipeline with a TfidfVectorizer (capturing uni-, bi-, and
    tri-grams to catch multi-word "hype" phrases) and a balanced Logistic
    Regression to handle the fraud-class imbalance.
    """

    def __init__(self):
        self.pipeline = Pipeline([
            ("tfidf", TfidfVectorizer(
                stop_words="english",
                ngram_range=(1, 3),
                max_features=5000,
                sublinear_tf=True,
            )),
            ("clf", LogisticRegression(
                class_weight="balanced",
                max_iter=1000,
                solver="lbfgs",
                random_state=42,
            )),
        ])
        self._train_model()

    def _train_model(self):
        """
        Trains the pipeline on a small, representative dataset.

        Label 0 = normal / legitimate announcement.
        Label 1 = suspicious / potentially fraudulent.
        """
        training_data = {
            "text": [
                # Normal (0)
                "Company reports record profits and expects strong future growth.",
                "We are pleased to announce a new strategic partnership.",
                "Quarterly earnings are in line with market expectations.",
                "Our new product launch has been a resounding success.",
                "Revenue for Q3 rose 8 percent year-over-year, driven by strong demand.",
                "The board has approved a share buyback programme of up to 500 million.",
                "Operating margins improved by 2 percentage points to 18 percent.",
                "We have signed a definitive agreement to acquire the target company.",
                # Suspicious (1)
                "Unprecedented returns guaranteed, this is a once-in-a-lifetime opportunity.",
                "Massive profits expected, stock value to skyrocket, insider information.",
                "Guaranteed high returns with no risk, act now before it's too late.",
                "This secret investment is sure to triple in value, limited slots available.",
                "Moon bound rocket ship, explosive growth guaranteed for early investors.",
                "Don't miss out on this explosive opportunity, buy before it's too late.",
                "Insiders confirm this stock will 10x, act now for guaranteed moon profits.",
                "Revolutionary breakthrough will skyrocket the stock to unprecedented highs.",
            ],
            "label": [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
        }
        df = pd.DataFrame(training_data)
        self.pipeline.fit(df["text"], df["label"])

    def predict_suspicion(self, text: str) -> float:
        """
        Returns the probability (0–1) that an announcement is suspicious.
        """
        return float(self.pipeline.predict_proba([text])[0][1])

    def explain_top_terms(self, text: str, top_k: int = 5):
        """
        Returns the top contributing n-gram terms for the suspicious class.

        Returns:
            List of dicts: [{ 'term': str, 'weight': float }]  (weight normalised 0–1)
        """
        vectorizer: TfidfVectorizer = self.pipeline.named_steps["tfidf"]
        clf: LogisticRegression = self.pipeline.named_steps["clf"]

        text_vector = vectorizer.transform([text])
        coefs = clf.coef_[0]
        feature_names = vectorizer.get_feature_names_out()

        contributions = text_vector.multiply(coefs).toarray()[0]
        indexed = [
            (feature_names[i], contributions[i])
            for i in range(len(feature_names))
            if contributions[i] > 0
        ]
        indexed.sort(key=lambda x: x[1], reverse=True)
        top = indexed[:top_k]

        max_contrib = top[0][1] if top else 1.0
        return [
            {"term": term, "weight": float(contrib / max_contrib) if max_contrib > 0 else 0.0}
            for term, contrib in top
        ]

