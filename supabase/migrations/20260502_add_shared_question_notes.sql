create table if not exists public.shared_question_notes (
  question_id text primary key references public.questions(id) on delete cascade,
  content text not null,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create index if not exists shared_question_notes_updated_at_idx
  on public.shared_question_notes(updated_at desc);

alter table public.shared_question_notes enable row level security;

drop policy if exists "shared question notes are readable" on public.shared_question_notes;
create policy "shared question notes are readable"
  on public.shared_question_notes for select
  using (true);

drop policy if exists "authenticated users write shared question notes" on public.shared_question_notes;
create policy "authenticated users write shared question notes"
  on public.shared_question_notes for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
