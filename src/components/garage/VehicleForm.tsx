import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import type { Vehicle, VehicleCategory } from '../../types'

const CATEGORIES: Array<{ value: VehicleCategory; icon: string; labelKey: string }> = [
  { value: 'sport', icon: '🏍️', labelKey: 'addVehicle.categorySport' },
  { value: 'trail', icon: '🏜️', labelKey: 'addVehicle.categoryTrail' },
  { value: 'car', icon: '🚗', labelKey: 'addVehicle.categoryCar' },
]

const QUICK_MODELS = [
  { brand: 'Yamaha', model: 'MT-09' },
  { brand: 'BMW', model: 'R1250 GS' },
  { brand: 'KTM', model: 'Duke 390' },
  { brand: 'Kawasaki', model: 'Versys 650' },
  { brand: 'Suzuki', model: 'V-Strom' },
]

const COLORS = ['#F97316', '#0284C7', '#16A34A', '#DC2626', '#7C3AED', '#0F172A']

const MAX_FILE_BYTES = 2 * 1024 * 1024

interface DocFileState {
  fileName: string
  fileSizeKb: number
  fileDataUrl: string
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

interface VehicleFormProps {
  onSave: (vehicle: Vehicle, setActive: boolean) => void
  onCancel?: () => void
  showActiveToggle?: boolean
  submitLabel?: string
}

export default function VehicleForm({ onSave, onCancel, showActiveToggle = true, submitLabel }: VehicleFormProps) {
  const { t } = useApp()

  const [plate, setPlate] = useState('')
  const [category, setCategory] = useState<VehicleCategory>('sport')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [soatDate, setSoatDate] = useState('')
  const [tecnoDate, setTecnoDate] = useState('')
  const [soatFile, setSoatFile] = useState<DocFileState | null>(null)
  const [tecnoFile, setTecnoFile] = useState<DocFileState | null>(null)
  const [setActive, setSetActive] = useState(true)
  const [error, setError] = useState('')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>, setter: (f: DocFileState | null) => void) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_FILE_BYTES) {
      setError(t('addVehicle.errorFileSize'))
      e.target.value = ''
      return
    }
    const dataUrl = await readFileAsDataUrl(file)
    setter({ fileName: file.name, fileSizeKb: Math.round(file.size / 1024), fileDataUrl: dataUrl })
  }

  function handleSave() {
    if (!plate.trim() || !brand.trim() || !model.trim() || !soatDate || !tecnoDate) {
      setError(t('addVehicle.errorRequired'))
      return
    }
    const newVehicle: Vehicle = {
      id: `veh-${Date.now()}`,
      plate: plate.trim().toUpperCase(),
      brand: brand.trim(),
      model: model.trim(),
      category,
      type: category === 'car' ? 'carro' : 'moto',
      color,
      avatarEmoji: category === 'car' ? '🚗' : '🏍️',
      soat: { expiresAt: soatDate, ...soatFile },
      tecnomecanica: { expiresAt: tecnoDate, ...tecnoFile },
      planActive: false,
    }
    onSave(newVehicle, showActiveToggle ? setActive : true)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-400">{t('addVehicle.plate')}</label>
        <input
          value={plate}
          onChange={(e) => setPlate(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7))}
          placeholder={t('addVehicle.platePlaceholder')}
          className="w-full rounded-xl border border-bike-border bg-slate-50 px-4 py-3 font-display text-sm tracking-widest text-bike-ink placeholder:text-slate-400 focus:border-bike-blue focus:outline-none"
        />
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">{t('addVehicle.vehicleType')}</p>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 transition ${
                category === c.value ? 'border-bike-orange bg-orange-50' : 'border-bike-border bg-white'
              }`}
            >
              <span className="text-2xl">{c.icon}</span>
              <span className="text-center text-[10px] font-semibold text-slate-600">{t(c.labelKey)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-400">{t('addVehicle.brand')}</label>
          <input
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder={t('addVehicle.brandPlaceholder')}
            className="w-full rounded-xl border border-bike-border bg-slate-50 px-3 py-3 text-sm text-bike-ink placeholder:text-slate-400 focus:border-bike-blue focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-400">{t('addVehicle.model')}</label>
          <input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder={t('addVehicle.modelPlaceholder')}
            className="w-full rounded-xl border border-bike-border bg-slate-50 px-3 py-3 text-sm text-bike-ink placeholder:text-slate-400 focus:border-bike-blue focus:outline-none"
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">{t('addVehicle.quickSuggestions')}</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_MODELS.map((q) => (
            <button
              key={`${q.brand}-${q.model}`}
              onClick={() => {
                setBrand(q.brand)
                setModel(q.model)
              }}
              className="rounded-full border border-bike-border bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-bike-blue/50 hover:text-bike-blue"
            >
              {q.brand} {q.model}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">{t('addVehicle.color')}</p>
        <div className="flex gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{ backgroundColor: c }}
              className={`h-9 w-9 rounded-full border-2 transition ${
                color === c ? 'border-bike-ink scale-110' : 'border-white shadow-card'
              }`}
              aria-label={c}
            />
          ))}
        </div>
      </div>

      <DocumentField
        label={t('addVehicle.soatExpiry')}
        date={soatDate}
        onDateChange={setSoatDate}
        file={soatFile}
        onFileChange={(e) => handleFile(e, setSoatFile)}
        t={t}
        inputId="soat-file-input"
      />

      <DocumentField
        label={t('addVehicle.tecnoExpiry')}
        date={tecnoDate}
        onDateChange={setTecnoDate}
        file={tecnoFile}
        onFileChange={(e) => handleFile(e, setTecnoFile)}
        t={t}
        inputId="tecno-file-input"
      />

      {showActiveToggle && (
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={setActive} onChange={(e) => setSetActive(e.target.checked)} className="h-4 w-4 accent-bike-orange" />
          {t('addVehicle.setAsActive')}
        </label>
      )}

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-status-danger">{error}</p>}

      <div className="flex gap-2 pt-1">
        {onCancel && (
          <button onClick={onCancel} className="flex-1 rounded-xl border border-bike-border py-3 text-sm font-semibold text-slate-600">
            {t('addVehicle.cancel')}
          </button>
        )}
        <button
          onClick={handleSave}
          className="flex-1 rounded-xl bg-bike-orange py-3 text-sm font-bold text-white shadow-glow-orange active:scale-[0.98]"
        >
          {submitLabel ?? t('addVehicle.save')}
        </button>
      </div>
    </div>
  )
}

function DocumentField({
  label,
  date,
  onDateChange,
  file,
  onFileChange,
  t,
  inputId,
}: {
  label: string
  date: string
  onDateChange: (v: string) => void
  file: DocFileState | null
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  t: (key: string) => string
  inputId: string
}) {
  return (
    <div className="rounded-xl border border-bike-border bg-slate-50 p-3">
      <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</label>
      <input
        type="date"
        value={date}
        onChange={(e) => onDateChange(e.target.value)}
        className="mb-3 w-full rounded-lg border border-bike-border bg-white px-3 py-2.5 text-sm text-bike-ink focus:border-bike-blue focus:outline-none"
      />

      <input id={inputId} type="file" accept="image/jpeg,image/png,application/pdf" onChange={onFileChange} className="hidden" />

      {file ? (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-emerald-700">{t('garage.documentLinked')}</p>
            <p className="truncate text-[11px] text-slate-500">
              {file.fileName} · {file.fileSizeKb} KB
            </p>
          </div>
          <label htmlFor={inputId} className="flex-shrink-0 cursor-pointer text-[11px] font-semibold text-bike-blue">
            {t('addVehicle.change')}
          </label>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-bike-border bg-white px-3 py-4 text-center"
        >
          <span className="text-xl">📎</span>
          <span className="text-xs font-semibold text-slate-600">{t('addVehicle.uploadZoneLabel')}</span>
          <span className="text-[10px] text-slate-400">{t('addVehicle.dragHint')}</span>
        </label>
      )}
    </div>
  )
}
