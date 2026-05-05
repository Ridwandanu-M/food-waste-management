import os
import logging
from fastapi import APIRouter, HTTPException, Header
from typing import Optional

from app.models.schemas import (
    PredictRequest, PredictResponse,
    BulkPredictRequest, BulkPredictResponse,
    BacktestRequest, BacktestResponse,
)
from app.services.forecaster import (
    forecast_single, forecast_bulk,
    calculate_accuracy_metrics, backtest_forecast,
)

# Import types untuk backtest
from typing import Optional

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/predict", tags=["Forecasting"])

INTERNAL_API_KEY = os.getenv("INTERNAL_API_KEY", "")


def _verify_key(x_api_key: Optional[str]) -> None:
    """Validasi internal API key agar hanya backend Express yang bisa memanggil."""
    if INTERNAL_API_KEY and x_api_key != INTERNAL_API_KEY:
        raise HTTPException(status_code=403, detail="Akses ditolak.")


# ── Single menu ───────────────────────────────────────────────────────────────
@router.post("/single", response_model=PredictResponse)
async def predict_single(
    body: PredictRequest,
    x_api_key: Optional[str] = Header(None),
):
    """
    Prediksi permintaan untuk satu menu.

    **Request body:**
    ```json
    {
      "menuId": "abc123",
      "menuName": "Nasi Goreng Spesial",
      "targetDate": "2025-04-25",
      "history": [
        { "date": "2025-04-18", "actualProduction": 65, "actualSales": 60, "wasteAmount": 5 },
        ...
      ]
    }
    ```
    """
    _verify_key(x_api_key)
    logger.info(f"Predict single: menu={body.menuId}, target={body.targetDate}, n_history={len(body.history)}")

    result = forecast_single(
        menu_id=body.menuId,
        menu_name=body.menuName,
        history=[r.model_dump() for r in body.history],
        target_date=body.targetDate,
    )
    return PredictResponse(**result)


# ── Bulk (semua menu sekaligus) ───────────────────────────────────────────────
@router.post("/bulk", response_model=BulkPredictResponse)
async def predict_bulk(
    body: BulkPredictRequest,
    x_api_key: Optional[str] = Header(None),
):
    """
    Prediksi permintaan untuk semua menu sekaligus.
    Ini adalah endpoint utama yang dipanggil backend Express
    saat Manager membuka halaman Perencanaan.

    **Request body:**
    ```json
    {
      "targetDate": "2025-04-25",
      "menus": [
        {
          "menuId": "abc123",
          "menuName": "Nasi Goreng Spesial",
          "targetDate": "2025-04-25",
          "history": [...]
        }
      ]
    }
    ```
    """
    _verify_key(x_api_key)
    logger.info(f"Predict bulk: n_menus={len(body.menus)}, target={body.targetDate}")

    results = forecast_bulk(
        menus=[
            {
                "menuId":   m.menuId,
                "menuName": m.menuName,
                "history":  [r.model_dump() for r in m.history],
            }
            for m in body.menus
        ],
        target_date=body.targetDate,
    )
    return BulkPredictResponse(
        targetDate=body.targetDate,
        predictions=[PredictResponse(**r) for r in results],
    )


# ── Backtest / Accuracy Evaluation ───────────────────────────────────────────
@router.post("/backtest", response_model=BacktestResponse)
async def backtest(
    body: BacktestRequest,
    x_api_key: Optional[str] = Header(None),
):
    """
    Evaluasi akurasi model Prophet dengan backtest.

    Cara kerja:
    1. Split data: 80% train, 20% test
    2. Train model Prophet dengan data train
    3. Prediksi untuk periode test
    4. Hitung metrik akurasi (MAPE, MAE, RMSE, WAPE)

    **Request body:**
    ```json
    {
      "menuId": "abc123",
      "menuName": "Nasi Goreng",
      "history": [
        {"date": "2026-04-01", "actualProduction": 65, "actualSales": 60, "wasteAmount": 5},
        ... (minimal 14 hari)
      ],
      "horizon": 7
    }
    ```
    """
    _verify_key(x_api_key)
    logger.info(f"Backtest: menu={body.menuId}, horizon={body.horizon}, n_history={len(body.history)}")

    result = backtest_forecast(
        history=[r.model_dump() for r in body.history],
        horizon=body.horizon,
        menu_name=body.menuName,
    )

    if result.get("error"):
        return BacktestResponse(
            menuId=body.menuId,
            menuName=body.menuName,
            mape=None,
            mae=None,
            rmse=None,
            wape=None,
            accuracy_percent=None,
            n_samples=0,
            train_size=None,
            test_size=None,
            error=result["error"],
        )

    metrics = result.get("metrics", {})
    return BacktestResponse(
        menuId=body.menuId,
        menuName=body.menuName,
        mape=metrics.get("mape"),
        mae=metrics.get("mae"),
        rmse=metrics.get("rmse"),
        wape=metrics.get("wape"),
        accuracy_percent=metrics.get("accuracy_percent"),
        n_samples=metrics.get("n_samples", 0),
        train_size=result.get("train_size"),
        test_size=result.get("test_size"),
        error=None,
    )
