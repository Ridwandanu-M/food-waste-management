export type Role = "ADMIN" | "MANAGER" | "STAFF";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export interface Menu {
  id: string;
  name: string;
  category: string;
  unit: string;
  baseCost: number;
  price: number;
  isActive: boolean;
  createdAt: string;
}

export interface DailyRecord {
  id: string;
  date: string;
  actualProduction: number;
  actualSales: number;
  wasteAmount: number;
  menuId: string;
  staffId: string;
  menu?: Menu;
}

export interface ForecastResult {
  id: string;
  targetDate: string;
  predictedDemand: number;
  confidenceLevel: number;
  menuId: string;
  menu?: Menu;
  insight?: string;
}

export type PlanStatus = "DRAFT" | "APPROVED";
export type WarningStatus = "AMAN" | "RISIKO_TINGGI";

export interface ProductionPlan {
  id: string;
  targetDate: string;
  predictedAmount: number;
  plannedAmount: number;
  warningStatus: WarningStatus;
  status: PlanStatus;
  menuId: string;
  managerId: string;
  menu?: Menu;
}

export interface SystemSettings {
  restaurantName: string;
  timezone: string;
  currency: string;
  wasteTolerancePercent: number;
  notifyDailySummary: boolean;
  notifyWarningEscalation: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
