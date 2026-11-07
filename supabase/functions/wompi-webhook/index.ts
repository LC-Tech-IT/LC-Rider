import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/** Matriz Oficial de Precios y Planes de LC Rider */
const LC_RIDER_PLANS: Record<number, { tier: 'pro' | 'club', days: number }> = {
  1490000:  { tier: 'pro',  days: 30 },  // $14.900 COP - Pro Mensual
  9900000:  { tier: 'pro',  days: 365 }, // $99.000 COP - Pro Anual
  3490000:  { tier: 'club', days: 30 },  // $34.900 COP - Club Mensual
  29900000: { tier: 'club', days: 365 }, // $299.000 COP - Club Anual
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders })
    }

    const payload = await req.json()
    console.log('[LC Rider Webhook] Evento recibido:', JSON.stringify(payload))

    const { event, data, signature, timestamp } = payload
    const transaction = data?.transaction

    if (!transaction) {
      return new Response(JSON.stringify({ error: 'No transaction data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 1. BLINDAJE ANTIFRAUDE ESTRICTO: La firma es obligatoria.
    const eventsSecret = Deno.env.get('WOMPI_EVENTS_SECRET') || ''
    if (!eventsSecret || !signature?.properties || !signature?.checksum || timestamp === undefined) {
      console.error('[LC Rider Webhook] Intento de acceso sin firma o sin WOMPI_EVENTS_SECRET')
      return new Response(JSON.stringify({ error: 'Missing signature, timestamp or events secret' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Concatenación según especificación oficial de Wompi:
    // Propiedades relativas a data (ej. data.transaction.id + data.transaction.status + data.transaction.amount_in_cents)
    // + timestamp + secreto de eventos
    const properties = signature.properties as string[]
    let stringToHash = ''
    for (const prop of properties) {
      const parts = prop.split('.')
      let val: any = data
      for (const part of parts) {
        val = val?.[part]
      }
      stringToHash += String(val)
    }
    stringToHash += String(timestamp)
    stringToHash += eventsSecret

    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(stringToHash)
    )
    const calculatedChecksum = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    if (calculatedChecksum.toLowerCase() !== String(signature.checksum).toLowerCase()) {
      console.error('[LC Rider Webhook] Firma inválida detectada:', { calculatedChecksum, received: signature.checksum })
      return new Response(JSON.stringify({ error: 'Invalid signature checksum' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('[LC Rider Webhook] Firma criptográfica SHA-256 verificada con éxito.')

    const reference = String(transaction.reference || '')
    const status = String(transaction.status || '')
    const amountInCents = Number(transaction.amount_in_cents || 0)

    // 2. Solo activar cuando el estado de Wompi es APPROVED
    if (status !== 'APPROVED') {
      console.log(`[LC Rider Webhook] Transacción ${transaction.id} con estado no aprobado: ${status}`)
      return new Response(JSON.stringify({ received: true, status }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 3. Validar monto oficial del plan
    const planConfig = LC_RIDER_PLANS[amountInCents]
    if (!planConfig) {
      console.error(`[LC Rider Webhook] Monto no reconocido: ${amountInCents} centavos`)
      return new Response(JSON.stringify({ error: 'Amount does not match any official plan' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 4. Inicializar cliente Supabase con Service Role
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole)

    // 5. Destinatario del plan:
    //    - Con cuenta: LCR-SUB-<uuid>-<timestamp>.
    //    - Invitado:   LCR-SUB-G<correo en hex>-<timestamp>. El correo va dentro de la referencia firmada, así que manda
    //      sobre transaction.customer_email (el cliente puede cambiar el correo prellenado dentro del widget).
    //    - Referencias antiguas sin correo: se usa transaction.customer_email.
    let targetUserId: string | null = null
    let payerEmail = transaction.customer_email ? String(transaction.customer_email).trim().toLowerCase() : ''
    const guestMatch = reference.match(/^LCR-SUB-G([0-9a-f]+)-\d+$/)
    if (guestMatch && guestMatch[1].length % 2 === 0) {
      try {
        const bytes = new Uint8Array(guestMatch[1].match(/../g)!.map((h) => parseInt(h, 16)))
        const decoded = new TextDecoder().decode(bytes).trim().toLowerCase()
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(decoded)) payerEmail = decoded
      } catch {
        /* referencia malformada: se conserva customer_email */
      }
    }
    const uuidMatch = reference.match(/LCR-SUB-([0-9a-fA-F-]{36})-/)
    if (uuidMatch) {
      targetUserId = uuidMatch[1]
    } else if (payerEmail) {
      const email = payerEmail
      const { data: userProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle()
      if (userProfile?.id) {
        targetUserId = userProfile.id
      }
    }

    if (!targetUserId) {
      if (payerEmail) {
        const cleanEmail = payerEmail
        console.log(`[LC Rider Webhook] Usuario aún no registrado para email: ${cleanEmail}. Guardando en pending_subscriptions.`)
        // upsert idempotente: un reintento de Wompi con la misma transacción no duplica el plan.
        const { error: insertPendingError } = await supabaseAdmin
          .from('pending_subscriptions')
          .upsert(
            {
              email: cleanEmail,
              tier: planConfig.tier,
              duration_days: planConfig.days,
              transaction_id: String(transaction.id || ''),
              reference: reference
            },
            { onConflict: 'transaction_id', ignoreDuplicates: true }
          )

        if (insertPendingError) {
          // Nunca responder 200 si el pago no quedó guardado: con 500 Wompi reintenta (30 min, 3 h y 24 h).
          console.error('[LC Rider Webhook] Error al guardar en pending_subscriptions:', insertPendingError)
          return new Response(JSON.stringify({ error: 'Could not store pending subscription' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(
          JSON.stringify({
            success: true,
            pendingRegistration: true,
            email: cleanEmail,
            tier: planConfig.tier,
            durationDays: planConfig.days,
            reference,
            transactionId: transaction.id
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.error('[LC Rider Webhook] No se encontró usuario para reference:', reference, 'ni email:', transaction.customer_email)
      return new Response(JSON.stringify({ error: 'User not found for payment' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 6. Activar plan mediante función de base de datos
    const { error: rpcError } = await supabaseAdmin.rpc('activate_user_subscription', {
      target_user_id: targetUserId,
      new_tier: planConfig.tier,
      duration_days: planConfig.days,
      new_club_name: null,
      new_club_code: null,
    })

    if (rpcError) {
      console.error('[LC Rider Webhook] Error en activate_user_subscription:', rpcError)
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          tier: planConfig.tier,
          subscription_expires_at: new Date(Date.now() + planConfig.days * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', targetUserId)

      if (updateError) {
        console.error('[LC Rider Webhook] Error en fallback update:', updateError)
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    console.log(`[LC Rider Webhook] ¡PLAN ACTIVADO CON ÉXITO! Usuario ${targetUserId} -> ${planConfig.tier.toUpperCase()} (${planConfig.days} días)`)

    return new Response(
      JSON.stringify({
        success: true,
        activated: {
          userId: targetUserId,
          tier: planConfig.tier,
          durationDays: planConfig.days,
          reference,
          transactionId: transaction.id
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error('[LC Rider Webhook] Excepción no controlada:', errorMsg)
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
