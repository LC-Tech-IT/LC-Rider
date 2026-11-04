import type { ComponentType, ReactNode, SVGProps } from 'react'

/** Set de iconos vectoriales de trazo fino (estilo Lucide/Garmin) compartido por la app y la landing. Heredan el color del texto
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

export const IconMenu = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 6.5h16" />
    <path d="M4 12h16" />
    <path d="M4 17.5h16" />
  </Icon>
)

export const IconBell = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 9.5a6 6 0 0 1 12 0c0 5.5 2.5 7 2.5 7h-17S6 15 6 9.5Z" />
    <path d="M10 20a2.2 2.2 0 0 0 4 0" />
  </Icon>
)

export const IconUser = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="8.5" r="4" />
    <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
  </Icon>
)

export const IconChevronDown = (p: IconProps) => (
  <Icon {...p}>
    <path d="m6 9 6 6 6-6" />
  </Icon>
)

export const IconExit = (p: IconProps) => (
  <Icon {...p}>
    <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
    <path d="M10 16.5 5.5 12 10 7.5" />
    <path d="M5.5 12H15" />
  </Icon>
)

export const IconStar = (p: IconProps) => (
  <Icon {...p}>
    <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.9L12 3.5Z" />
  </Icon>
)

export const IconPlus = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </Icon>
)

export const IconX = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 6l12 12" />
    <path d="M18 6 6 18" />
  </Icon>
)

export const IconTarget = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="7.5" />
    <circle cx="12" cy="12" r="2.5" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
  </Icon>
)

export const IconLayers = (p: IconProps) => (
  <Icon {...p}>
    <path d="m12 3 9 5-9 5-9-5 9-5Z" />
    <path d="m3 12.5 9 5 9-5" />
    <path d="m3 16.5 9 5 9-5" />
  </Icon>
)

/** Silueta lateral de motocicleta deportiva/naked: tanque esculpido (lazo cerrado), asiento rebajado con colín
 *  elevado, horquilla invertida inclinada con semimanillar, carenaje frontal, bloque de motor y basculante. */
export const IconMotorcycle = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="5" cy="17" r="3.2" />
    <circle cx="19" cy="17" r="3.2" />
    <path d="M19 17 15.8 8.6" />
    <path d="M14.6 8h2.8" />
    <path d="M16.6 10.3l3.2 1.2" />
    <path d="M15.4 10.2c-1.6-1.3-4-1.5-5.9-.6l-1.3 1.6H5.6L2.4 9.4" />
    <path d="M8.2 11.2c.4 2.3 1.8 3.7 4 3.7h3.1l.9-3" />
    <path d="M5 17l4-3.5" />
    <path d="M10.6 14.9 12 17h4" />
  </Icon>
)

export const IconTrash = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
  </Icon>
)

export const IconPaperclip = (p: IconProps) => (
  <Icon {...p}>
    <path d="m20 11.5-8.2 8.2a5 5 0 0 1-7.1-7.1l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4l7.8-7.8" />
  </Icon>
)

export const IconCar = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.5 16.5V12l2-5A2 2 0 0 1 7.4 5.7h9.2a2 2 0 0 1 1.9 1.3l2 5v4.5" />
    <path d="M3.5 12h17" />
    <rect x="2.5" y="12" width="19" height="5" rx="1.5" />
    <path d="M5.5 17v2M18.5 17v2" />
    <path d="M6.5 14.5h1.5M16 14.5h1.5" />
  </Icon>
)

export const IconCrown = (p: IconProps) => (
  <Icon {...p}>
    <path d="m3 7.5 4.5 4L12 5l4.5 6.5L21 7.5l-2 10H5l-2-10Z" />
    <path d="M5 20.5h14" />
  </Icon>
)

export const IconPause = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 5v14" />
    <path d="M15 5v14" />
  </Icon>
)

export const IconPlay = (p: IconProps) => (
  <Icon {...p}>
    <path d="M7 4.5v15l12-7.5-12-7.5Z" />
  </Icon>
)

export const IconSquare = (p: IconProps) => (
  <Icon {...p}>
    <rect x="5.5" y="5.5" width="13" height="13" rx="1.5" />
  </Icon>
)

/** Bandera de meta a cuadros (fin de ruta). */
export const IconFlagCheckered = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 21V4" />
    <path d="M5 4h14v10H5" />
    <path d="M8.5 4v3.3M15.5 4v3.3M12 7.3v3.4M8.5 10.7V14M15.5 10.7V14" />
    <path d="M5 7.3h14M5 10.7h14" />
  </Icon>
)

