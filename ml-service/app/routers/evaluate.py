"""
Endpoint evaluasi akurasi model Prophet menggunakan walk-forward validation.

Cara kerja:
  - Terima seluruh data historis per menu
  - Pisahkan menjadi train set (80%) dan test set (20% terakhir)
  - Latih Prophet pada train set
  - Prediksi tanggal-tanggal di test set
  - Hitung metrik: MAE, RMSE, MAPE, Akurasi
  - Return hasil per menu + rata-rata keseluruhan
"""

import logging
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
import pandas as pd
import numpy as np
import os

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/evaluate", tags=["Evaluasi Model"])

INTERNAL_API_KEY = os.getenv("INTERNAL_API_KEY", "")


# ── Schemas ───────────────────────────────────────────────────────────────────

class HistoryItem(BaseModel):
    date: str
    actualProduction: float
    actualSales: float
    wasteAmount: float


class MenuEvalRequest(BaseModel):
    menuId: str
    menuName: str
    history: list[HistoryItem]


class EvaluateRequest(BaseModel):
    menus: list[MenuEvalRequest]
    testDays: int = 7  # berapa hari terakhir dijadikan test set


class MenuMetrics(BaseModel):
    menuId: str
    menuName: str
    trainDays: int
    testDays: int
    mae: float           # Mean Absolute Error (dalam satuan porsi)
    rmse: float          # Root Mean Square Error
    mape: float          # Mean Absolute Percentage Error (%)
    accuracy: float      # 100 - MAPE (%)
    method: str          # prophet / moving_average / insufficient_data
    predictions: list[dict]  # detail prediksi vs aktual per hari


class EvaluateResponse(BaseModel):
    totalMenus: int
    evaluatedMenus: int   # menu yang berhasil dievaluasi
    avgMae: float
    avgRmse: float
    avgMape: float
    avgAccuracy: float
    menus: list[MenuMetrics]


# ── Helpers ───────────────────────────────────────────────────────────────────

def _verify_key(x_api_key: Optional[str]) -> None:
    if INTERNAL_API_KEY and x_api_key != INTERNAL_API_KEY:
        raise HTTPException(status_code=403, detail="Akses ditolak.")


def _calc_metrics(actuals: list[float], predictions: list[float]) -> dict:
    """Hitung MAE, RMSE, MAPE dari list aktual dan prediksi."""
    n = len(actuals)
    if n == 0:
        return {"mae": 0, "rmse": 0, "mape": 0, "accuracy": 0}

    actuals_arr = np.array(actuals)
    preds_arr   = np.array(predictions)
    errors      = actuals_arr - preds_arr
    abs_errors  = np.abs(errors)

    mae  = float(np.mean(abs_errors))
    rmse = float(np.sqrt(np.mean(errors ** 2)))

    # MAPE — hindari division by zero
    nonzero_mask = actuals_arr != 0
    if nonzero_mask.any():
        mape = float(np.mean(
            abs_errors[nonzero_mask] / actuals_arr[nonzero_mask] * 100
        ))
    else:
        mape = 0.0

    accuracy = max(0.0, 100.0 - mape)

    return {
        "mae":      round(mae, 2),
        "rmse":     round(rmse, 2),
        "mape":     round(mape, 2),
        "accuracy": round(accuracy, 2),
    }


