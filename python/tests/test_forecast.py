import pandas as pd
import pytest

from model import Models


@pytest.fixture(scope="module")
def prepared():
    return Models().create_sales_data_preprocessor("data/products.csv")


def test_monthly_index_has_a_frequency(prepared):
    sales, profit = prepared
    assert sales is not None and profit is not None
    assert sales.index.freq is not None          # ARIMA needs this
    assert sales.index.equals(profit.index)


def test_no_missing_values(prepared):
    sales, _ = prepared
    assert not sales.isna().any().any()


def test_forecast_produces_results():
    result = Models().create_sales_forecasting_model("data/products.csv", 3)
    assert result is not None
    assert result["months_forecasted"] == 3
    assert len(result["sales_forecasts"]) > 50
    assert all(v >= 0 for v in result["sales_forecasts"].values())
    assert result["best_overall_product"] in result["sales_forecasts"]
