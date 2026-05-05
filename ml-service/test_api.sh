#!/bin/bash
# Script untuk test endpoint backtest via curl
# Pastikan ML service sudah running di http://localhost:8000

API_KEY="your-internal-api-key"  # Sesuaikan dengan .env

echo "🧪 Testing Backtest API Endpoint"
echo "================================="

# Data test
DATA='
{
  "menuId": "menu-test-001",
  "menuName": "Nasi Goreng Spesial",
  "history": [
    {"date": "2026-04-01", "actualProduction": 85, "actualSales": 80, "wasteAmount": 5},
    {"date": "2026-04-02", "actualProduction": 90, "actualSales": 88, "wasteAmount": 2},
    {"date": "2026-04-03", "actualProduction": 95, "actualSales": 90, "wasteAmount": 5},
    {"date": "2026-04-04", "actualProduction": 120, "actualSales": 115, "wasteAmount": 5},
    {"date": "2026-04-05", "actualProduction": 130, "actualSales": 125, "wasteAmount": 5},
    {"date": "2026-04-06", "actualProduction": 80, "actualSales": 78, "wasteAmount": 2},
    {"date": "2026-04-07", "actualProduction": 75, "actualSales": 72, "wasteAmount": 3},
    {"date": "2026-04-08", "actualProduction": 88, "actualSales": 85, "wasteAmount": 3},
    {"date": "2026-04-09", "actualProduction": 92, "actualSales": 90, "wasteAmount": 2},
    {"date": "2026-04-10", "actualProduction": 98, "actualSales": 95, "wasteAmount": 3},
    {"date": "2026-04-11", "actualProduction": 125, "actualSales": 120, "wasteAmount": 5},
    {"date": "2026-04-12", "actualProduction": 135, "actualSales": 130, "wasteAmount": 5},
    {"date": "2026-04-13", "actualProduction": 82, "actualSales": 80, "wasteAmount": 2},
    {"date": "2026-04-14", "actualProduction": 78, "actualSales": 75, "wasteAmount": 3},
    {"date": "2026-04-15", "actualProduction": 90, "actualSales": 88, "wasteAmount": 2},
    {"date": "2026-04-16", "actualProduction": 95, "actualSales": 92, "wasteAmount": 3}
  ],
  "horizon": 4
}
'

echo ""
echo "Request:"
echo "$DATA" | jq .
echo ""
echo "Response:"

curl -s -X POST http://localhost:8000/predict/backtest \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "$DATA" | jq .

echo ""
echo "================================="
echo "✅ Test selesai"
