import { IconUser } from './Icons'

/** A real uploaded photo is a Data URL or a remote URL; anything else (emoji heredado, vacío) usa la silueta. */
export function isPhotoAvatar(value: string): boolean {
  return value.startsWith('data:image') || value.startsWith('http')
}

interface AvatarProps {
  value: string
  className?: string
  /** Clases extra para el contenedor de la silueta (fondo, tamaño del icono). */
  emojiClassName?: string
}

export default function Avatar({ value, className = '', emojiClassName = '' }: AvatarProps) {
  if (isPhotoAvatar(value)) {
    return <img src={value} alt="Avatar" className={`object-cover ${className}`} />
  }
  return (
    <span className={`flex items-center justify-center bg-slate-200 text-slate-700 ${className} ${emojiClassName}`}>
      <IconUser className="h-[55%] w-[55%]" strokeWidth={2} />
    </span>
  )
}
