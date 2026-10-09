import type { ConvoyMember, LatLng, RouteInfo } from '../types'
import { pointAtProgress } from '../services/routingService'

function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

interface TickOptions {
  members: ConvoyMember[]
  route: RouteInfo
  deltaSeconds: number
  /** multiplier to speed up/slow down the whole simulation */
  timeScale?: number
  /** Si es true, el miembro actual (isCurrentUser) no se avanza aquí porque su posición ya la controla el GPS real. */
  skipCurrentUser?: boolean
}

const BASE_SPEED_KMH_BY_ROLE: Record<ConvoyMember['role'], number> = {
  lider: 62,
  piloto: 58,
  guardian: 50,
}

export function tickConvoySimulation({ members, route, deltaSeconds, timeScale = 1, skipCurrentUser = false }: TickOptions): ConvoyMember[] {
  const scaledDelta = deltaSeconds * timeScale

  const advanced = members.map((member) => {
    if (skipCurrentUser && member.isCurrentUser) {
      return member
    }
    if (member.status === 'sos' || member.status === 'offline') {
      return { ...member, speedKmh: 0 }
    }

    const baseSpeed = BASE_SPEED_KMH_BY_ROLE[member.role]
    const jitter = Math.sin(Date.now() / 1500 + member.id.length) * 6
    const laggardPenalty = member.status === 'rezagado' ? 14 : 0
    const speedKmh = Math.max(8, baseSpeed + jitter - laggardPenalty)

    const distanceKm = (speedKmh * scaledDelta) / 3600
    const progressDelta = route.distanceKm > 0 ? distanceKm / route.distanceKm : 0
    const routeProgress = Math.min(1, member.routeProgress + progressDelta)
    const position = pointAtProgress(route.coordinates, routeProgress)

    return { ...member, routeProgress, position, speedKmh }
  })

  const leader = advanced.find((m) => m.role === 'lider') ?? advanced[0]

  return advanced.map((member) => {
    const distanceToLeaderKm = leader ? haversineKm(member.position, leader.position) : 0
    let status = member.status
    if (status !== 'sos' && status !== 'offline') {
      status = distanceToLeaderKm > 1.2 ? 'rezagado' : 'en-ruta'
    }
    return { ...member, distanceToLeaderKm, status }
  })
}

export function resetMembersToPosition(members: ConvoyMember[], start: LatLng): ConvoyMember[] {
  return members.map((member) => ({
    ...member,
    position: start,
    routeProgress: 0,
    speedKmh: 0,
    distanceToLeaderKm: 0,
    status: member.status === 'offline' ? 'offline' : 'en-ruta',
  }))
}

/** Convoy real (no Modo Demo): arranca solo con el piloto actual, sin miembros ficticios. */
export function createSoloMember(start: LatLng, currentUserPlate?: string): ConvoyMember[] {
  return [
    {
      id: 'me',
      name: 'Tú',
      avatarEmoji: '🏍️',
      role: 'lider',
      status: 'en-ruta',
      position: start,
      routeProgress: 0,
      speedKmh: 0,
      distanceToLeaderKm: 0,
      isCurrentUser: true,
      vehiclePlate: currentUserPlate,
    },
  ]
}

export function createInitialConvoyMembers(start: LatLng, currentUserPlate: string): ConvoyMember[] {
  return [
    {
      id: 'user',
      name: 'Tú',
      avatarEmoji: '🏍️',
      role: 'lider',
      status: 'en-ruta',
      position: start,
      routeProgress: 0,
      speedKmh: 0,
      distanceToLeaderKm: 0,
      isCurrentUser: true,
      vehiclePlate: currentUserPlate,
    },
    {
      id: 'p2',
      name: 'Camilo R.',
      avatarEmoji: '🧑‍🦱',
      role: 'piloto',
      status: 'en-ruta',
      position: start,
      routeProgress: 0,
      speedKmh: 0,
      distanceToLeaderKm: 0,
      vehiclePlate: 'MCP412',
    },
    {
      id: 'p3',
      name: 'Valentina G.',
      avatarEmoji: '👩',
      role: 'piloto',
      status: 'en-ruta',
      position: start,
      routeProgress: 0,
      speedKmh: 0,
      distanceToLeaderKm: 0,
      vehiclePlate: 'RTX880',
    },
    {
      id: 'p4',
      name: 'Julián P.',
      avatarEmoji: '🧔',
      role: 'guardian',
      status: 'en-ruta',
      position: start,
      routeProgress: 0,
      speedKmh: 0,
      distanceToLeaderKm: 0,
      vehiclePlate: 'XKT205',
    },
  ]
}
