import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Route, Routes } from "react-router";
import Dashboard from "./pages/Manager/Dashboard";
import ManagerLayout from "./layout/ManagerLayout";
import Perencanaan from "./pages/Manager/Perencanaan";
import EntriData from "./pages/Manager/EntriData";
import Laporan from "./pages/Manager/Laporan";
import Manajemen from "./pages/Manager/Manajemen";
import Pengaturan from "./pages/Manager/Pengaturan";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<ManagerLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="perencanaan" element={<Perencanaan />} />
          <Route path="entri-data" element={<EntriData />} />
          <Route path="laporan" element={<Laporan />} />
          <Route path="manajemen" element={<Manajemen />} />
          <Route path="pengaturan" element={<Pengaturan />} />
        </Route>
      </Routes>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
