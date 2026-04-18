// src/components/dashboard/DashboardLayout.tsx
import DashboardHeader from "@/components/dashboard/header/DashboardHeader";
import StatsCards from "@/components/dashboard/stats/StatsCards";
import WasteTrendChart from "@/components/dashboard/charts/WasteTrendChart";
import ForecastChart from "@/components/dashboard/charts/ForecastChart";
import WastePerMenuItem from "@/components/dashboard/waste/WastePerMenuItem";
import AlertFeed from "@/components/dashboard/alerts/AlertFeed";
import PnLSource from "@/components/dashboard/pnl/PnLSource";
import HighImpactItems from "@/components/dashboard/impact/HighImpactItems";

export default function Dashboard() {
  return (
    <div className="min-h-screen p-6 font-sans">
      {/* Header */}
      <DashboardHeader />

      {/* Stats Row */}
      <section className="mt-6">
        <StatsCards />
      </section>

      {/* Main Grid: Charts (kiri) + Sidebar (kanan) */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Kolom Kiri — Charts (span 2) */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <WasteTrendChart />
          <ForecastChart />

          {/* Bottom Row */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <PnLSource />
            <HighImpactItems />
          </div>
        </div>

        {/* Kolom Kanan — Sidebar (span 1) */}
        <div className="flex flex-col gap-6">
          <WastePerMenuItem />
          <AlertFeed />
        </div>
      </div>
    </div>
  );
}
