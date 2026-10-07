-- Iteración 2: eventos
-- Cada evento lo crea un organizador. Todos pueden verlos y solo su dueño puede editarlos y borrarlos.

create table public.eventos (
  id              uuid primary key default gen_random_uuid(),
  organizador_id  uuid not null references public.perfiles (id) on delete cascade,
  titulo          text not null check (char_length(trim(titulo)) > 0),
  descripcion     text,
  fecha           timestamptz not null,
  ciudad          text not null check (char_length(trim(ciudad)) > 0),
  lugar           text,
  genero          text check (genero in ('techno', 'house', 'reggaeton', 'pop', 'rock', 'comercial', 'otro')),
  presupuesto     numeric(10, 2) check (presupuesto >= 0),
  estado          text not null default 'abierto' check (estado in ('abierto', 'cerrado', 'completado')),
  creado_en       timestamptz not null default now()
);

-- Control de acceso (RLS)
alter table public.eventos enable row level security;

-- Los eventos son públicos (también para usuarios sin autenticar)
create policy "Eventos visibles para todos"
  on public.eventos for select
  using (true);

-- Solo un organizador puede crear eventos, y siempre a su nombre
create policy "Los organizadores crean sus eventos"
  on public.eventos for insert
  to authenticated
  with check (
    auth.uid() = organizador_id
    and exists (
      select 1 from public.perfiles
      where id = auth.uid() and rol = 'organizador'
    )
  );

-- Solo el dueño del evento puede editarlo
create policy "El organizador edita sus eventos"
  on public.eventos for update
  to authenticated
  using (auth.uid() = organizador_id)
  with check (auth.uid() = organizador_id);

-- Solo el dueño del evento puede borrarlo
create policy "El organizador borra sus eventos"
  on public.eventos for delete
  to authenticated
  using (auth.uid() = organizador_id);

-- Columnas permitidas: al crear no se puede elegir el estado (empieza en 'abierto'),
-- y al editar no se puede cambiar el organizador ni la fecha de creación
revoke insert, update on public.eventos from anon, authenticated;
grant insert (organizador_id, titulo, descripcion, fecha, ciudad, lugar, genero, presupuesto)
  on public.eventos to authenticated;
grant update (titulo, descripcion, fecha, ciudad, lugar, genero, presupuesto, estado)
  on public.eventos to authenticated;
