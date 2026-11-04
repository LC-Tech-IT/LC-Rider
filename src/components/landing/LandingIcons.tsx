import type { ReactNode, SVGProps } from 'react'

/** Set de iconos vectoriales de trazo fino (estilo Lucide/Garmin) para la landing. Heredan el color del texto
 *  (`currentColor`) y se dimensionan con clases de Tailwind (`h-4 w-4`, etc.), sin dependencias externas. */
type IconProps = SVGProps<SVGSVGElement>

function Icon({ children, strokeWidth = 1.75, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export const IconArrowRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </Icon>
)

export const IconDownload = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3v12" />
    <path d="m7 10 5 5 5-5" />
    <path d="M5 21h14" />
  </Icon>
)

export const IconCheck = (p: IconProps) => (
  <Icon {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Icon>
)

export const IconSignal = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 12v9" />
    <circle cx="12" cy="10" r="1.6" />
    <path d="M8.2 6.2a5.4 5.4 0 0 0 0 7.6" />
    <path d="M15.8 6.2a5.4 5.4 0 0 1 0 7.6" />
    <path d="M5.3 3.3a9.5 9.5 0 0 0 0 13.4" />
    <path d="M18.7 3.3a9.5 9.5 0 0 1 0 13.4" />
  </Icon>
)

export const IconShield = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.3 7.5 9.5 4.4-1.2 7.5-4.9 7.5-9.5V6L12 3Z" />
    <path d="M12 8.5v4" />
    <path d="M12 15.5h.01" />
  </Icon>
)

export const IconFuel = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16" />
    <path d="M3 21h12" />
    <path d="M6.5 8h5" />
    <path d="M14 10h2a2 2 0 0 1 2 2v4.5a1.5 1.5 0 0 0 3 0V8.5L18 5.5" />
  </Icon>
)

export const IconAlert = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10.3 4.2 2.6 17.5A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9.5v4" />
    <path d="M12 17h.01" />
  </Icon>
)

export const IconRegroup = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
    <path d="M16 5.5a3 3 0 0 1 0 5" />
    <path d="M18 14.5a5.5 5.5 0 0 1 2.5 5.5" />
  </Icon>
)

export const IconBadge = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3 5 6v5c0 4.4 3 8 7 10 4-2 7-5.6 7-10V6l-7-3Z" />
    <path d="m9.5 11.5 1.8 1.8 3.4-3.6" />
  </Icon>
)

export const IconSos = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4" />
    <path d="m5.6 5.6 3.6 3.6" />
    <path d="m14.8 14.8 3.6 3.6" />
    <path d="m18.4 5.6-3.6 3.6" />
    <path d="m9.2 14.8-3.6 3.6" />
  </Icon>
)

export const IconMap = (p: IconProps) => (
  <Icon {...p}>
    <path d="m3 6.5 6-2.5 6 2.5 6-2.5v13.5l-6 2.5-6-2.5-6 2.5V6.5Z" />
    <path d="M9 4v13.5" />
    <path d="M15 6.5V20" />
  </Icon>
)

export const IconGauge = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.5 16a8.5 8.5 0 1 1 17 0" />
    <path d="m12 16 4-5" />
    <circle cx="12" cy="16" r="1.2" />
  </Icon>
)

export const IconWrench = (p: IconProps) => (
  <Icon {...p}>
    <path d="M14.5 6.5a4 4 0 0 0 5.2 5.2l-8.4 8.4a2.1 2.1 0 0 1-3-3l8.4-8.4a4 4 0 0 1-5.2-5.2l2.6 2.6 2.4-.4.4-2.4-2.6-2.6" />
  </Icon>
)

export const IconUsers = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 20a6 6 0 0 1 12 0" />
    <path d="M16 4.8a3.2 3.2 0 0 1 0 6.4" />
    <path d="M17.5 14.2A6 6 0 0 1 21 20" />
  </Icon>
)

export const IconPhone = (p: IconProps) => (
  <Icon {...p}>
    <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
    <path d="M11 18.5h2" />
  </Icon>
)

export const IconDashboard = (p: IconProps) => (
  <Icon {...p}>
    <rect x="2.5" y="5" width="19" height="13" rx="2.5" />
    <path d="M7 18v2.5" />
    <path d="M17 18v2.5" />
    <path d="M6.5 13.5a5.5 5.5 0 0 1 11 0" />
    <path d="m12 13.5 2.2-2.6" />
  </Icon>
)

export const IconHeadset = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
    <rect x="3" y="14" width="4" height="6" rx="1.5" />
    <rect x="17" y="14" width="4" height="6" rx="1.5" />
  </Icon>
)

