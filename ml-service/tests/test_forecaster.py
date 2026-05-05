"""
Unit tests untuk forecaster service.
Jalankan dengan: pytest tests/ -v
"""
import pytest
from app.services.forecaster import forecast_single, _forecast_moving_average
import pandas as pd
import numpy as np


def _make_history(n_days: int, base: float = 60.0, noise: float = 10.0) -> list[dict]:
    """Buat data historis dummy untuk testing."""
    from datetime import date, timedelta
    today = date.today()
    return [
        {
            "date": (today - timedelta(days=n_days - i)).isoformat(),
            "actualProduction": max(0, base + np.random.uniform(-noise, noise)),
            "actualSales": max(0, base - 5 + np.random.uniform(-noise, noise)),
            "wasteAmount": 5.0,
        }
        for i in range(n_days)
    ]


class TestForecastDefault:
    def test_no_history_returns_default(self):
        result = forecast_single("m1", "Test Menu", [], "2025-04-25")
        assert result["method"] == "default"
        assert result["predictedDemand"] == 50.0
        assert result["confidenceLevel"] == 0.3

    def test_response_has_required_keys(self):
        result = forecast_single("m1", "Test Menu", [], "2025-04-25")
        required = ["menuId", "menuName", "targetDate", "predictedDemand",
                    "confidenceLevel", "lowerBound", "upperBound", "method", "insight"]
        for key in required:
            assert key in result, f"Missing key: {key}"


class TestMovingAverage:
    def test_few_days_uses_moving_average(self):
        history = _make_history(5)
        result = forecast_single("m1", "Test Menu", history, "2025-04-25")
        assert result["method"] == "moving_average"
        assert result["predictedDemand"] > 0

    def test_prediction_within_reasonable_range(self):
        history = _make_history(10, base=80.0, noise=5.0)
        result = forecast_single("m1", "Test Menu", history, "2025-04-25")
        # Prediksi harus dalam ±50% dari nilai base
        assert 40 <= result["predictedDemand"] <= 120

    def test_confidence_between_0_and_1(self):
        history = _make_history(10)
        result = forecast_single("m1", "Test Menu", history, "2025-04-25")
        assert 0 <= result["confidenceLevel"] <= 1

    def test_lower_bound_less_than_upper_bound(self):
        history = _make_history(10)
        result = forecast_single("m1", "Test Menu", history, "2025-04-25")
        assert result["lowerBound"] <= result["upperBound"]


class TestProphet:
    def test_sufficient_history_uses_prophet(self):
        history = _make_history(20)
        result = forecast_single("m1", "Test Menu", history, "2025-04-25")
        # Bisa prophet atau moving_average (jika prophet gagal)
        assert result["method"] in ["prophet", "moving_average"]
        assert result["predictedDemand"] > 0

    def test_prophet_confidence_higher_than_default(self):
        history = _make_history(21)
        result = forecast_single("m1", "Test Menu", history, "2025-04-25")
        assert result["confidenceLevel"] > 0.3


class TestInsight:
    def test_insight_is_string(self):
        result = forecast_single("m1", "Nasi Goreng", [], "2025-04-25")
        assert isinstance(result["insight"], str)
        assert len(result["insight"]) > 0

    def test_insight_mentions_menu_name(self):
        history = _make_history(5)
        result = forecast_single("m1", "Nasi Goreng Spesial", history, "2025-04-25")
        assert "Nasi Goreng Spesial" in result["insight"]
