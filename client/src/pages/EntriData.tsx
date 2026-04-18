import OperationsHeader from "@/components/operations/header/OperationsHeader";
import ApprovedPlanCard from "@/components/operations/plan/ApprovedPlanCard";
import DailyReportPanel from "@/components/operations/report/DailyReportPanel";
import SummaryFooter from "@/components/operations/report/SummaryFooter";

export default function EntriData() {
  return (
    <div className="min-h-screen p-6 font-sans">
      <OperationsHeader />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Kiri — Rencana Disetujui (span 2) */}
        <div className="lg:col-span-2">
          <ApprovedPlanCard />
        </div>

        {/* Kanan — Laporan Akhir Hari (span 3) */}
        <div className="lg:col-span-3">
          <DailyReportPanel />
        </div>
      </div>

      {/* Footer Summary */}
      <div className="mt-6">
        <SummaryFooter />
      </div>
    </div>
  );
}
