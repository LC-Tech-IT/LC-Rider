import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders })
    }

    const { reference, amountInCents, currency = 'COP' } = await req.json()

    // Validación estricta: solo firmar referencias oficiales de LC Rider y montos autorizados
    const ALLOWED_AMOUNTS = [1490000, 9900000, 3490000, 29900000] // $14.900, $99.000, $34.900, $299.000 COP
    if (
      !reference ||
      typeof reference !== 'string' ||
      !reference.startsWith('LCR-SUB-') ||
      !amountInCents ||
      !ALLOWED_AMOUNTS.includes(Number(amountInCents)) ||
      currency !== 'COP'
    ) {
      return new Response(JSON.stringify({ error: 'Invalid reference, currency or amount for LC Rider plans' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const integritySecret = Deno.env.get('WOMPI_INTEGRITY_SECRET') || ''
    if (!integritySecret) {
      console.error('[wompi-firma] WOMPI_INTEGRITY_SECRET no está configurado')
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Concatenación según especificación oficial de Wompi:
    // referencia + montoEnCentavos + moneda + secretoIntegridad
    const stringToHash = `${reference}${amountInCents}${currency}${integritySecret}`

    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(stringToHash)
    )
    const signature = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    return new Response(JSON.stringify({ signature, reference, amountInCents, currency }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

