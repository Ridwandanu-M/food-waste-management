import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import api from '@/lib/api'
import type { User, Role } from '@/types'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  user: User | null
  onSuccess: () => void
}

export default function UserFormModal({ open, onOpenChange, user, onSuccess }: Props) {
  const isEdit = !!user
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('STAFF')
  const [password, setPassword] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
      setRole(user.role)
      setIsActive(user.isActive)
    } else {
      setName('')
      setEmail('')
      setRole('STAFF')
      setPassword('')
      setIsActive(true)
    }
    setError('')
  }, [user, open])

  async function handleSubmit() {
    if (!name || !email) {
      setError('Nama dan email wajib diisi.')
      return
    }
    setLoading(true)
    setError('')
    try {
      if (isEdit) {
        await api.patch(`/users/${user!.id}`, { name, email, role, isActive })
      } else {
        if (!password) {
          setError('Password wajib diisi untuk pengguna baru.')
          setLoading(false)
          return
        }
        await api.post('/users', { name, email, role, password })
      }
      onSuccess()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Pengguna' : 'Tambah Pengguna'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Nama Lengkap</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama lengkap"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@restoran.id"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="MANAGER">Manajer</SelectItem>
                <SelectItem value="STAFF">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!isEdit && (
            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password awal"
              />
            </div>
          )}

          {isEdit && (
            <div className="flex items-center justify-between">
              <Label>Status Akun</Label>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">
                  {isActive ? 'Aktif' : 'Nonaktif'}
                </span>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
            </div>
          )}

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
