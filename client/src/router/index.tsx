import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import AppLayout from "@/components/layout/AppLayout";
import StaffLayout from "@/components/layout/StaffLayout";
import ProtectedRoute from "./ProtectedRoute";

import LoginPage from "@/pages/auth/LoginPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import PlanningPage from "@/pages/planning/PlanningPage";
import EntryPage from "@/pages/entry/EntryPage";
import ReportsPage from "@/pages/reports/ReportsPage";
import ModelEvaluationPage from "@/pages/reports/ModelEvaluationPage";
import UsersPage from "@/pages/management/users/UsersPage";
import MenuPage from "@/pages/management/menu/MenuPage";
import SettingsPage from "@/pages/settings/SettingsPage";

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "/login", element: <LoginPage /> },

  {
    element: (
      <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute allowedRoles={["MANAGER"]}>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/planning",
        element: (
          <ProtectedRoute allowedRoles={["MANAGER"]}>
            <PlanningPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/reports",
        element: (
          <ProtectedRoute allowedRoles={["MANAGER"]}>
            <ReportsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/reports/evaluation",
        element: (
          <ProtectedRoute allowedRoles={["MANAGER"]}>
            <ModelEvaluationPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/management/users",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <UsersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/management/menu",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <MenuPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/settings",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },

  {
    element: (
      <ProtectedRoute allowedRoles={["STAFF"]}>
        <StaffLayout />
      </ProtectedRoute>
    ),
    children: [{ path: "/entry", element: <EntryPage /> }],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
