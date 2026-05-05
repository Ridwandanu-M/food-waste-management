from pydantic import BaseModel
from typing import Optional
from datetime import date


class DailyRecordInput(BaseModel):
    """Satu baris data historis produksi harian per menu."""
    date: str          # format ISO: "2025-04-01"
    actualProduction: float
    actualSales: float
    wasteAmount: float


class PredictRequest(BaseModel):
    """
    Request body untuk endpoint /predict.
    Dikirim oleh backend Express untuk satu menu.
    """
    menuId: str
    menuName: str
    targetDate: str    # format ISO: "2025-04-25" — tanggal yang ingin diprediksi
    history: list[DailyRecordInput]


class PredictResponse(BaseModel):
    """Response untuk satu menu."""
    menuId: str
    menuName: str
    targetDate: str
    predictedDemand: float
    confidenceLevel: float   # 0.0 – 1.0
    lowerBound: float        # batas bawah interval kepercayaan
    upperBound: float        # batas atas interval kepercayaan
    method: str              # "prophet" | "moving_average" | "default"
    insight: Optional[str]   # narasi singkat untuk ditampilkan di UI


class BulkPredictRequest(BaseModel):
    """Request bulk untuk semua menu sekaligus."""
    menus: list[PredictRequest]
    targetDate: str


class BulkPredictResponse(BaseModel):
    """Response bulk."""
    targetDate: str
    predictions: list[PredictResponse]


class BacktestRequest(BaseModel):
    """Request untuk backtest/evaluasi akurasi forecast."""
    menuId: str
    menuName: str
    history: list[DailyRecordInput]
    horizon: int = 7  # Jumlah hari untuk di-test


class BacktestResponse(BaseModel):
    """Response backtest dengan metrik akurasi."""
    menuId: str
    menuName: str
    mape: Optional[float]  # Mean Absolute Percentage Error (%)
    mae: Optional[float]   # Mean Absolute Error (unit)
    rmse: Optional[float]  # Root Mean Square Error (unit)
    wape: Optional[float]  # Weighted Absolute Percentage Error (%)
    accuracy_percent: Optional[float]  # 100 - MAPE
    n_samples: int
    train_size: Optional[int]
    test_size: Optional[int]
    error: Optional[str] = None
