"""
Fashion recommender: TF-IDF nearest-neighbour search over the fashion dataset.

The earlier RandomForest over ~680 distinct product names could not learn from
~870 rows, and it ignored who the outfit was for (it suggested a sherwani to a
girl). This version scores every dataset row against the request by cosine
similarity of TF-IDF vectors and then applies the gender found in the request.
"""

from __future__ import annotations

import re

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

_BOY = {"boy", "boys", "man", "men", "male", "guy", "gentleman", "husband", "son", "brother", "groom"}
_GIRL = {"girl", "girls", "woman", "women", "female", "lady", "ladies", "wife", "daughter", "sister", "bride"}

# Words people use that the dataset spells differently.
_SYNONYMS = {
    "eid": "ramzan", "ramadan": "ramzan", "dussehra": "dasara", "marriage": "wedding", "shaadi": "wedding",
    "office": "formal", "meeting": "formal", "corporate": "formal", "conference": "formal",
    "gym": "sportswear", "workout": "sportswear", "rakhi": "raksha bandhan", "deepavali": "diwali",
}


def _clean(text: str) -> str:
    text = re.sub(r"[^a-z0-9 ]+", " ", str(text).lower().replace("_", " "))
    return " ".join(_SYNONYMS.get(w, w) for w in text.split())


def _gender_of(text: str) -> str | None:
    words = set(_clean(text).split())
    if words & _GIRL:
        return "girl"
    if words & _BOY:
        return "boy"
    return None


class FashionRecommender:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True)
        self.names: list[str] = []
        self.genders: list[str] = []
        self.matrix = None

    def fit(self, features, names, genders):
        self.names = [str(n) for n in names]
        self.genders = [str(g) for g in genders]
        self.matrix = self.vectorizer.fit_transform([_clean(f) for f in features])
        return self

    def recommend(self, prompt: str, k: int = 3) -> list[str]:
        """Top-k distinct product names for a request, best first."""
        query = self.vectorizer.transform([_clean(prompt)])
        scores = cosine_similarity(query, self.matrix).ravel()
        gender = _gender_of(prompt)
        if gender:
            scores = scores + np.array([0.5 if g == gender else -1.0 for g in self.genders])
        picked: list[str] = []
        for i in np.argsort(-scores):
            if scores[i] <= 0 and picked:
                break
            if self.names[i] not in picked:
                picked.append(self.names[i])
            if len(picked) >= k:
                break
        return picked

    def predict(self, prompts):
        """scikit-learn style: best single suggestion per prompt."""
        return [(self.recommend(p, 1) or [""])[0] for p in prompts]