def _evaluate_menu(
    menu_id: str,
    menu_name: str,
    history: list[dict],
    test_days: int,
) -> MenuMetrics:
    """Walk-forward validation untuk satu menu.
    
    Menggunakan actualSales sebagai target (y), konsisten dengan forecaster.py.
    Prediksi = estimasi demand riil, bukan keputusan produksi.
    """

    df = pd.DataFrame(history)
    df["ds"] = pd.to_datetime(df["date"])
    df["y"]  = df["actualSales"].astype(float)   # ← actualSales, bukan actualProduction
    df = df.sort_values("ds").drop_duplicates("ds").reset_index(drop=True)

    n = len(df)

    # Butuh minimal test_days + 1 hari data untuk evaluasi
    if n <= test_days:
        return MenuMetrics(
            menuId=menu_id,
            menuName=menu_name,
            trainDays=0,
            testDays=0,
            mae=0, rmse=0, mape=0, accuracy=0,
            method="insufficient_data",
            predictions=[],
        )

    train_df = df.iloc[:-test_days]
    test_df  = df.iloc[-test_days:]
    train_n  = len(train_df)

    predictions_detail = []
    predicted_vals     = []
    actual_vals        = []

    method = "moving_average"

    if train_n >= 14:
        # Gunakan Prophet
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

            future   = pd.DataFrame({"ds": test_df["ds"].values})
            forecast = model.predict(future)
            method   = "prophet"

            for i, row in test_df.iterrows():
                idx        = test_df.index.get_loc(i)
                pred_val   = max(0.0, float(forecast["yhat"].iloc[idx]))
                actual_val = float(row["y"])

                predicted_vals.append(pred_val)
                actual_vals.append(actual_val)

                error     = abs(pred_val - actual_val)
                error_pct = (error / actual_val * 100) if actual_val > 0 else 0

                predictions_detail.append({
                    "date":       row["ds"].strftime("%Y-%m-%d"),
                    "actual":     round(actual_val, 1),
                    "predicted":  round(pred_val, 1),
                    "error":      round(error, 1),
                    "errorPct":   round(error_pct, 1),
                })

        except Exception as e:
            logger.warning(f"Prophet gagal untuk {menu_id}: {e}, fallback ke MA")
            method = "moving_average"

    if method == "moving_average":
        # Walk-forward dengan weighted moving average
        for i, row in test_df.iterrows():
            idx      = test_df.index.get_loc(i)
            # Gunakan semua train data + test yang sudah lewat
            available = pd.concat([train_df, test_df.iloc[:idx]])
            vals      = available["y"].values
            weights   = np.exp(np.linspace(0, 1, len(vals)))
            weights  /= weights.sum()
            pred_val  = float(np.dot(weights, vals))
            pred_val  = max(0.0, pred_val)

            actual_val = float(row["y"])
            predicted_vals.append(pred_val)
            actual_vals.append(actual_val)

            error     = abs(pred_val - actual_val)
            error_pct = (error / actual_val * 100) if actual_val > 0 else 0

            predictions_detail.append({
                "date":      row["ds"].strftime("%Y-%m-%d"),
                "actual":    round(actual_val, 1),
                "predicted": round(pred_val, 1),
                "error":     round(error, 1),
                "errorPct":  round(error_pct, 1),
            })

    metrics = _calc_metrics(actual_vals, predicted_vals)

    return MenuMetrics(
        menuId=menu_id,
        menuName=menu_name,
        trainDays=train_n,
        testDays=len(test_df),
        mae=metrics["mae"],
        rmse=metrics["rmse"],
        mape=metrics["mape"],
        accuracy=metrics["accuracy"],
        method=method,
        predictions=predictions_detail,
    )


# ── Endpoint ──────────────────────────────────────────────────────────────────

@router.post("", response_model=EvaluateResponse)
async def evaluate_model(
    body: EvaluateRequest,
    x_api_key: Optional[str] = Header(None),
):
    """
    Evaluasi akurasi model menggunakan walk-forward validation.

    Memisahkan data historis menjadi train (awal) dan test (akhir),
    melatih model pada train set, memprediksi test set, lalu menghitung
    MAE, RMSE, MAPE, dan Akurasi.

    **Request body:**
    ```json
    {
      "testDays": 7,
      "menus": [
        {
          "menuId": "abc123",
          "menuName": "Nasi Goreng Spesial",
          "history": [
            { "date": "2025-03-01", "actualProduction": 65, "actualSales": 60, "wasteAmount": 5 }
          ]
        }
      ]
    }
    ```

    **Interpretasi hasil:**
    - `accuracy` >= 85%  → Model sangat baik
    - `accuracy` 70–84%  → Model cukup baik untuk operasional
    - `accuracy` 50–69%  → Perlu lebih banyak data historis
    - `accuracy` < 50%   → Data terlalu sedikit atau terlalu acak
    """
    _verify_key(x_api_key)
    logger.info(
        f"Evaluasi model: n_menus={len(body.menus)}, testDays={body.testDays}"
    )

    results = []
    for m in body.menus:
        try:
            result = _evaluate_menu(
                menu_id=m.menuId,
                menu_name=m.menuName,
                history=[h.model_dump() for h in m.history],
                test_days=body.testDays,
            )
            results.append(result)
        except Exception as e:
            logger.error(f"Error evaluasi menu {m.menuId}: {e}")

    evaluated = [r for r in results if r.method != "insufficient_data"]

    if evaluated:
        avg_mae      = round(sum(r.mae      for r in evaluated) / len(evaluated), 2)
        avg_rmse     = round(sum(r.rmse     for r in evaluated) / len(evaluated), 2)
        avg_mape     = round(sum(r.mape     for r in evaluated) / len(evaluated), 2)
        avg_accuracy = round(sum(r.accuracy for r in evaluated) / len(evaluated), 2)
    else:
        avg_mae = avg_rmse = avg_mape = avg_accuracy = 0.0

    return EvaluateResponse(
        totalMenus=len(results),
        evaluatedMenus=len(evaluated),
        avgMae=avg_mae,
        avgRmse=avg_rmse,
        avgMape=avg_mape,
        avgAccuracy=avg_accuracy,
        menus=results,
    )
