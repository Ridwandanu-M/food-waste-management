import { useEffect, useState } from "react";
import AppRouter from "./router";
import { useAuth } from "./hooks/useAuth";
import { Toaster } from "sonner";

export default function App() {
  const { initAuth } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Cek session dari cookie sebelum render router
    initAuth().finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Memuat...</div>
      </div>
    );
  }

  return (
    <>
      <AppRouter />
      <Toaster />
    </>
  );
}
