-- Iteración 4: propuestas
-- Un DJ envía una propuesta de sesión a un evento abierto. La ven el DJ que la envía y el organizador del evento,
-- y solo el DJ que la envía puede retirarla.

create table public.propuestas (
  id                uuid primary key default gen_random_uuid(),
  evento_id         uuid not null references public.eventos (id) on delete cascade,
  dj_id             uuid not null references public.perfiles (id) on delete cascade,
  precio            numeric(10, 2) not null check (precio >= 0),
  duracion_minutos  integer not null check (duracion_minutos between 1 and 720),
  descripcion       text check (char_length(descripcion) <= 1000),
  estado            text not null default 'pendiente' check (estado in ('pendiente')),
  creado_en         timestamptz not null default now(),
  -- Un DJ solo puede enviar una propuesta a cada evento
  unique (evento_id, dj_id)
);

-- Control de acceso (RLS)
alter table public.propuestas enable row level security;

-- Una propuesta la ven el DJ que la envía y el organizador del evento
create policy "El DJ y el organizador ven las propuestas"
  on public.propuestas for select
  to authenticated
  using (
    auth.uid() = dj_id
    or exists (
      select 1 from public.eventos
      where id = evento_id and organizador_id = auth.uid()
    )
  );

-- Solo un DJ puede enviar propuestas, siempre a su nombre y a un evento abierto
create policy "Los DJs envían propuestas a eventos abiertos"
  on public.propuestas for insert
  to authenticated
  with check (
    auth.uid() = dj_id
    and exists (
      select 1 from public.perfiles
      where id = auth.uid() and rol = 'dj'
    )
    and exists (
      select 1 from public.eventos
      where id = evento_id and estado = 'abierto'
    )
  );

-- Solo el DJ que envió la propuesta puede retirarla
create policy "El DJ retira sus propuestas"
  on public.propuestas for delete
  to authenticated
  using (auth.uid() = dj_id);

-- Sin política de update: las propuestas no se modifican.
-- Columnas permitidas al crear: no se puede elegir el estado (empieza en 'pendiente')
revoke insert, update on public.propuestas from anon, authenticated;
grant insert (evento_id, dj_id, precio, duracion_minutos, descripcion)
  on public.propuestas to authenticated;
