"""
Forecasting service untuk WasteWise.

Strategi tiering berdasarkan jumlah data historis:
  ≥ 14 hari  → Prophet (time-series ML, akurat untuk pola musiman)
  7-13 hari  → Moving Average berbobot (lebih stabil dari rata-rata biasa)
  < 7 hari   → Simple average atau nilai default 50
"""

import os
import logging
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Optional

logger = logging.getLogger(__name__)
MIN_HISTORY_DAYS = int(os.getenv("MIN_HISTORY_DAYS", "14"))


# ── Helpers ──────────────────────────────────────────────────────────────────

def _parse_history(history: list[dict]) -> pd.DataFrame:
    """
    Konversi list history ke DataFrame Prophet-ready.

    Target (y) = actualSales, bukan actualProduction.
    Alasan: Model harus belajar dari demand riil (yang laku),
    bukan dari keputusan produksi yang mungkin salah (over/under production).
    """
    df = pd.DataFrame(history)
    df["ds"] = pd.to_datetime(df["date"])
    df["y"] = df["actualSales"].astype(float)
    df = df.sort_values("ds").drop_duplicates("ds")
    return df[["ds", "y", "actualProduction", "actualSales", "wasteAmount"]]


def _generate_insight(
    predicted: float,
    history_df: pd.DataFrame,
    method: str,
    menu_name: str,
    target_date: str,
) -> str:
    """
    Buat narasi singkat dari hasil prediksi untuk ditampilkan di UI Perencanaan.

    Note: y = actualSales (demand riil), bukan actualProduction.
    """
    if history_df.empty:
        return f"Belum ada data historis untuk {menu_name}. Prediksi menggunakan nilai default."

    recent_7 = history_df.tail(7)
    avg_sales = recent_7["y"].mean()  # actualSales = demand riil
    avg_production = recent_7["actualProduction"].mean() if "actualProduction" in recent_7 else avg_sales
    avg_waste  = recent_7["wasteAmount"].mean() if "wasteAmount" in recent_7 else 0

    # Waste percentage terhadap production (bukan terhadap sales/y)
    waste_pct = (avg_waste / avg_production * 100) if avg_production > 0 else 0

    trend = ""
    if len(history_df) >= 7:
        first_half = history_df.head(len(history_df) // 2)["y"].mean()
        second_half = history_df.tail(len(history_df) // 2)["y"].mean()
        if second_half > first_half * 1.1:
            trend = " Tren permintaan cenderung meningkat."
        elif second_half < first_half * 0.9:
            trend = " Tren permintaan cenderung menurun."

    waste_note = ""
    if waste_pct > 20:
        waste_note = f" Rata-rata waste {waste_pct:.0f}% dari produksi — model akan kompensasi."
    elif waste_pct < 5 and avg_production > avg_sales:
        waste_note = " Efisiensi produksi baik — prediksi sudah optimal."

    method_note = "ML Prophet" if method == "prophet" else "rata-rata bergerak"
    return (
        f"Prediksi {menu_name}: {predicted:.0f} porsi menggunakan {method_note} "
        f"berdasarkan {len(history_df)} hari data.{trend}{waste_note}"
    )


# ── Forecasting methods ───────────────────────────────────────────────────────

def _forecast_prophet(df: pd.DataFrame, target_date: str) -> dict:
    """Forecast menggunakan Prophet."""
    try:
        from prophet import Prophet  # import di sini agar tidak crash jika tidak terinstall

        model = Prophet(
            yearly_seasonality=False,
            weekly_seasonality=True,
            daily_seasonality=False,
            changepoint_prior_scale=0.05,
            interval_width=0.8,   
        )
        model.fit(df[["ds", "y"]])

        future = pd.DataFrame({"ds": [pd.to_datetime(target_date)]})
        forecast = model.predict(future)

        predicted   = max(0.0, float(forecast["yhat"].iloc[0]))
        lower_bound = max(0.0, float(forecast["yhat_lower"].iloc[0]))
        upper_bound = max(0.0, float(forecast["yhat_upper"].iloc[0]))

        # Confidence: lebih tinggi jika interval sempit relatif terhadap prediksi
        if predicted > 0:
            interval_ratio = (upper_bound - lower_bound) / predicted
            confidence = max(0.5, min(0.99, 1 - interval_ratio * 0.3))
        else:
            confidence = 0.5

        return {
            "predicted": round(predicted, 1),
            "lower_bound": round(lower_bound, 1),
            "upper_bound": round(upper_bound, 1),
            "confidence": round(confidence, 3),
            "method": "prophet",
        }
    except Exception as e:
        logger.warning(f"Prophet gagal, fallback ke moving average: {e}")
        return _forecast_moving_average(df)


def _forecast_moving_average(df: pd.DataFrame) -> dict:
    """
    Weighted Moving Average — bobot lebih besar pada data terbaru.
    Digunakan saat data < MIN_HISTORY_DAYS atau Prophet gagal.
    """
    values = df["y"].values
    n = len(values)

    # Bobot eksponensial: data terbaru = bobot tertinggi
    weights = np.exp(np.linspace(0, 1, n))
    weights /= weights.sum()
    predicted = float(np.dot(weights, values))

    # Confidence berdasarkan konsistensi data (inverse of coefficient of variation)
    std = float(df["y"].std()) if n > 1 else 0
    cv  = std / predicted if predicted > 0 else 1
    confidence = max(0.4, min(0.85, 1 - cv * 0.5))

    # Interval sederhana: ±1 std
    return {
        "predicted": round(max(0, predicted), 1),
        "lower_bound": round(max(0, predicted - std), 1),
        "upper_bound": round(predicted + std, 1),
        "confidence": round(confidence, 3),
        "method": "moving_average",
    }


def _forecast_default() -> dict:
    """Fallback terakhir jika tidak ada data sama sekali."""
    return {
        "predicted": 50.0,
        "lower_bound": 30.0,
        "upper_bound": 70.0,
        "confidence": 0.3,
        "method": "default",
    }


# ── Public API ────────────────────────────────────────────────────────────────

def forecast_single(
    menu_id: str,
    menu_name: str,
    history: list[dict],
    target_date: str,
) -> dict:
    """
    Forecast untuk satu menu.

    Model belajar dari actualSales (demand riil), bukan actualProduction,
    agar prediksi tidak terkontaminasi oleh kebiasaan over/under production.

    Mengembalikan dict dengan keys:
      menuId, menuName, targetDate, predictedDemand,
      confidenceLevel, lowerBound, upperBound, method, insight
    """
    df = _parse_history(history) if history else pd.DataFrame()
    n  = len(df)

    if n >= MIN_HISTORY_DAYS:
        result = _forecast_prophet(df, target_date)
    elif n >= 7:
        result = _forecast_moving_average(df)
    elif n > 0:
        result = _forecast_moving_average(df)
    else:
        result = _forecast_default()

    insight = _generate_insight(result["predicted"], df, result["method"], menu_name, target_date)

    return {
        "menuId":          menu_id,
        "menuName":        menu_name,
        "targetDate":      target_date,
        "predictedDemand": result["predicted"],
        "confidenceLevel": result["confidence"],
        "lowerBound":      result["lower_bound"],
        "upperBound":      result["upper_bound"],
        "method":          result["method"],
        "insight":         insight,
    }


def forecast_bulk(menus: list[dict], target_date: str) -> list[dict]:
    """Forecast untuk banyak menu sekaligus."""
    results = []
    for m in menus:
        try:
            r = forecast_single(
                menu_id=m["menuId"],
                menu_name=m["menuName"],
                history=m.get("history", []),
                target_date=target_date,
            )
            results.append(r)
        except Exception as e:
            logger.error(f"Error forecasting menu {m.get('menuId')}: {e}")
            results.append({
                "menuId":          m["menuId"],
                "menuName":        m.get("menuName", ""),
                "targetDate":      target_date,
                "predictedDemand": 50.0,
                "confidenceLevel": 0.3,
                "lowerBound":      30.0,
                "upperBound":      70.0,
                "method":          "default",
                "insight":         "Terjadi error saat memproses prediksi untuk menu ini.",
            })
    return results


# ── Accuracy Evaluation ───────────────────────────────────────────────────────

def calculate_accuracy_metrics(
    actual_values: list[float],
    predicted_values: list[float],
) -> dict:
    """
    Hitung berbagai metrik akurasi forecasting.

    Args:
        actual_values: List nilai aktual (actualSales/demand riil)
        predicted_values: List nilai prediksi

    Returns:
        Dict dengan metrik: MAPE, MAE, RMSE, WAPE, Accuracy (%)
    """
    import numpy as np

    actual = np.array(actual_values)
    predicted = np.array(predicted_values)

    # Filter data yang valid (actual > 0)
    mask = actual > 0
    actual_valid = actual[mask]
    predicted_valid = predicted[mask]

    if len(actual_valid) == 0:
        return {
            "mape": None,
            "mae": None,
            "rmse": None,
            "wape": None,
            "accuracy_percent": None,
            "n_samples": len(actual_values),
        }

    # MAPE (Mean Absolute Percentage Error)
    ape = np.abs((actual_valid - predicted_valid) / actual_valid)
    mape = np.mean(ape) * 100

    # MAE (Mean Absolute Error)
    mae = np.mean(np.abs(actual_valid - predicted_valid))

    # RMSE (Root Mean Square Error)
    rmse = np.sqrt(np.mean((actual_valid - predicted_valid) ** 2))

    # WAPE (Weighted Absolute Percentage Error)
    wape = np.sum(np.abs(actual_valid - predicted_valid)) / np.sum(actual_valid) * 100

    # Accuracy (100% - MAPE, capped at 0-100)
    accuracy = max(0, 100 - mape)

    return {
        "mape": round(mape, 2),
        "mae": round(mae, 2),
        "rmse": round(rmse, 2),
        "wape": round(wape, 2),
        "accuracy_percent": round(accuracy, 2),
        "n_samples": len(actual_values),
    }


def backtest_forecast(
    history: list[dict],
    horizon: int = 7,
    menu_name: str = "Menu",
) -> dict:
    """
    Backtest: simulasi forecast di masa lalu untuk evaluasi akurasi.

    Cara kerja:
    1. Split data: train (80%) vs test (20%)
    2. Train model dengan data train
    3. Prediksi untuk periode test
    4. Bandingkan prediksi vs aktual

    Args:
        history: List DailyRecordInput
        horizon: Jumlah hari untuk diprediksi
        menu_name: Nama menu untuk logging

    Returns:
        Dict dengan hasil backtest: metrics, predictions, actuals
    """
    df = _parse_history(history) if history else pd.DataFrame()

    if len(df) < 14:
        return {
            "error": f"Data tidak cukup ({len(df)} hari). Minimal 14 hari untuk backtest.",
            "metrics": None,
        }

    # Split data: 80% train, 20% test
    split_idx = int(len(df) * 0.8)
    train_df = df.iloc[:split_idx].copy()
    test_df = df.iloc[split_idx:split_idx + horizon].copy()

    if len(test_df) == 0:
        return {
            "error": "Data test tidak cukup untuk backtest.",
            "metrics": None,
        }

    # Train model
    try:
        from prophet import Prophet

        model = Prophet(
            yearly_seasonality=False,
            weekly_seasonality=True,
            daily_seasonality=False,
            changepoint_prior_scale=0.05,
            interval_width=0.8,
        )
        model.fit(train_df[["ds", "y"]])

        # Predict untuk periode test
        future = test_df[["ds"]].copy()
        forecast = model.predict(future)

        predicted_values = forecast["yhat"].values
        actual_values = test_df["y"].values

        # Hitung metrics
        metrics = calculate_accuracy_metrics(
            actual_values.tolist(),
            predicted_values.tolist(),
        )

        logger.info(
            f"Backtest {menu_name}: MAPE={metrics.get('mape', 'N/A')}%, "
            f"Accuracy={metrics.get('accuracy_percent', 'N/A')}%"
        )

        return {
            "metrics": metrics,
            "predictions": predicted_values.tolist(),
            "actuals": actual_values.tolist(),
            "dates": test_df["ds"].dt.strftime("%Y-%m-%d").tolist(),
            "train_size": len(train_df),
            "test_size": len(test_df),
        }

    except Exception as e:
        logger.error(f"Backtest gagal untuk {menu_name}: {e}")
        return {
            "error": str(e),
            "metrics": None,
        }
