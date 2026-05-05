import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.routers import predict, evaluate

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

app = FastAPI(
    title="WasteWise ML Service",
    description="Forecasting service berbasis Prophet untuk prediksi permintaan menu restoran.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000"],
    allow_methods=["POST"],
    allow_headers=["*"],
)

app.include_router(predict.router)
app.include_router(evaluate.router)


@app.get("/health", tags=["System"])
async def health():
    return {"status": "ok", "service": "wastewise-ml"}
