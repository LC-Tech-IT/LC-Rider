-- =====================================================================
-- LC RIDER — SPRINT 58: PAGO PRIMERO (INVITADOS) + CIERRE DE ACTIVACIÓN DE PLANES
-- =====================================================================
-- Ejecuta este script COMPLETO en el SQL Editor de Supabase:
-- https://supabase.com/dashboard/project/bzltbdqwbizvhlrnghmq/sql
--
-- Reemplaza a DATABASE-PENDING-SUBSCRIPTIONS.sql (no hace falta correr ese). Es idempotente: se puede ejecutar
-- más de una vez. Requiere haber corrido antes DATABASE-SECURITY-HARDENING.sql (ya aplicado en producción).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. TRIGGER ANTI-FRAUDE CORREGIDO (el de DATABASE-SECURITY-HARDENING.sql NO protegía)
--    Era "security definer" y preguntaba por current_user: dentro de una función security definer current_user
--    siempre es el dueño (postgres), así que la condición nunca se cumplía y cualquier usuario podía hacer
--    PATCH /profiles {tier:'club', subscription_expires_at:'2099-01-01'} sobre su fila (verificado en producción).
--    Ahora se decide por el rol del JWT de la petición: solo 'authenticated' y 'anon' quedan bloqueados.
--    service_role (webhook), el SQL Editor y el registro de Supabase Auth no envían ese rol y sí pueden escribir.
-- ---------------------------------------------------------------------
create or replace function public.is_end_user_request()
returns boolean
language sql
stable
as $$
  select coalesce(current_setting('request.jwt.claims', true)::jsonb->>'role', '') in ('authenticated', 'anon')
$$;

create or replace function public.protect_profile_subscription_fields()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if public.is_end_user_request() then
    new.tier := old.tier;
    new.subscription_expires_at := old.subscription_expires_at;
    new.club_name := old.club_name;
    new.club_code := old.club_code;
  end if;
  return new;
end;
$$;

drop trigger if exists tr_protect_profile_subscription on public.profiles;
create trigger tr_protect_profile_subscription
  before update on public.profiles
  for each row execute procedure public.protect_profile_subscription_fields();

-- ---------------------------------------------------------------------
-- 1. ACTIVACIÓN DE PLANES SOLO DESDE EL BACKEND
--    Antes: cualquiera (incluso sin sesión) podía llamar /rpc/activate_user_subscription y darse Club.
--    Ahora: renovar el mismo plan suma días sobre el vencimiento vigente; cambiar de plan cuenta desde hoy.
-- ---------------------------------------------------------------------
create or replace function public.activate_user_subscription(
  target_user_id uuid,
  new_tier text,
  duration_days int,
  new_club_name text default null,
  new_club_code text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if new_tier not in ('pro', 'club') or duration_days <= 0 then
    raise exception 'Plan o duración inválidos';
  end if;

  update public.profiles
  set
    subscription_expires_at = case
      when tier = new_tier and subscription_expires_at > now()
        then subscription_expires_at + make_interval(days => duration_days)
      else now() + make_interval(days => duration_days)
    end,
    tier = new_tier,
    club_name = new_club_name,
    club_code = new_club_code,
    updated_at = now()
  where id = target_user_id;
end;
$$;

revoke execute on function public.activate_user_subscription(uuid, text, int, text, text) from public, anon, authenticated;
grant execute on function public.activate_user_subscription(uuid, text, int, text, text) to service_role;

-- ---------------------------------------------------------------------
-- 2. PAGOS DE INVITADOS AÚN SIN CUENTA (los escribe solo el webhook con service_role)
-- ---------------------------------------------------------------------
create table if not exists public.pending_subscriptions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  tier text not null check (tier in ('pro', 'club')),
  duration_days int not null check (duration_days > 0),
  transaction_id text,
  reference text,
  claimed boolean not null default false,
  claimed_by_user_id uuid references auth.users(id) on delete set null,
  claimed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Una transacción de Wompi solo puede registrarse una vez (los reintentos del webhook no duplican planes).
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'pending_subscriptions_transaction_id_key') then
    alter table public.pending_subscriptions add constraint pending_subscriptions_transaction_id_key unique (transaction_id);
  end if;
end $$;

create index if not exists pending_subscriptions_email_open_idx
  on public.pending_subscriptions (lower(email)) where claimed = false;

-- RLS activo y SIN políticas: anon/authenticated no pueden leer ni escribir; service_role ignora RLS.
alter table public.pending_subscriptions enable row level security;
drop policy if exists "pending_subscriptions_service_only" on public.pending_subscriptions;
revoke all on table public.pending_subscriptions from anon, authenticated;

