insert into public.idioms (id, expression, meaning_ja, explanation_ja, hint_ja, level_band)
values
  ('reading-no5-001', 'Part 5 - by deadline', '期限を表す前置詞', '締切を表す by の使い分けを問う問題です。', '締切なら by を優先します。', '700'),
  ('reading-no5-002', 'Part 5 - adverb placement', '副詞 almost', 'almost の自然な位置を問う問題です。', '動詞を修飾する副詞を選びます。', '700'),
  ('reading-no5-003', 'Part 5 - eligible for', 'be eligible for', 'eligible for の定型表現を問う問題です。', '対象・資格には eligible を使います。', '730'),
  ('reading-no5-004', 'Part 5 - in advance', 'in advance', 'in advance の熟語を問う問題です。', '前置詞 in を含めた形で覚えます。', '700'),
  ('reading-no5-005', 'Part 5 - alike', 'A and B alike', 'alike の用法を問う問題です。', '並列された 2 対象をまとめて受けます。', '860'),
  ('reading-no5-006', 'Part 5 - subjunctive passive', '仮定法現在の受け身', 'request that it be revised の形を問う問題です。', 'that 節では be + 過去分詞に注意します。', '860'),
  ('reading-no5-007', 'Part 5 - outstanding', '評価の形容詞', 'outstanding performance の自然さを問う問題です。', '昇進理由にふさわしい前向きな語を選びます。', '730'),
  ('reading-no5-008', 'Part 5 - until', '延期先を示す until', 'postpone A until B の形を問う問題です。', '延期先なら until が自然です。', '700'),
  ('reading-no5-009', 'Part 5 - recommend + ing', 'recommend の後の動名詞', 'recommend の後の形を問う問題です。', '動詞を続けるなら動名詞が基本です。', '780'),
  ('reading-no5-010', 'Part 5 - as needed', 'as needed', 'as needed の定型表現を問う問題です。', 'needed を受ける副詞句を考えます。', '730'),
  ('reading-no5-011', 'Part 5 - adverb form', '副詞 completely', '副詞の品詞選択を問う問題です。', 'accurately と並ぶ副詞を選びます。', '780'),
  ('reading-no5-012', 'Part 5 - yet', '逆接の接続詞 yet', 'A yet B の逆接ニュアンスを問う問題です。', '簡潔だが情報量がある、の対比を見ます。', '860')
on conflict (id) do nothing;

insert into public.idiom_variants (idiom_id, variant, is_primary)
values
  ('reading-no5-001', 'by', true),
  ('reading-no5-002', 'almost', true),
  ('reading-no5-003', 'eligible', true),
  ('reading-no5-004', 'advance', true),
  ('reading-no5-005', 'alike', true),
  ('reading-no5-006', 'revised', true),
  ('reading-no5-007', 'outstanding', true),
  ('reading-no5-008', 'until', true),
  ('reading-no5-009', 'approving', true),
  ('reading-no5-010', 'as', true),
  ('reading-no5-011', 'completely', true),
  ('reading-no5-012', 'yet', true)
on conflict (idiom_id, variant) do nothing;

insert into public.questions (id, idiom_id, prompt_ja, question_type)
values
  ('q-reading-no5-001', 'reading-no5-001', 'All employees are required to submit their expense reports _____ Friday afternoon.', 'reading_no5'),
  ('q-reading-no5-002', 'reading-no5-002', 'The marketing team has _____ finalized the schedule for next month''s campaign.', 'reading_no5'),
  ('q-reading-no5-003', 'reading-no5-003', 'Customers who purchased the software last year are _____ for a free upgrade.', 'reading_no5'),
  ('q-reading-no5-004', 'reading-no5-004', 'Please keep in mind that all reservations must be canceled at least 24 hours in _____.', 'reading_no5'),
  ('q-reading-no5-005', 'reading-no5-005', 'The new safety guidelines will be distributed to factory workers and office staff _____.', 'reading_no5'),
  ('q-reading-no5-006', 'reading-no5-006', 'Because the original contract contained several errors, the legal department requested that it be _____.', 'reading_no5'),
  ('q-reading-no5-007', 'reading-no5-007', 'Ms. Baines was promoted to regional manager in recognition of her _____ sales performance.', 'reading_no5'),
  ('q-reading-no5-008', 'reading-no5-008', 'The conference room is unavailable this morning, so we will have to postpone the client meeting _____ this afternoon.', 'reading_no5'),
  ('q-reading-no5-009', 'reading-no5-009', 'The finance director recommended _____ the proposal once the cost estimates are complete.', 'reading_no5'),
  ('q-reading-no5-010', 'reading-no5-010', 'Mr. Ito will lead the orientation session, and Ms. Perez will assist him _____ needed.', 'reading_no5'),
  ('q-reading-no5-011', 'reading-no5-011', 'To avoid delays at customs, all shipping documents should be filled out _____ and accurately.', 'reading_no5'),
  ('q-reading-no5-012', 'reading-no5-012', 'The research summary was concise _____ informative, which helped the board make a quick decision.', 'reading_no5')
on conflict (id) do nothing;
