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
import { TrendingUp } from 'lucide-react'
import { calcMargin, cn } from '@/lib/utils'
import { MENU_CATEGORIES } from '@/lib/constants'
import api from '@/lib/api'
import type { Menu } from '@/types'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  menu: Menu | null
  onSuccess: () => void
}

export default function MenuFormModal({ open, onOpenChange, menu, onSuccess }: Props) {
  const isEdit = !!menu
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [unit, setUnit] = useState('')
  const [baseCost, setBaseCost] = useState('')
  const [price, setPrice] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const margin = calcMargin(Number(price), Number(baseCost))
  const marginColor =
    margin >= 40
      ? 'text-emerald-600'
      : margin >= 20
      ? 'text-amber-600'
      : 'text-red-600'

  useEffect(() => {
    if (menu) {
      setName(menu.name)
      setCategory(menu.category)
      setUnit(menu.unit)
      setBaseCost(String(menu.baseCost))
      setPrice(String(menu.price))
      setIsActive(menu.isActive)
    } else {
      setName('')
      setCategory('')
      setUnit('')
      setBaseCost('')
      setPrice('')
      setIsActive(true)
    }
    setError('')
  }, [menu, open])

  async function handleSubmit() {
    if (!name || !category || !unit || !baseCost || !price) {
      setError('Semua field wajib diisi.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const payload = {
        name,
        category,
        unit,
        baseCost: Number(baseCost),
        price: Number(price),
        isActive,
      }
      if (isEdit) {
        await api.patch(`/menus/${menu!.id}`, payload)
      } else {
        await api.post('/menus', payload)
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
          <DialogTitle>{isEdit ? 'Edit Menu' : 'Tambah Menu Baru'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Nama Menu</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama menu"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>
                Kategori <span className="text-destructive">*</span>
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori..." />
                </SelectTrigger>
                <SelectContent>
                  {MENU_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>
                Satuan <span className="text-destructive">*</span>
              </Label>
              <Input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="cth: porsi, pcs, liter"
              />
            </div>
          </div>

          {/* Kalkulator Keuangan */}
          <div className="border rounded-lg p-4 space-y-3 bg-muted/20">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Kalkulator Keuangan
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Harga Pokok Produksi (Rp)</Label>
                <Input
                  type="number"
                  value={baseCost}
                  onChange={(e) => setBaseCost(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Harga Jual (Rp)</Label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex items-center justify-between pt-1 border-t">
              <span className="text-sm text-muted-foreground">Proyeksi Margin:</span>
              <div className={cn('flex items-center gap-1 text-lg font-semibold', marginColor)}>
                {margin}% <TrendingUp size={16} />
              </div>
            </div>
          </div>

          {isEdit ? (
            <div className="flex items-center justify-between">
              <Label>Status Menu</Label>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">
                  {isActive ? 'Aktif' : 'Diarsipkan'}
                </span>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="aktif"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="accent-primary"
              />
              <Label htmlFor="aktif">Tandai sebagai Aktif</Label>
            </div>
          )}

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan Menu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
