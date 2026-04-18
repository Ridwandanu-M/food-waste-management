// src/components/forecast/ForecastLayout.tsx
import ForecastHeader from "@/components/forecast/header/ForecastHeader";
import SalesForecastChart from "@/components/forecast/chart/SalesForecastChart";
import EfficiencyCard from "@/components/forecast/efficiency/EfficiencyCard";
import RiskFactorCard from "@/components/forecast/risk/RiskFactorCard";
import ProductionPlanTable from "@/components/forecast/production/ProductionPlanTable";

export default function Perencanaan() {
  return (
    <div className="min-h-screen p-6 font-sans">
      {/* Header */}
      <ForecastHeader />

      {/* Chart + Sidebar */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart — span 2 */}
        <div className="lg:col-span-2">
          <SalesForecastChart />
        </div>

        {/* Sidebar — span 1 */}
        <div className="flex flex-col gap-4">
          <EfficiencyCard />
          <RiskFactorCard />
        </div>
      </div>

      {/* Tabel Produksi */}
      <div className="mt-6">
        <ProductionPlanTable />
      </div>
    </div>
  );
}
