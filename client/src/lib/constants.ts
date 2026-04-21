export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF',
} as const

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PLANNING: '/planning',
  ENTRY: '/entry',
  REPORTS: '/reports',
  MANAGEMENT_USERS: '/management/users',
  MANAGEMENT_MENU: '/management/menu',
  SETTINGS: '/settings',
} as const

export const MENU_CATEGORIES = [
  'Makanan Utama',
  'Makanan Pembuka',
  'Minuman',
  'Dessert',
  'Snack',
] as const

export const TOLERANCE_MIN = 5
export const TOLERANCE_MAX = 50
