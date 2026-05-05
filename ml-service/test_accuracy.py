"""
Script untuk testing akurasi model Prophet.
Jalankan: python test_accuracy.py
"""

import sys
sys.path.insert(0, '.')

from app.services.forecaster import backtest_forecast, calculate_accuracy_metrics

# ── Sample data: 30 hari historis produksi ───────────────────────────────────
SAMPLE_HISTORY = [
    {"date": f"2026-03-{d:02d}", "actualProduction": 50 + (d % 7) * 5, "actualSales": 45, "wasteAmount": 5}
    for d in range(1, 31)
]

# Tambahkan beberapa variasi realistis
for i, h in enumerate(SAMPLE_HISTORY):
    if i % 7 == 5 or i % 7 == 6:  # Weekend lebih tinggi
        h["actualProduction"] *= 1.3


def test_backtest():
    """Test backtest dengan data sample."""
    print("=" * 60)
    print("TEST BACKTEST - Evaluasi Akurasi Prophet")
    print("=" * 60)

    result = backtest_forecast(
        history=SAMPLE_HISTORY,
        horizon=7,
        menu_name="Nasi Goreng Spesial",
    )

    if result.get("error"):
        print(f"\n❌ ERROR: {result['error']}")
        return

    metrics = result.get("metrics", {})
    print(f"\n📊 Hasil Backtest (7 hari test):")
    print(f"   Train size: {result.get('train_size')} hari")
    print(f"   Test size:  {result.get('test_size')} hari")
    print(f"\n📈 Metrik Akurasi:")
    print(f"   MAPE:    {metrics.get('mape', 'N/A')}%")
    print(f"   MAE:     {metrics.get('mae', 'N/A')} unit")
    print(f"   RMSE:    {metrics.get('rmse', 'N/A')} unit")
    print(f"   WAPE:    {metrics.get('wape', 'N/A')}%")
    print(f"   Accuracy: {metrics.get('accuracy_percent', 'N/A')}%")

    # Interpretasi
    accuracy = metrics.get('accuracy_percent', 0) or 0
    if accuracy >= 90:
        print(f"\n✅ Kualitas Model: SANGAT BAIK (Accuracy > 90%)")
    elif accuracy >= 80:
        print(f"\n✅ Kualitas Model: BAIK (Accuracy 80-90%)")
    elif accuracy >= 50:
        print(f"\n⚠️  Kualitas Model: CUKUP (Accuracy 50-80%)")
    else:
        print(f"\n❌ Kualitas Model: KURANG (Accuracy < 50%)")

    # Tampilkan perbandingan prediksi vs aktual
    print(f"\n📋 Detail Prediksi vs Aktual:")
    print(f"   {'Tanggal':<12} {'Aktual':<10} {'Prediksi':<10} {'Selisih':<10}")
    print(f"   {'-'*42}")

    for i, (date, actual, pred) in enumerate(zip(
        result.get('dates', []),
        result.get('actuals', []),
        result.get('predictions', [])
    )):
        diff = pred - actual
        print(f"   {date:<12} {actual:<10.1f} {pred:<10.1f} {diff:+<10.1f}")


def test_calculate_metrics():
    """Test fungsi calculate_accuracy_metrics."""
    print("\n" + "=" * 60)
    print("TEST CALCULATE ACCURACY METRICS")
    print("=" * 60)

    # Data contoh: aktual vs prediksi
    actual = [100, 120, 110, 130, 140, 150, 160]
    predicted = [95, 125, 108, 135, 138, 155, 152]

    metrics = calculate_accuracy_metrics(actual, predicted)

    print(f"\nData Test:")
    print(f"   Aktual:    {actual}")
    print(f"   Prediksi:  {predicted}")
    print(f"\nHasil Metrics:")
    print(f"   MAPE:    {metrics.get('mape')}%")
    print(f"   MAE:     {metrics.get('mae')} unit")
    print(f"   RMSE:    {metrics.get('rmse')} unit")
    print(f"   WAPE:    {metrics.get('wape')}%")
    print(f"   Accuracy: {metrics.get('accuracy_percent')}%")


def test_with_real_data():
    """
    Test dengan data real dari database (jika tersedia).
    Ini hanya contoh - sesuaikan dengan data Anda.
    """
    print("\n" + "=" * 60)
    print("TEST DENGAN DATA REAL (CONTOH)")
    print("=" * 60)

    # Contoh data real dari DailyRecord
    real_history = [
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
    ]

    if len(real_history) < 14:
        print(f"\n⚠️  Data hanya {len(real_history)} hari. Minimal 14 hari untuk backtest.")
        return

    result = backtest_forecast(
        history=real_history,
        horizon=3,  # Test 3 hari terakhir
        menu_name="Menu Real",
    )

    if result.get("error"):
        print(f"\n❌ ERROR: {result['error']}")
        return

    metrics = result.get("metrics", {})
    print(f"\n📊 Hasil Backtest:")
    print(f"   Train size: {result.get('train_size')} hari")
    print(f"   Test size:  {result.get('test_size')} hari")
    print(f"\n📈 Metrik Akurasi:")
    print(f"   MAPE:    {metrics.get('mape')}%")
    print(f"   Accuracy: {metrics.get('accuracy_percent')}%")


if __name__ == "__main__":
    print("\n🧪 TESTING AKURASI MODEL PROPHET\n")

    # 1. Test dengan data sample
    test_backtest()

    # 2. Test fungsi metrics
    test_calculate_metrics()

    # 3. Test dengan data real (contoh)
    test_with_real_data()

    print("\n" + "=" * 60)
    print("✅ TESTING SELESAI")
    print("=" * 60)
