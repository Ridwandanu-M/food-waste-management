import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import { login, logout, me } from "../controllers/auth.controller";
import {
  getUsers,
  createUser,
  updateUser,
} from "../controllers/users.controller";
import {
  getMenus,
  createMenu,
  updateMenu,
} from "../controllers/menus.controller";
import { createDailyRecords } from "../controllers/dailyRecords.controller";
import { getDashboard } from "../controllers/dashboard.controller";
import {
  getTodayForecasts,
  deleteAllForecasts,
} from "../controllers/forecasts.controller";
import {
  bulkUpsertPlans,
  getTodayPlans,
} from "../controllers/productionPlans.controller";
import {
  getSettings,
  updateSettings,
} from "../controllers/settings.controller";

const router = Router();

// ── Auth ──
router.post("/auth/login", login);
router.post("/auth/logout", logout);
router.get("/auth/me", authenticate, me);

// ── Users (Admin only) ──
router.get("/users", authenticate, authorize("ADMIN"), getUsers);
router.post("/users", authenticate, authorize("ADMIN"), createUser);
router.patch("/users/:id", authenticate, authorize("ADMIN"), updateUser);

// ── Menus (Admin write, semua role read) ──
router.get("/menus", authenticate, getMenus);
router.post("/menus", authenticate, authorize("ADMIN"), createMenu);
router.patch("/menus/:id", authenticate, authorize("ADMIN"), updateMenu);

// ── Daily Records (Staff) ──
router.post(
  "/daily-records",
  authenticate,
  authorize("STAFF", "MANAGER"),
  createDailyRecords,
);

// ── Dashboard (Manager) ──
router.get("/dashboard", authenticate, authorize("MANAGER"), getDashboard);

// ── Forecasts (Manager) ──
router.get(
  "/forecasts/today",
  authenticate,
  authorize("MANAGER"),
  getTodayForecasts,
);
router.delete(
  "/forecasts/all",
  authenticate,
  authorize("ADMIN"),
  deleteAllForecasts,
);

// ── Production Plans (Manager) ──
router.get(
  "/production-plans/today",
  authenticate,
  authorize("MANAGER"),
  getTodayPlans,
);
router.post(
  "/production-plans/bulk",
  authenticate,
  authorize("MANAGER"),
  bulkUpsertPlans,
);

// ── Settings ──
router.get("/settings", authenticate, getSettings);
router.put(
  "/settings",
  authenticate,
  authorize("ADMIN", "MANAGER"),
  updateSettings,
);

export default router;
