import { cn } from '@/lib/utils'
import type { Role } from '@/types'

const styles: Record<Role, string> = {
  ADMIN: 'bg-purple-100 text-purple-700',
  MANAGER: 'bg-blue-100 text-blue-700',
  STAFF: 'bg-gray-100 text-gray-600',
}

const labels: Record<Role, string> = {
  ADMIN: 'Admin',
  MANAGER: 'Manajer',
  STAFF: 'Staff',
}

export function RoleBadge({ role, className }: { role: Role; className?: string }) {
  return (
    <span
      className={cn(
        'inline-block px-2 py-0.5 rounded-full text-xs font-medium',
        styles[role],
        className
      )}
    >
      {labels[role]}
    </span>
  )
}