export const IconHome = (p: IconProps) => (
  <Icon {...p}>
    <path d="m3.5 11 8.5-7 8.5 7" />
    <path d="M5.5 9.5V20h13V9.5" />
    <path d="M10 20v-5.5h4V20" />
  </Icon>
)

export const IconDocument = (p: IconProps) => (
  <Icon {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
    <path d="M14 3v5h5" />
    <path d="M9 13h6" />
    <path d="M9 17h4" />
  </Icon>
)

export const IconClock = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Icon>
)

export const IconRoute = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="6" cy="18" r="2.5" />
    <circle cx="18" cy="6" r="2.5" />
    <path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5" />
  </Icon>
)

export const IconNavArrow = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3 5 20l7-4 7 4-7-17Z" />
  </Icon>
)

export const IconMail = (p: IconProps) => (
  <Icon {...p}>
    <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
    <path d="m3 6.5 9 6.5 9-6.5" />
  </Icon>
)

export const IconPin = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </Icon>
)

export const IconLock = (p: IconProps) => (
  <Icon {...p}>
    <rect x="4.5" y="10.5" width="15" height="10.5" rx="2" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
  </Icon>
)

export const IconSend = (p: IconProps) => (
  <Icon {...p}>
    <path d="M21 3 10.5 13.5" />
    <path d="M21 3 14.5 21l-4-7.5L3 9.5 21 3Z" />
  </Icon>
)

export const IconChat = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20.5 12a8 8 0 0 1-11.6 7.1L3.5 20.5l1.4-5.1A8 8 0 1 1 20.5 12Z" />
    <path d="M8.5 12h.01M12 12h.01M15.5 12h.01" strokeWidth={2.5} />
  </Icon>
)

export const IconGift = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.5" y="8" width="17" height="4" rx="1" />
    <path d="M5 12v8.5h14V12" />
    <path d="M12 8v12.5" />
    <path d="M12 8C10.5 4.5 7 4.5 7 6.5S10 8 12 8Zm0 0c1.5-3.5 5-3.5 5-1.5S14 8 12 8Z" />
  </Icon>
)

export const IconVolume = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4v-5Z" />
    <path d="M15.5 9a4.5 4.5 0 0 1 0 6" />
    <path d="M18 6.5a8 8 0 0 1 0 11" />
  </Icon>
)

export const IconVolumeOff = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4v-5Z" />
    <path d="m16 9.5 5 5" />
    <path d="m21 9.5-5 5" />
  </Icon>
)

export const IconSettings = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z" />
  </Icon>
)

export const IconBattery = (p: IconProps) => (
  <Icon {...p}>
    <rect x="2.5" y="7.5" width="17" height="9" rx="2" />
    <path d="M21.5 10.5v3" />
    <path d="M5.5 10.5v3M8.5 10.5v3M11.5 10.5v3M14.5 10.5v3" />
  </Icon>
)

export const IconWhatsApp = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M16.004 3C9.086 3 3.5 8.55 3.5 15.42c0 2.36.65 4.57 1.78 6.46L3 29l7.32-2.24a13.02 13.02 0 0 0 5.68 1.31h.005c6.92 0 12.5-5.55 12.5-12.42C28.5 8.78 22.92 3 16.004 3Zm0 22.7h-.004a10.6 10.6 0 0 1-5.4-1.48l-.387-.23-4.34 1.33 1.36-4.22-.253-.43a10.32 10.32 0 0 1-1.58-5.5c0-5.71 4.66-10.35 10.41-10.35 2.78 0 5.39 1.08 7.36 3.04a10.24 10.24 0 0 1 3.05 7.33c0 5.71-4.67 10.35-10.42 10.35Zm5.7-7.76c-.31-.16-1.85-.91-2.14-1.02-.29-.1-.5-.16-.71.16-.21.31-.81 1.02-1 1.23-.18.21-.37.23-.68.08-.31-.16-1.32-.49-2.51-1.55-.93-.83-1.56-1.85-1.74-2.16-.18-.31-.02-.48.14-.63.14-.14.31-.37.47-.55.16-.18.21-.31.31-.52.1-.21.05-.39-.02-.55-.08-.16-.71-1.72-.97-2.35-.26-.62-.52-.54-.71-.55h-.6c-.21 0-.55.08-.84.39-.29.31-1.1 1.08-1.1 2.63 0 1.55 1.13 3.05 1.29 3.26.16.21 2.22 3.4 5.39 4.76.75.33 1.34.52 1.8.66.76.24 1.44.21 1.99.13.61-.09 1.85-.76 2.11-1.49.26-.73.26-1.36.18-1.49-.08-.13-.29-.21-.6-.36Z" />
  </svg>
)
