create extension if not exists pgcrypto;

create table if not exists public.idioms (
  id text primary key,
  expression text not null,
  meaning_ja text not null,
  explanation_ja text not null,
  hint_ja text not null,
  level_band text not null check (level_band in ('700', '730', '780', '860')),
  created_at timestamptz not null default now()
);

create table if not exists public.idiom_variants (
  id uuid primary key default gen_random_uuid(),
  idiom_id text not null references public.idioms(id) on delete cascade,
  variant text not null,
  is_primary boolean not null default false,
  unique (idiom_id, variant)
);

create table if not exists public.questions (
  id text primary key,
  idiom_id text not null references public.idioms(id) on delete cascade,
  prompt_ja text not null,
  question_type text not null default 'ja_to_idiom',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.user_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null references public.questions(id) on delete cascade,
  answer_text text not null,
  normalized_answer text not null,
  is_correct boolean not null,
  score numeric(4,2) not null,
  judgment text not null check (judgment in ('correct', 'almost_correct', 'incorrect')),
  correct_answer text not null,
  feedback_ja text not null,
  error_tags text[] not null default '{}',
  source text not null default 'rule',
  answered_at timestamptz not null default now()
);

create table if not exists public.review_queue (
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null references public.questions(id) on delete cascade,
  due_at timestamptz not null,
  interval_days integer not null,
  consecutive_correct integer not null default 0,
  last_judgment text not null check (last_judgment in ('correct', 'almost_correct', 'incorrect')),
  last_answer_id uuid references public.user_answers(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

create table if not exists public.llm_judgment_cache (
  id uuid primary key default gen_random_uuid(),
  question_id text not null references public.questions(id) on delete cascade,
  normalized_answer text not null,
  result jsonb not null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (question_id, normalized_answer)
);

create index if not exists user_answers_user_id_answered_at_idx
  on public.user_answers(user_id, answered_at desc);

create index if not exists review_queue_user_id_due_at_idx
  on public.review_queue(user_id, due_at asc);

alter table public.idioms enable row level security;
alter table public.idiom_variants enable row level security;
alter table public.questions enable row level security;
alter table public.user_answers enable row level security;
alter table public.review_queue enable row level security;
alter table public.llm_judgment_cache enable row level security;

drop policy if exists "idioms are readable" on public.idioms;
create policy "idioms are readable"
  on public.idioms for select
  using (true);

drop policy if exists "idiom variants are readable" on public.idiom_variants;
create policy "idiom variants are readable"
  on public.idiom_variants for select
  using (true);

drop policy if exists "questions are readable" on public.questions;
create policy "questions are readable"
  on public.questions for select
  using (true);

drop policy if exists "users read own answers" on public.user_answers;
create policy "users read own answers"
  on public.user_answers for select
  using (auth.uid() = user_id);

drop policy if exists "users insert own answers" on public.user_answers;
create policy "users insert own answers"
  on public.user_answers for insert
  with check (auth.uid() = user_id);

drop policy if exists "users read own review queue" on public.review_queue;
create policy "users read own review queue"
  on public.review_queue for select
  using (auth.uid() = user_id);

drop policy if exists "users upsert own review queue" on public.review_queue;
create policy "users upsert own review queue"
  on public.review_queue for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "authenticated users read llm cache" on public.llm_judgment_cache;
create policy "authenticated users read llm cache"
  on public.llm_judgment_cache for select
  using (auth.role() = 'authenticated');

drop policy if exists "authenticated users write llm cache" on public.llm_judgment_cache;
create policy "authenticated users write llm cache"
  on public.llm_judgment_cache for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

insert into public.idioms (id, expression, meaning_ja, explanation_ja, hint_ja, level_band)
values
  ('put-off', 'put off', '延期する', '予定や会議、締切などを先に延ばす時に使います。', '予定を後ろに送るイメージです。', '700'),
  ('carry-out', 'carry out', '実行する', '計画や調査、業務などを実施する時の定番表現です。', 'plan や survey と一緒に出やすい熟語です。', '700'),
  ('make-up-for', 'make up for', '埋め合わせる', '遅れや不足、損失などを補う意味で使います。', 'for を忘れやすい熟語です。', '730'),
  ('go-over', 'go over', '見直す', '資料や数字、計画などを一通り確認する時に使います。', 'review に近い場面で使われます。', '700'),
  ('figure-out', 'figure out', '理解する', '問題の答えや原因を理解して突き止めるニュアンスです。', 'out が抜けやすいです。', '730'),
  ('hand-in', 'hand in', '提出する', 'レポートや申請書を提出する時に使えます。', '書類を出すイメージです。', '700'),
  ('turn-down', 'turn down', '断る', '提案や申し出を断る時に使われます。', 'offer を断る文脈で頻出です。', '730'),
  ('set-up', 'set up', '設立する', '会社や会議を立ち上げる文脈で幅広く使えます。', 'up を忘れないようにします。', '700'),
  ('deal-with', 'deal with', '対処する', '問題や顧客対応などに取り組む時の基本表現です。', 'with までがセットです。', '700'),
  ('fill-out', 'fill out', '記入する', 'フォームやアンケートに必要事項を書く時に使います。', 'out/in の両方が出ます。', '700'),
  ('bring-about', 'bring about', '引き起こす', '変化や結果を生み出す時に使われます。', 'cause に近い意味です。', '780'),
  ('point-out', 'point out', '指摘する', '問題点や事実をはっきり示す時に使います。', 'out の有無で意味が変わります。', '700'),
  ('keep-up-with', 'keep up with', '遅れずについていく', '変化の速い仕事や情報に追いつく時の表現です。', 'with まで全部覚える必要があります。', '780'),
  ('run-out-of', 'run out of', '使い果たす', '時間・在庫・予算などがなくなる時に使います。', 'of を抜かしやすいです。', '730'),
  ('come-up-with', 'come up with', '思いつく', '案や解決策を考えつく時に使われます。', 'with が必要です。', '780'),
  ('look-into', 'look into', '調査する', '問題や依頼内容を詳しく調べる時に使います。', 'investigate に近い意味です。', '730'),
  ('take-over', 'take over', '引き継ぐ', '業務や担当、会社の経営を引き継ぐ時に使われます。', 'over が重要です。', '730'),
  ('work-on', 'work on', '取り組む', '課題や企画、改善に対して継続的に作業する表現です。', 'project と一緒に出やすいです。', '700'),
  ('cut-back-on', 'cut back on', '減らす', 'コストや時間、支出を削減する時に自然です。', 'on まで含めて覚えます。', '780'),
  ('leave-out', 'leave out', '省く', '情報や項目を意図的に除外する時に使います。', 'out で外に出すイメージです。', '730')
on conflict (id) do nothing;

insert into public.idiom_variants (idiom_id, variant, is_primary)
values
  ('put-off', 'put off', true),
  ('carry-out', 'carry out', true),
  ('make-up-for', 'make up for', true),
  ('go-over', 'go over', true),
  ('figure-out', 'figure out', true),
  ('hand-in', 'hand in', true),
  ('hand-in', 'turn in', false),
  ('turn-down', 'turn down', true),
  ('set-up', 'set up', true),
  ('deal-with', 'deal with', true),
  ('fill-out', 'fill out', true),
  ('fill-out', 'fill in', false),
  ('bring-about', 'bring about', true),
  ('point-out', 'point out', true),
  ('keep-up-with', 'keep up with', true),
  ('run-out-of', 'run out of', true),
  ('come-up-with', 'come up with', true),
  ('look-into', 'look into', true),
  ('take-over', 'take over', true),
  ('work-on', 'work on', true),
  ('cut-back-on', 'cut back on', true),
  ('leave-out', 'leave out', true)
on conflict (idiom_id, variant) do nothing;

insert into public.questions (id, idiom_id, prompt_ja, question_type)
values
  ('q-put-off', 'put-off', '延期する', 'ja_to_idiom'),
  ('q-carry-out', 'carry-out', '実行する', 'ja_to_idiom'),
  ('q-make-up-for', 'make-up-for', '埋め合わせる', 'ja_to_idiom'),
  ('q-go-over', 'go-over', '見直す', 'ja_to_idiom'),
  ('q-figure-out', 'figure-out', '理解する', 'ja_to_idiom'),
  ('q-hand-in', 'hand-in', '提出する', 'ja_to_idiom'),
  ('q-turn-down', 'turn-down', '断る', 'ja_to_idiom'),
  ('q-set-up', 'set-up', '設立する', 'ja_to_idiom'),
  ('q-deal-with', 'deal-with', '対処する', 'ja_to_idiom'),
  ('q-fill-out', 'fill-out', '記入する', 'ja_to_idiom'),
  ('q-bring-about', 'bring-about', '引き起こす', 'ja_to_idiom'),
  ('q-point-out', 'point-out', '指摘する', 'ja_to_idiom'),
  ('q-keep-up-with', 'keep-up-with', '遅れずについていく', 'ja_to_idiom'),
  ('q-run-out-of', 'run-out-of', '使い果たす', 'ja_to_idiom'),
  ('q-come-up-with', 'come-up-with', '思いつく', 'ja_to_idiom'),
  ('q-look-into', 'look-into', '調査する', 'ja_to_idiom'),
  ('q-take-over', 'take-over', '引き継ぐ', 'ja_to_idiom'),
  ('q-work-on', 'work-on', '取り組む', 'ja_to_idiom'),
  ('q-cut-back-on', 'cut-back-on', '減らす', 'ja_to_idiom'),
  ('q-leave-out', 'leave-out', '省く', 'ja_to_idiom')
on conflict (id) do nothing;
