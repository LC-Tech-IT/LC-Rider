/** A real uploaded photo is a Data URL or a remote URL; anything else is treated as an emoji/icon. */
export function isPhotoAvatar(value: string): boolean {
  return value.startsWith('data:image') || value.startsWith('http')
}

interface AvatarProps {
  value: string
  className?: string
  emojiClassName?: string
}

export default function Avatar({ value, className = '', emojiClassName = '' }: AvatarProps) {
  if (isPhotoAvatar(value)) {
    return <img src={value} alt="Avatar" className={`object-cover ${className}`} />
  }
  return <span className={`flex items-center justify-center ${className} ${emojiClassName}`}>{value}</span>
}
