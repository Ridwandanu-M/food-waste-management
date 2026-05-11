# WasteWise ML Service — Dokumentasi Integrasi

## Gambaran Umum

ML Service adalah microservice Python (FastAPI) yang menerima data historis
produksi dari backend Express dan mengembalikan prediksi permintaan per menu.

```
Frontend (React)
      ↓ GET /api/forecasts/today
Backend Express
      ↓ POST /predict/bulk          (jika ML tersedia)
FastAPI ML Service
      ↓ Prophet / Moving Average
      ↑ { predictedDemand, confidence, insight }
Backend Express
      ↓ Simpan ke ForecastResult (cache)
      ↑ Return ke frontend
Frontend (React)
      → Tampilkan di halaman Perencanaan
```

---

## Setup ML Service

### 1. Buat virtual environment

```bash
cd ml-service
python -m venv venv

# Linux / Mac
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

> **Catatan:** Prophet membutuhkan `pystan` yang perlu compiler C++.
> Jika instalasi gagal, jalankan dulu:
>
> ```bash
> # Linux
> sudo apt-get install build-essential
>
> # Mac
> xcode-select --install
>
> # Windows — install Visual C++ Build Tools dari:
> # https://visualstudio.microsoft.com/visual-cpp-build-tools/
> ```

### 3. Konfigurasi .env

```bash
cp .env.example .env
```

Edit `.env`:

```
PORT=8000
INTERNAL_API_KEY=kunci-rahasia-yang-sama-dengan-backend
MIN_HISTORY_DAYS=14
```

### 4. Jalankan service

```bash
python main.py
# atau
uvicorn app.main:app --reload --port 8000
```

Service berjalan di `http://localhost:8000`
Dokumentasi API otomatis: `http://localhost:8000/docs`

---

## Setup Backend Express (update)

### 1. Tambahkan variabel ke .env

```
ML_SERVICE_URL=http://localhost:8000
INTERNAL_API_KEY=kunci-rahasia-yang-sama-dengan-ml-service
```

### 2. Ganti file berikut

| File                                      | Keterangan                               |
| ----------------------------------------- | ---------------------------------------- |
| `src/lib/mlClient.ts`                     | HTTP client baru untuk memanggil FastAPI |
| `src/controllers/forecasts.controller.ts` | Integrasikan ML, tambah fallback         |

### 3. Jalankan migrasi Prisma

Schema `ForecastResult` mendapat `@@unique([menuId, targetDate])`:

```bash
cd backend
npx prisma migrate dev --name add_forecast_unique_constraint
npx prisma generate
```

---

## Cara Kerja Forecasting

### Tiering berdasarkan jumlah data historis

| Data tersedia     | Metode                        | Confidence  |
| ----------------- | ----------------------------- | ----------- |
| ≥ 14 hari         | **Prophet** (ML time-series)  | 0.75 – 0.99 |
| 7 – 13 hari       | **Weighted Moving Average**   | 0.50 – 0.85 |
| 1 – 6 hari        | **Simple Moving Average**     | 0.40 – 0.65 |
| 0 hari            | **Default (50 porsi)**        | 0.30        |
| ML tidak tersedia | **Fallback rata-rata 7 hari** | 0.30 – 0.65 |

### Prophet

Prophet adalah library forecasting dari Meta yang dirancang untuk data bisnis
dengan pola musiman. Konfigurasi yang digunakan:

```python
Prophet(
    yearly_seasonality=False,   # data restoran jarang punya pola tahunan
    weekly_seasonality=True,    # pola hari kerja vs weekend penting
    daily_seasonality=False,
    changepoint_prior_scale=0.05,  # konservatif — hindari overfitting
    interval_width=0.8,            # interval kepercayaan 80%
)
```

### Caching

Hasil forecast disimpan ke tabel `ForecastResult` setelah pertama kali
dihitung. Jika Manager membuka halaman Perencanaan berkali-kali di hari
yang sama, ML Service hanya dipanggil **sekali** — sisanya dari cache DB.

Untuk memaksa recalculate: gunakan tombol **Reset Data Forecast** di
halaman Pengaturan (menghapus semua ForecastResult).

---

## API Reference

### Health Check

```
GET /health
```

Response:

```json
{ "status": "ok", "service": "wastewise-ml" }
```

---

### Prediksi Bulk (digunakan backend)

```
POST /predict/bulk
Header: X-Api-Key: {INTERNAL_API_KEY}
```

Request body:

```json
{
  "targetDate": "2025-04-25",
  "menus": [
    {
      "menuId": "menu-nasi-goreng",
      "menuName": "Nasi Goreng Spesial",
      "targetDate": "2025-04-25",
      "history": [
        {
          "date": "2025-04-18",
          "actualProduction": 65,
          "actualSales": 60,
          "wasteAmount": 5
        }
      ]
    }
  ]
}
```

Response:

```json
{
  "targetDate": "2025-04-25",
  "predictions": [
    {
      "menuId": "menu-nasi-goreng",
      "menuName": "Nasi Goreng Spesial",
      "targetDate": "2025-04-25",
      "predictedDemand": 67.5,
      "confidenceLevel": 0.82,
      "lowerBound": 54.0,
      "upperBound": 81.0,
      "method": "prophet",
      "insight": "Prediksi Nasi Goreng Spesial: 68 porsi menggunakan ML Prophet berdasarkan 30 hari data. Tren permintaan cenderung meningkat."
    }
  ]
}
```

---

### Prediksi Single (untuk testing)

```
POST /predict/single
Header: X-Api-Key: {INTERNAL_API_KEY}
```

Request body sama dengan satu item di `menus[]` di atas.

---

## Menjalankan Tests

```bash
cd ml-service
pytest tests/ -v
```

Output yang diharapkan:

```
tests/test_forecaster.py::TestForecastDefault::test_no_history_returns_default PASSED
tests/test_forecaster.py::TestForecastDefault::test_response_has_required_keys PASSED
tests/test_forecaster.py::TestMovingAverage::test_few_days_uses_moving_average PASSED
...
```

---

## Troubleshooting

### ML Service tidak terhubung

Backend akan otomatis menggunakan fallback rata-rata 7 hari.
Cek apakah ML service berjalan:

```bash
curl http://localhost:8000/health
```

### Prediksi selalu 50

Berarti tidak ada `DailyRecord` di database. Pastikan seed sudah dijalankan:

```bash
cd backend
npm run db:seed
```

### Prophet gagal install

Gunakan versi yang kompatibel:

```bash
pip install pystan==2.19.1.1
pip install prophet==1.1.5
```

Atau jika tetap gagal, sistem akan otomatis fallback ke Moving Average
yang tidak memerlukan Prophet sama sekali — fungsionalitas tetap berjalan.

### Port sudah digunakan

```bash
# Ganti port di .env
PORT=8001

# Dan update ML_SERVICE_URL di backend .env
ML_SERVICE_URL=http://localhost:8001
```

---

## Struktur Folder ML Service

```
ml-service/
├── app/
│   ├── main.py              # FastAPI app, CORS, routing
│   ├── models/
│   │   └── schemas.py       # Pydantic request/response models
│   ├── routers/
│   │   └── predict.py       # Endpoint /predict/single dan /predict/bulk
│   └── services/
│       └── forecaster.py    # Logika Prophet + Moving Average + fallback
├── tests/
│   └── test_forecaster.py   # Unit tests
├── main.py                  # Entry point uvicorn
├── requirements.txt
└── .env.example
```