-- ---------------------------------------------------------------------
-- 3. INSERCIONES DE PERFIL DESDE EL CLIENTE SIEMPRE NACEN EN 'free'
--    (el trigger de Sprint 33 crea el perfil como security definer; un INSERT directo del cliente no puede
--    traer un plan de pago). Se llama "tr_a_..." para ejecutarse ANTES que el trigger de reclamo.
-- ---------------------------------------------------------------------
create or replace function public.guard_profile_insert_subscription()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_end_user_request() then
    new.tier := 'free';
    new.subscription_expires_at := null;
    new.club_name := null;
    new.club_code := null;
  end if;
  return new;
end;
$$;

drop trigger if exists tr_a_guard_profile_insert on public.profiles;
create trigger tr_a_guard_profile_insert
  before insert on public.profiles
  for each row execute procedure public.guard_profile_insert_subscription();

-- ---------------------------------------------------------------------
-- 4. AL CREARSE LA CUENTA (correo o Google), SE APLICAN LOS PAGOS PENDIENTES DE ESE CORREO
--    Si hay varios pagos sin reclamar (p. ej. mensual + anual), se suman todos.
-- ---------------------------------------------------------------------
create or replace function public.claim_pending_subscription_for_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  latest record;
  total_days int;
  account_email text;
begin
  -- Se usa el correo REAL de la cuenta (auth.users), nunca el que venga en la fila: así nadie puede reclamar el pago
  -- de otra persona insertando un perfil con un correo ajeno.
  select email into account_email from auth.users where id = new.id;
  if account_email is null then
    return new;
  end if;
  new.email := account_email;

  select tier into latest
  from public.pending_subscriptions
  where lower(trim(email)) = lower(trim(account_email)) and claimed = false
  order by (tier = 'club') desc, created_at desc
  limit 1;

  if not found then
    return new;
  end if;

  select coalesce(sum(duration_days), 0) into total_days
  from public.pending_subscriptions
  where lower(trim(email)) = lower(trim(account_email)) and claimed = false;

  new.tier := latest.tier;
  new.subscription_expires_at := now() + make_interval(days => total_days);

  update public.pending_subscriptions
  set claimed = true, claimed_by_user_id = new.id, claimed_at = now()
  where lower(trim(email)) = lower(trim(account_email)) and claimed = false;

  return new;
end;
$$;

-- Solo al crear el perfil: con "update of email" el trigger anti-fraude revertiría el plan y la fila quedaría
-- marcada como reclamada sin aplicarse.
drop trigger if exists tr_claim_pending_subscription on public.profiles;
create trigger tr_claim_pending_subscription
  before insert on public.profiles
  for each row execute procedure public.claim_pending_subscription_for_user();

revoke execute on function public.claim_pending_subscription_for_user() from public, anon, authenticated;
revoke execute on function public.guard_profile_insert_subscription() from public, anon, authenticated;

-- =====================================================================
-- VERIFICACIÓN (debe devolver false en las tres columnas)
-- Prueba manual del anti-fraude: con la sesión de un usuario normal, PATCH /rest/v1/profiles?id=eq.<su id>
-- {"tier":"club"} debe responder 204 pero el tier debe seguir igual.
-- =====================================================================
select
  has_function_privilege('anon', 'public.activate_user_subscription(uuid, text, int, text, text)', 'execute') as anon_puede_activar,
  has_function_privilege('authenticated', 'public.activate_user_subscription(uuid, text, int, text, text)', 'execute') as usuario_puede_activar,
  has_table_privilege('anon', 'public.pending_subscriptions', 'select') as anon_lee_pendientes;

-- =====================================================================
-- OPERACIÓN MANUAL (pagos por QR Bancolombia / Nequi, tras verificar el comprobante)
-- =====================================================================
-- a) El piloto YA tiene cuenta (busca su id por correo):
--    select public.activate_user_subscription(
--      (select id from public.profiles where lower(email) = lower('correo@cliente.com')),
--      'pro',   -- o 'club'
--      395      -- 30 mensual · 395 anual por QR (365 + 30 de regalo)
--    );
--
-- b) El piloto AÚN no tiene cuenta: el plan se aplica solo cuando se registre con ese correo (o con Google):
--    insert into public.pending_subscriptions (email, tier, duration_days, reference)
--    values (lower('correo@cliente.com'), 'pro', 395, 'QR-LCR-SUB-...');
