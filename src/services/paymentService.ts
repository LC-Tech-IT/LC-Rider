import type { SubscriptionTier } from '../types'

export type WompiTransactionStatus = 'APPROVED' | 'DECLINED' | 'PENDING' | 'VOIDED' | 'ERROR'

interface WompiCheckoutParams {
  /** Monto en pesos colombianos (no en centavos — la conversión la hace este servicio). */
  amountInCOP: number
  reference: string
  customerEmail: string
  customerFullName?: string
  redirectUrl?: string
}

interface WompiCheckoutResult {
  status: WompiTransactionStatus
  transactionId?: string
  reference: string
}

interface WompiTransactionPayload {
  id: string
  status: WompiTransactionStatus
}

interface WompiWidgetInstance {
  open: (callback: (result: { transaction?: WompiTransactionPayload }) => void) => void
}

interface WompiWidgetConfig {
  currency: 'COP'
  amountInCents: number
  reference: string
  publicKey: string
  redirectUrl?: string
  customerData?: { email?: string; fullName?: string }
}

declare global {
  interface Window {
    WidgetCheckout?: new (config: WompiWidgetConfig) => WompiWidgetInstance
  }
}

const WOMPI_WIDGET_SRC = 'https://checkout.wompi.co/widget.js'
let widgetScriptPromise: Promise<void> | null = null

function loadWompiWidgetScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('La pasarela de pago no está disponible en este entorno.'))
  if (window.WidgetCheckout) return Promise.resolve()
  if (widgetScriptPromise) return widgetScriptPromise

  widgetScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = WOMPI_WIDGET_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      widgetScriptPromise = null
      reject(new Error('No se pudo cargar la pasarela de pago. Verifica tu conexión e intenta de nuevo.'))
    }
    document.head.appendChild(script)
  })
  return widgetScriptPromise
}

/**
 * Llave pública de Wompi, configurada vía variable de entorno (`VITE_WOMPI_PUBLIC_KEY`). Deliberadamente NO
 * existe aquí ningún secreto de integridad ni llave privada: esos valores firman transacciones en el backend
 * de Wompi y jamás deben viajar al bundle del cliente. Como este proyecto es una SPA sin backend propio, el
 * checkout se abre sin firma de integridad (modo soportado por Wompi); agregar la firma exigiría un endpoint
 * propio que la calcule del lado del servidor con el secreto de integridad guardado ahí, nunca en el frontend.
 */
export function getWompiPublicKey(): string | null {
  const key = import.meta.env.VITE_WOMPI_PUBLIC_KEY as string | undefined
  return typeof key === 'string' && key.trim().length > 0 ? key.trim() : null
}

/** Permite a la UI decidir, de forma segura, si debe abrir el checkout real o su alternativa simulada. */
export function isPaymentGatewayConfigured(): boolean {
  return getWompiPublicKey() !== null
}

export function buildPaymentReference(userId: string): string {
  return `LCR-SUB-${userId}-${Date.now()}`
}

/** Monto oficial en COP de cada combinación de plan/ciclo de facturación. */
export function getPlanAmountCOP(tier: Extract<SubscriptionTier, 'pro' | 'club'>, billingCycle: 'monthly' | 'yearly'): number {
  if (tier === 'club') return billingCycle === 'yearly' ? 299000 : 34900
  return billingCycle === 'yearly' ? 99000 : 14900
}

/**
 * Abre el Widget Checkout oficial de Wompi (PSE con más de 20 bancos, Nequi y tarjetas) y resuelve con el
 * resultado final de la transacción. El widget captura los datos sensibles de pago dentro de su propio
 * iframe seguro: este servicio nunca recibe ni procesa números de tarjeta, por exigencia de cumplimiento
 * PCI-DSS (ningún comercio sin certificación puede tocar esos datos directamente).
 */
export async function openWompiCheckout({
  amountInCOP,
  reference,
  customerEmail,
  customerFullName,
  redirectUrl,
}: WompiCheckoutParams): Promise<WompiCheckoutResult> {
  const publicKey = getWompiPublicKey()
  if (!publicKey) {
    throw new Error('La pasarela de pago no está configurada (falta VITE_WOMPI_PUBLIC_KEY).')
  }

  await loadWompiWidgetScript()
  if (!window.WidgetCheckout) {
    throw new Error('No se pudo inicializar la pasarela de pago.')
  }

  const checkout = new window.WidgetCheckout({
    currency: 'COP',
    amountInCents: Math.round(amountInCOP * 100),
    reference,
    publicKey,
    redirectUrl: redirectUrl ?? window.location.href,
    customerData: { email: customerEmail, fullName: customerFullName },
  })

  return new Promise((resolve) => {
    checkout.open((result) => {
      const transaction = result?.transaction
      resolve({
        status: transaction?.status ?? 'ERROR',
        transactionId: transaction?.id,
        reference,
      })
    })
  })
}
