-- =====================================================================
-- 🛡️ LC RIDER — BLINDAJE DE SEGURIDAD DEFINITIVO Y HABEAS DATA
-- =====================================================================
-- Ejecuta este script en el SQL Editor de tu proyecto en Supabase:
-- https://supabase.com/dashboard/project/bzltbdqwbizvhlrnghmq/sql
-- =====================================================================

-- 1. ELIMINAR TODAS LAS POLÍTICAS PREVIAS EN PROFILES (Cierra cualquier fuga pública)
do $$
declare
  r record;
begin
  for r in (select policyname from pg_policies where schemaname = 'public' and tablename = 'profiles') loop
    execute format('drop policy if exists %I on public.profiles', r.policyname);
  end loop;
end $$;

-- 2. ASEGURAR QUE RLS ESTÉ HABILITADO
alter table public.profiles enable row level security;

-- 3. POLÍTICAS ESTRICTAS (Cero lectura anónima, cada usuario solo accede a su fila)
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 4. BLOQUEO DE AUTO-ACTIVACIÓN DE PLANES POR EL USUARIO (ANTI-FRAUDE)
create or replace function public.protect_profile_subscription_fields()
returns trigger as $$
begin
  -- Si la petición viene de un usuario autenticado normal (no service_role ni postgres)
  if (current_user != 'postgres' and coalesce(current_setting('request.jwt.claims', true)::jsonb->>'role', '') != 'service_role') then
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

-- 5. FUNCIÓN SEGURA PARA ACTIVAR PLANES DESDE EL BACKEND / WEBHOOK / ADMIN
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

-- 6. BLINDAJE DE TELEMETRÍA Y CONVOY (SOLO USUARIOS AUTENTICADOS)
do $$
declare
  r record;
begin
  for r in (select policyname from pg_policies where schemaname = 'public' and tablename = 'convoys') loop
    execute format('drop policy if exists %I on public.convoys', r.policyname);
  end loop;
  for r in (select policyname from pg_policies where schemaname = 'public' and tablename = 'convoy_members') loop
    execute format('drop policy if exists %I on public.convoy_members', r.policyname);
  end loop;
  for r in (select policyname from pg_policies where schemaname = 'public' and tablename = 'sos_alerts') loop
    execute format('drop policy if exists %I on public.sos_alerts', r.policyname);
  end loop;
end $$;

alter table public.convoys enable row level security;
alter table public.convoy_members enable row level security;
alter table public.sos_alerts enable row level security;

create policy "convoys_authenticated"
  on public.convoys for all
  using (auth.role() = 'authenticated');

create policy "convoy_members_authenticated"
  on public.convoy_members for all
  using (auth.role() = 'authenticated');

create policy "sos_alerts_authenticated"
  on public.sos_alerts for all
  using (auth.role() = 'authenticated');
