create table if not exists public.checked_idioms (
  user_id uuid not null references auth.users(id) on delete cascade,
  idiom_id text not null references public.idioms(id) on delete cascade,
  checked_at timestamptz not null default now(),
  primary key (user_id, idiom_id)
);

create index if not exists checked_idioms_user_id_idx
  on public.checked_idioms(user_id);

alter table public.checked_idioms enable row level security;

drop policy if exists "users read own checked idioms" on public.checked_idioms;
create policy "users read own checked idioms"
  on public.checked_idioms for select
  using (auth.uid() = user_id);

drop policy if exists "users write own checked idioms" on public.checked_idioms;
create policy "users write own checked idioms"
  on public.checked_idioms for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
