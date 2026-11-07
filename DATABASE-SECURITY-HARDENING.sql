-- =====================================================================
-- 🛡️ LC RIDER — BLINDAJE DE SEGURIDAD, HABEAS DATA Y PROTECCIÓN DE PLANES
-- =====================================================================
-- Ejecuta este script en el SQL Editor de tu proyecto en Supabase:
-- https://supabase.com/dashboard/project/bzltbdqwbizvhlrnghmq/sql
-- =====================================================================

-- 1. CORREGIR FUGA DE DATOS PERSONALES EN PROFILES (LEY 1581 DE 2012)
-- Elimina la política pública que permitía a cualquiera leer todos los usuarios.
drop policy if exists "Perfiles son públicos para lectura" on public.profiles;

-- Política de lectura estricta: un usuario solo lee su propio perfil completo.
drop policy if exists "Usuarios leen su propio perfil" on public.profiles;
create policy "Usuarios leen su propio perfil"
  on public.profiles for select
  using (auth.uid() = id);

-- 2. BLOQUEO DE AUTO-ACTIVACIÓN DE PLANES POR EL USUARIO (ANTI-FRAUDE)
-- Crea una función y trigger que impide que el cliente (rol authenticated o anon)
-- altere su propio tier o fecha de expiración mediante la API REST.
create or replace function public.protect_profile_subscription_fields()
returns trigger as $$
begin
  -- Si la petición viene de un usuario autenticado normal (no service_role ni postgres)
  if (current_user != 'postgres' and coalesce(current_setting('request.jwt.claims', true)::jsonb->>'role', '') != 'service_role') then
    -- Si intenta modificar tier, subscription_expires_at, club_name o club_code, conserva los valores anteriores
    if (new.tier is distinct from old.tier) or 
       (new.subscription_expires_at is distinct from old.subscription_expires_at) or
       (new.club_name is distinct from old.club_name) or
       (new.club_code is distinct from old.club_code) then
      new.tier := old.tier;
      new.subscription_expires_at := old.subscription_expires_at;
      new.club_name := old.club_name;
      new.club_code := old.club_code;
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists tr_protect_profile_subscription on public.profiles;
create trigger tr_protect_profile_subscription
  before update on public.profiles
  for each row execute procedure public.protect_profile_subscription_fields();

-- 3. FUNCIÓN SEGURA PARA ACTIVAR PLANES DESDE EL BACKEND / WEBHOOK / ADMIN
-- Solo puede ser ejecutada por service_role o administradores autorizados.
create or replace function public.activate_user_subscription(
  target_user_id uuid,
  new_tier text,
  duration_days int,
  new_club_name text default null,
  new_club_code text default null
)
returns void as $$
begin
  update public.profiles
  set 
    tier = new_tier,
    subscription_expires_at = timezone('utc'::text, now()) + (duration_days || ' days')::interval,
    club_name = new_club_name,
    club_code = new_club_code,
    updated_at = timezone('utc'::text, now())
  where id = target_user_id;
end;
$$ language plpgsql security definer;

-- 4. BLINDAJE DE TELEMETRÍA Y CONVOY (SOLO USUARIOS AUTENTICADOS)
-- Impide que usuarios anónimos lean o inserten en convoys, convoy_members y sos_alerts
drop policy if exists "Salas de convoy accesibles para lectura y creación" on public.convoys;
create policy "Convoys accesibles para usuarios autenticados"
  on public.convoys for all
  using (auth.role() = 'authenticated');

drop policy if exists "Miembros de convoy accesibles en tiempo real" on public.convoy_members;
create policy "Miembros de convoy solo para usuarios autenticados"
  on public.convoy_members for all
  using (auth.role() = 'authenticated');

drop policy if exists "Alertas SOS accesibles en tiempo real" on public.sos_alerts;
create policy "Alertas SOS solo para usuarios autenticados"
  on public.sos_alerts for all
  using (auth.role() = 'authenticated');

