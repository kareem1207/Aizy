import pandas as pd
import pytest

from fashion_recommender import FashionRecommender


@pytest.fixture(scope="module")
def rec():
    df = pd.read_csv("data/fashion.csv").fillna("")
    feats = df["category"] + " " + df["gender"] + " " + df["region"] + " " + df["occasion"]
    return FashionRecommender().fit(feats, df["product_name"], df["gender"]), df


def genders_of(df, names):
    return set(df[df["product_name"].isin(names)]["gender"])


def test_girl_requests_return_girl_outfits(rec):
    model, df = rec
    for prompt in ["girl birthday party", "outfit for a girl at a wedding in Hyderabad", "I am a woman going to a conference"]:
        picks = model.recommend(prompt, 3)
        assert picks, prompt
        assert genders_of(df, picks) == {"girl"}, (prompt, picks)


def test_boy_requests_return_boy_outfits(rec):
    model, df = rec
    for prompt in ["boy for ramzan", "boy, college fest", "I am a man attending a wedding"]:
        picks = model.recommend(prompt, 3)
        assert genders_of(df, picks) == {"boy"}, (prompt, picks)


def test_synonyms_map_to_dataset_occasions(rec):
    model, df = rec
    picks = model.recommend("boy outfit for eid", 5)
    occasions = set(df[df["product_name"].isin(picks) & (df["gender"] == "boy")]["occasion"])
    assert "ramzan" in occasions


def test_results_are_distinct_and_limited(rec):
    model, _ = rec
    picks = model.recommend("girl party", 3)
    assert len(picks) == len(set(picks)) <= 3


def test_predict_is_sklearn_style(rec):
    model, _ = rec
    out = model.predict(["girl birthday party", "boy for ramzan"])
    assert len(out) == 2 and all(isinstance(x, str) and x for x in out)


def test_nonsense_does_not_crash(rec):
    model, _ = rec
    assert isinstance(model.recommend("zzzz qqqq", 3), list)
    assert isinstance(model.recommend("", 3), list)
