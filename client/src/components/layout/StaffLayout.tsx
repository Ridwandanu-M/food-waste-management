import { Outlet } from "react-router";

export default function StaffLayout() {
  return (
    <div className="min-h-screen bg-secondary/30">
      <Outlet />
    </div>
  );
}
