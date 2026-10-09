-- =====================================================================
-- 🏍️ BIKE TRACKER — SCRIPT DE CONFIGURACIÓN DE BASE DE DATOS (SUPABASE)
-- =====================================================================
-- Ejecuta este script completo en el SQL Editor de tu proyecto en Supabase:
-- https://supabase.com/dashboard/project/bzltbdqwbizvhlrnghmq/sql
-- =====================================================================

-- 1. EXTENSIONES NECESARIAS
create extension if not exists "uuid-ossp";

-- 2. TABLA DE PERFILES DE USUARIOS (Vinculada a auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  name text not null,
  last_name text,
  gender text,
  phone text,
  avatar_url text default '🏍️',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. TABLA DE VEHÍCULOS / GARAJE / SOAT
create table if not exists public.vehicles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  plate text not null,
  brand text not null,
  model text not null,
  category text default 'sport',
  type text default 'moto',
  color text default '#FF5500',
  avatar_emoji text default '🏍️',
  soat_expires_at date,
  tecnomecanica_expires_at date,
  plan_active boolean default true,
  plan_expires_at date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. TABLA DE SALAS DE CONVOY
create table if not exists public.convoys (
  id uuid default gen_random_uuid() primary key,
  pin text unique not null,
  name text not null,
  created_by uuid references public.profiles(id) on delete set null,
  route_data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. TABLA DE TELEMETRÍA EN VIVO Y MIEMBROS DE CONVOY
create table if not exists public.convoy_members (
  id uuid default gen_random_uuid() primary key,
  convoy_pin text references public.convoys(pin) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  avatar_emoji text default '🏍️',
  plate text,
  role text default 'rider', -- 'leader', 'guardian', 'rider'
  status text default 'en-ruta', -- 'en-ruta', 'rezagado', 'sos', 'offline'
  latitude double precision not null,
  longitude double precision not null,
  speed_kmh double precision default 0,
  route_progress double precision default 0,
  last_ping timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. TABLA DE ALERTAS SOS Y EMERGENCIAS
create table if not exists public.sos_alerts (
  id uuid default gen_random_uuid() primary key,
  convoy_pin text references public.convoys(pin) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade not null,
  member_name text not null,
  latitude double precision not null,
  longitude double precision not null,
  message text default 'Alerta SOS de emergencia activada',
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. HABILITAR PUBLICACIÓN EN TIEMPO REAL (REALTIME)
alter publication supabase_realtime add table public.convoy_members;
alter publication supabase_realtime add table public.sos_alerts;

-- 8. SEGURIDAD A NIVEL DE FILAS (ROW LEVEL SECURITY - RLS)
alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.convoys enable row level security;
alter table public.convoy_members enable row level security;
alter table public.sos_alerts enable row level security;

-- Políticas de Seguridad (RLS Policies)
create policy "Perfiles son públicos para lectura" 
  on public.profiles for select using (true);

create policy "Usuarios gestionan su propio perfil" 
  on public.profiles for all using (auth.uid() = id);

create policy "Usuarios gestionan sus propios vehículos" 
  on public.vehicles for all using (auth.uid() = user_id);

create policy "Salas de convoy accesibles para lectura y creación" 
  on public.convoys for all using (true);

create policy "Miembros de convoy accesibles en tiempo real" 
  on public.convoy_members for all using (true);

create policy "Alertas SOS accesibles en tiempo real" 
  on public.sos_alerts for all using (true);

-- 9. TRIGGER AUTOMÁTICO PARA CREAR PERFIL TRAS REGISTRO EN AUTH.USERS
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, last_name, gender, phone, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.raw_user_meta_data->>'gender', 'unspecified'),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '🏍️')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger disparador
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
