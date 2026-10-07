-- Iteración 1: perfiles de usuario
-- Cada usuario de Supabase Auth (auth.users) tiene un perfil público con su rol.

create table public.perfiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  nombre     text not null check (char_length(trim(nombre)) between 2 and 80),
  rol        text not null check (rol in ('organizador', 'dj')),
  ciudad     text check (char_length(ciudad) <= 80),
  bio        text check (char_length(bio) <= 1000),
  creado_en  timestamptz not null default now()
);

-- Crear el perfil automáticamente al registrarse, con los datos enviados en signUp (options.data)
create function public.crear_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfiles (id, nombre, rol, ciudad)
  values (
    new.id,
    new.raw_user_meta_data ->> 'nombre',
    new.raw_user_meta_data ->> 'rol',
    new.raw_user_meta_data ->> 'ciudad'
  );
  return new;
end;
$$;

create trigger al_registrar_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil();

-- Control de acceso (RLS)
alter table public.perfiles enable row level security;

-- Los perfiles son públicos (también para usuarios sin autenticar)
create policy "Perfiles visibles para todos"
  on public.perfiles for select
  using (true);

-- Cada usuario solo puede editar su propio perfil
create policy "Cada usuario edita su perfil"
  on public.perfiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- El rol no se puede cambiar después del registro: solo se permite actualizar estas columnas
revoke update on public.perfiles from anon, authenticated;
grant update (nombre, ciudad, bio) on public.perfiles to authenticated;
