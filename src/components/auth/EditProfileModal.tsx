import { useEffect, useState } from 'react'
import { useApp } from '../../context/AppContext'
import Avatar from '../common/Avatar'
import { formatLongDate } from '../../utils/formatDate'
import type { GenderOption } from '../../types'

const AVATAR_OPTIONS = ['🏍️', '🪖', '🧔', '👩', '🧑‍🦱', '😎', '🦊', '⚡']
const MAX_PHOTO_BYTES = 3 * 1024 * 1024

const GENDER_OPTIONS: Array<{ value: GenderOption; icon: string; labelKey: string }> = [
  { value: 'male', icon: '👨', labelKey: 'profile.genderMale' },
  { value: 'female', icon: '👩', labelKey: 'profile.genderFemale' },
  { value: 'unspecified', icon: '🤐', labelKey: 'profile.genderUnspecified' },
]

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export default function EditProfileModal() {
  const { editProfileModalOpen, setEditProfileModalOpen, user, updateProfile, openSubscriptionCheckout, checkDemoRestriction, lang, t } = useApp()
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('')
  const [gender, setGender] = useState<GenderOption | undefined>(undefined)
  const [age, setAge] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (editProfileModalOpen && user) {
      setName(user.name)
      setAvatar(user.avatarUrl)
      setGender(user.gender)
      setAge(user.age != null ? String(user.age) : '')
      setError('')
    }
  }, [editProfileModalOpen, user])

  if (!editProfileModalOpen || !user) return null

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_PHOTO_BYTES) {
      setError(t('profile.errorFileSize'))
      e.target.value = ''
      return
    }
    const dataUrl = await readFileAsDataUrl(file)
    setAvatar(dataUrl)
  }

  function handleSave() {
    if (checkDemoRestriction(t('profile.editTitle'))) return
    if (!name.trim()) {
      setError(t('auth.errorRequired'))
      return
    }
    const parsedAge = age.trim() ? Number(age) : null
    updateProfile({
      name: name.trim(),
      avatarUrl: avatar,
      gender,
      age: parsedAge,
    })
  }

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-slate-900/50 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl border-t border-bike-border bg-white p-5 shadow-2xl sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-bike-ink">{t('profile.editTitle')}</h2>
          <button
            onClick={() => setEditProfileModalOpen(false)}
            className="text-2xl leading-none text-slate-400"
            aria-label={t('auth.close')}
          >
            ×
          </button>
        </div>

        <div className="mb-4 rounded-2xl border border-bike-border bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <p className="font-display text-sm font-bold text-bike-ink">{t(`subscription.profileBadge.${user.tier}`)}</p>
            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600 shadow-card">{t(`tier.${user.tier}`)}</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {user.tier === 'free'
              ? t('subscription.freePermanent')
              : t('subscription.validUntil', { date: user.subscriptionExpiresAt ? formatLongDate(user.subscriptionExpiresAt, lang) : '—' })}
          </p>
          <button
            onClick={() => {
              setEditProfileModalOpen(false)
              openSubscriptionCheckout(user.tier !== 'free' ? user.tier : undefined)
            }}
            className="mt-3 w-full rounded-xl bg-bike-orange py-2.5 text-xs font-bold text-white shadow-glow-orange active:scale-95"
          >
            {t('subscription.renewOrChange')}
          </button>
        </div>

        <div className="flex flex-col items-center gap-3">
          <Avatar value={avatar} className="h-20 w-20 rounded-full border-2 border-bike-orange shadow-md" emojiClassName="bg-orange-50 text-4xl" />
          <label className="cursor-pointer rounded-full bg-bike-orange px-4 py-2 text-xs font-bold text-white shadow-glow-orange active:scale-95">
            {t('profile.uploadPhoto')}
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </label>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
            {t('profile.orChooseAvatar')}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {AVATAR_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setAvatar(emoji)}
                className={`flex h-11 w-11 items-center justify-center rounded-full border-2 text-xl transition ${
                  avatar === emoji ? 'border-bike-orange bg-orange-50' : 'border-bike-border bg-white'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-400">{t('auth.name')}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-bike-border bg-slate-50 px-4 py-3 text-sm text-bike-ink focus:border-bike-blue focus:outline-none"
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">{t('profile.gender')}</p>
            <div className="grid grid-cols-3 gap-2">
              {GENDER_OPTIONS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setGender(g.value)}
                  className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 transition ${
                    gender === g.value ? 'border-bike-orange bg-orange-50' : 'border-bike-border bg-white'
                  }`}
                >
                  <span className="text-xl">{g.icon}</span>
                  <span className="text-center text-[10px] font-semibold text-slate-600">{t(g.labelKey)}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-400">{t('profile.age')}</label>
            <input
              type="number"
              min={14}
              max={99}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder={t('profile.agePlaceholder')}
              className="w-full rounded-xl border border-bike-border bg-slate-50 px-4 py-3 text-sm text-bike-ink placeholder:text-slate-400 focus:border-bike-blue focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-400">{t('auth.email')}</label>
            <div className="flex items-center justify-between rounded-xl border border-bike-border bg-slate-100 px-4 py-3">
              <span className="truncate text-sm text-slate-600">{user.email}</span>
              <span className="ml-2 flex-shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                {t('profile.activeAccount')}
              </span>
            </div>
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-status-danger">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setEditProfileModalOpen(false)}
              className="flex-1 rounded-xl border border-bike-border py-3 text-sm font-semibold text-slate-600"
            >
              {t('addVehicle.cancel')}
            </button>
            <button
              onClick={handleSave}
              className="flex-1 rounded-xl bg-bike-orange py-3 text-sm font-bold text-white shadow-glow-orange active:scale-[0.98]"
            >
              {t('profile.saveChanges')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
