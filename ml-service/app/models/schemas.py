from pydantic import BaseModel
from typing import Optional
from datetime import date


class DailyRecordInput(BaseModel):
    date: str
    actualProduction: float
    actualSales: float
    wasteAmount: float


class PredictRequest(BaseModel):
    menuId: str
    menuName: str
    targetDate: str
    history: list[DailyRecordInput]


class PredictResponse(BaseModel):
    menuId: str
    menuName: str
    targetDate: str
    predictedDemand: float
    confidenceLevel: float
    lowerBound: float 
    upperBound: float 
    method: str    
    insight: Optional[str]


class BulkPredictRequest(BaseModel):
    menus: list[PredictRequest]
    targetDate: str


class BulkPredictResponse(BaseModel):
    targetDate: str
    predictions: list[PredictResponse]


class BacktestRequest(BaseModel):
    menuId: str
    menuName: str
    history: list[DailyRecordInput]
    horizon: int = 7


class BacktestResponse(BaseModel):
    menuId: str
    menuName: str
    mape: Optional[float]  
    mae: Optional[float]   
    rmse: Optional[float] 
    wape: Optional[float] 
    accuracy_percent: Optional[float]  
    n_samples: int
    train_size: Optional[int]
    test_size: Optional[int]
    error: Optional[str] = None
