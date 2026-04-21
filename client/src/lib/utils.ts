import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString))
}

export function calcMargin(price: number, baseCost: number): number {
  if (price <= 0) return 0
  return Math.round(((price - baseCost) / price) * 100)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'Makanan Utama': 'bg-emerald-100 text-emerald-700',
    'Makanan Pembuka': 'bg-orange-100 text-orange-700',
    Minuman: 'bg-blue-100 text-blue-700',
    Dessert: 'bg-pink-100 text-pink-700',
    Snack: 'bg-yellow-100 text-yellow-700',
  }
  return colors[category] ?? 'bg-gray-100 text-gray-700'
}