export const IconTrafficLight = (p: IconProps) => (
  <Icon {...p}>
    <rect x="7.5" y="2.5" width="9" height="16" rx="3" />
    <circle cx="12" cy="6.5" r="1.4" />
    <circle cx="12" cy="10.5" r="1.4" />
    <circle cx="12" cy="14.5" r="1.4" />
    <path d="M12 18.5v3" />
  </Icon>
)

export const IconLifeBuoy = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="3.8" />
    <path d="m5.6 5.6 3.7 3.7M14.7 14.7l3.7 3.7M18.4 5.6l-3.7 3.7M9.3 14.7l-3.7 3.7" />
  </Icon>
)

export const IconRotateCw = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20 12a8 8 0 1 1-2.3-5.6" />
    <path d="M20 4v5h-5" />
  </Icon>
)

export const IconSearch = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </Icon>
)

export const IconBuilding = (p: IconProps) => (
  <Icon {...p}>
    <rect x="5" y="3" width="14" height="18" rx="1.5" />
    <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" />
    <path d="M10.5 21v-3h3v3" />
  </Icon>
)

export const IconCity = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 21h18" />
    <path d="M4.5 21V10h5v11" />
    <path d="M9.5 21V4h7v17" />
    <path d="M16.5 21v-8h3.5v8" />
    <path d="M12 7.5h2M12 11h2M12 14.5h2" />
  </Icon>
)

export const IconBed = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 19V6" />
    <path d="M3 15h18v4" />
    <path d="M21 15v-3a3 3 0 0 0-3-3h-7v6" />
    <circle cx="7" cy="11.5" r="2" />
  </Icon>
)

export const IconMountain = (p: IconProps) => (
  <Icon {...p}>
    <path d="m2.5 20 7-12 4 6.5 2.5-3.5 5.5 9h-19Z" />
    <path d="m7.5 11.5 2-1 2 1" />
  </Icon>
)

export const IconBank = (p: IconProps) => (
  <Icon {...p}>
    <path d="m3 9 9-5 9 5" />
    <path d="M4 9h16" />
    <path d="M6 9v8M10 9v8M14 9v8M18 9v8" />
    <path d="M3.5 20.5h17M4.5 17h15" />
  </Icon>
)

export const IconCard = (p: IconProps) => (
  <Icon {...p}>
    <rect x="2.5" y="5" width="19" height="14" rx="2" />
    <path d="M2.5 9.5h19" />
    <path d="M6 15h4" />
  </Icon>
)

export const IconCheckCircle = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12.5 2.8 2.8L16.5 9.5" />
  </Icon>
)

export const IconZap = (p: IconProps) => (
  <Icon {...p}>
    <path d="M13 2.5 4.5 13.5H12l-1 8 8.5-11H12l1-8Z" />
  </Icon>
)

/* ─────────────── Maniobras de navegación paso a paso ─────────────── */

export const IconNavStraight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 21V4" />
    <path d="m6 10 6-6 6 6" />
  </Icon>
)

export const IconNavTurnLeft = (p: IconProps) => (
  <Icon {...p}>
    <path d="M16 21v-8a4 4 0 0 0-4-4H5" />
    <path d="m9 5-4 4 4 4" />
  </Icon>
)

export const IconNavTurnRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M8 21v-8a4 4 0 0 1 4-4h7" />
    <path d="m15 5 4 4-4 4" />
  </Icon>
)

export const IconNavUturn = (p: IconProps) => (
  <Icon {...p}>
    <path d="M7 21V9a5 5 0 0 1 10 0v5" />
    <path d="m13 10.5 4 4 4-4" />
  </Icon>
)

export const IconNavRoundabout = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="10" r="4" />
    <path d="M12 14v7" />
    <path d="M15 7l3.5-3.5" />
    <path d="M14.5 3.5h4v4" />
  </Icon>
)

export const IconNavMerge = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 21v-7L6 7.5V3" />
    <path d="M12 14l6-6.5V3" />
  </Icon>
)

export const IconNavArrive = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 21s-6.5-5.8-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.2 12 21 12 21Z" />
    <path d="m9.5 10 1.8 1.8 3.4-3.6" />
  </Icon>
)

/** Icono de cada acción rápida en ruta (ver quickActions.ts). Trazo grueso para lectura bajo sol directo. */
export type QuickActionIconId = 'fuel' | 'hazard' | 'regroup' | 'police'

const QUICK_ACTION_ICON_MAP: Record<QuickActionIconId, ComponentType<IconProps>> = {
  fuel: IconFuel,
  hazard: IconAlert,
  regroup: IconRegroup,
  police: IconBadge,
}

export function QuickActionIcon({ id, ...props }: IconProps & { id: QuickActionIconId }) {
  const Component = QUICK_ACTION_ICON_MAP[id]
  return <Component strokeWidth={2.25} {...props} />
}
