import { ADDITIONAL_IDIOM_SUPPORT_20260314 } from "@/lib/data/idiom-expansion-20260314";

export const IDIOM_SUPPORT: Record<
  string,
  {
    exampleEn: string;
    exampleJa: string;
    collocationHintJa: string;
    commonMistakeJa: string;
  }
> = {
  "put-off": {
    exampleEn: "We decided to put off the meeting until Friday.",
    exampleJa: "会議は金曜日まで延期することにしました。",
    collocationHintJa: "meeting, deadline, decision と一緒に出やすいです。",
    commonMistakeJa: "off を抜かして put だけにしないことが大事です。",
  },
  "carry-out": {
    exampleEn: "The team will carry out a customer survey this month.",
    exampleJa: "チームは今月、顧客アンケートを実施します。",
    collocationHintJa: "survey, plan, experiment との組み合わせが定番です。",
    commonMistakeJa: "do と混同しやすいですが、carry out は実施まで含む表現です。",
  },
  "make-up-for": {
    exampleEn: "We need to make up for the delay as soon as possible.",
    exampleJa: "その遅れをできるだけ早く埋め合わせる必要があります。",
    collocationHintJa: "delay, loss, shortage と相性が良いです。",
    commonMistakeJa: "for までセットで覚えないと別表現になります。",
  },
  "go-over": {
    exampleEn: "Please go over the report before the meeting.",
    exampleJa: "会議前にその報告書を見直してください。",
    collocationHintJa: "report, schedule, figures を確認するときに使えます。",
    commonMistakeJa: "look over と似ていますが、go over は細かく見直す響きがあります。",
  },
  "figure-out": {
    exampleEn: "We finally figured out the cause of the problem.",
    exampleJa: "私たちはついにその問題の原因を理解しました。",
    collocationHintJa: "cause, solution, way と一緒に覚えると使いやすいです。",
    commonMistakeJa: "out を落としやすいので、最後まで言い切る意識が必要です。",
  },
  "hand-in": {
    exampleEn: "All applicants must hand in the form by noon.",
    exampleJa: "応募者は全員、正午までにその用紙を提出しなければなりません。",
    collocationHintJa: "report, form, application が頻出です。",
    commonMistakeJa: "turn in も正解ですが、hand in の方が覚えやすいなら軸にすると安定します。",
  },
  "turn-down": {
    exampleEn: "She turned down the job offer politely.",
    exampleJa: "彼女はその内定を丁寧に断りました。",
    collocationHintJa: "offer, request, proposal とよく一緒に出ます。",
    commonMistakeJa: "turn off と混ざりやすいので、断る対象を思い浮かべると整理しやすいです。",
  },
  "set-up": {
    exampleEn: "They set up a new office in Osaka last year.",
    exampleJa: "彼らは昨年、大阪に新しい事務所を設立しました。",
    collocationHintJa: "company, office, meeting, system と結びつけやすい表現です。",
    commonMistakeJa: "setup は名詞、set up は動詞なので書き分けに注意します。",
  },
  "deal-with": {
    exampleEn: "Our support team deals with customer complaints every day.",
    exampleJa: "サポートチームは毎日、顧客からの苦情に対処しています。",
    collocationHintJa: "problem, complaint, issue と組み合わせて覚えると強いです。",
    commonMistakeJa: "with が抜けると不自然になるので、最後までまとめて覚えます。",
  },
  "fill-out": {
    exampleEn: "Please fill out this form before your appointment.",
    exampleJa: "予約の前にこの用紙に記入してください。",
    collocationHintJa: "form, application, questionnaire が定番です。",
    commonMistakeJa: "fill in も近いですが、問題で求められている形を確認しましょう。",
  },
  "bring-about": {
    exampleEn: "The policy change brought about a major improvement.",
    exampleJa: "その方針転換は大きな改善を引き起こしました。",
    collocationHintJa: "change, improvement, result と一緒に使われやすいです。",
    commonMistakeJa: "about が抜けると意味が崩れるので、後半を強く意識します。",
  },
  "point-out": {
    exampleEn: "The manager pointed out a mistake in the proposal.",
    exampleJa: "部長は提案書の誤りを指摘しました。",
    collocationHintJa: "mistake, issue, problem, difference と相性が良いです。",
    commonMistakeJa: "point のみでは足りないので、out を含めて一語感覚で覚えます。",
  },
  "keep-up-with": {
    exampleEn: "We need to keep up with market trends.",
    exampleJa: "私たちは市場動向に遅れずについていく必要があります。",
    collocationHintJa: "trend, demand, technology, schedule がよく続きます。",
    commonMistakeJa: "with まで含めて熟語なので、途中で切らないことが重要です。",
  },
  "run-out-of": {
    exampleEn: "We ran out of paper during the presentation.",
    exampleJa: "プレゼン中に紙を使い果たしてしまいました。",
    collocationHintJa: "time, money, paper, stock との組み合わせが基本です。",
    commonMistakeJa: "of を忘れやすいので、run out of まで口でつなげて覚えます。",
  },
  "come-up-with": {
    exampleEn: "The team came up with a practical solution.",
    exampleJa: "チームは実用的な解決策を思いつきました。",
    collocationHintJa: "idea, solution, plan, proposal が続きやすいです。",
    commonMistakeJa: "with を落とすと不自然になりやすいので、後半を意識します。",
  },
  "look-into": {
    exampleEn: "We will look into the cause of the delay.",
    exampleJa: "その遅れの原因を調査します。",
    collocationHintJa: "issue, complaint, cause, request を調べる文脈で頻出です。",
    commonMistakeJa: "look at と混ざりやすいですが、詳しく調べる時は look into です。",
  },
  "take-over": {
    exampleEn: "She will take over the project next month.",
    exampleJa: "彼女は来月、その案件を引き継ぎます。",
    collocationHintJa: "project, role, task, business と組み合わせやすいです。",
    commonMistakeJa: "over が抜けると意味が弱くなるので、引き継ぐ動きまで覚えます。",
  },
  "work-on": {
    exampleEn: "We are working on a new marketing plan.",
    exampleJa: "私たちは新しいマーケティング計画に取り組んでいます。",
    collocationHintJa: "project, proposal, improvement, task が続きやすいです。",
    commonMistakeJa: "work for や work with と混同しないよう、対象に向かう on を意識します。",
  },
  "cut-back-on": {
    exampleEn: "The company needs to cut back on travel expenses.",
    exampleJa: "会社は出張費を減らす必要があります。",
    collocationHintJa: "cost, expense, spending, overtime と相性が良いです。",
    commonMistakeJa: "on まで含めて覚えないと、何を減らすかがぼやけます。",
  },
  "leave-out": {
    exampleEn: "Do not leave out any important details.",
    exampleJa: "重要な詳細を何も省かないでください。",
    collocationHintJa: "detail, item, information を省く文脈で使われます。",
    commonMistakeJa: "leave alone と混ざりやすいので、out で外すイメージを持つと覚えやすいです。",
  },
  "call-off": {
    exampleEn: "They called off the event because of the weather.",
    exampleJa: "天候のため、そのイベントは中止されました。",
    collocationHintJa: "meeting, event, trip, game が典型です。",
    commonMistakeJa: "cancel の置き換えとして覚え、off を落とさないことが大切です。",
  },
  "check-in": {
    exampleEn: "Guests can check in after 3 p.m.",
    exampleJa: "宿泊客は午後3時以降にチェックインできます。",
    collocationHintJa: "hotel, airport, counter と一緒に出やすいです。",
    commonMistakeJa: "名詞の check-in と動詞の check in を文脈で区別しましょう。",
  },
  "take-on": {
    exampleEn: "She decided to take on a new role this year.",
    exampleJa: "彼女は今年、新しい役割を引き受けることにしました。",
    collocationHintJa: "role, task, client, responsibility と結びつけやすいです。",
    commonMistakeJa: "take over との違いは、引き受けるか引き継ぐかです。",
  },
  "back-up": {
    exampleEn: "The report backs up the manager's claim with data.",
    exampleJa: "その報告書は、データで部長の主張を裏付けています。",
    collocationHintJa: "claim, statement, idea, decision を支える文脈で使えます。",
    commonMistakeJa: "backup は名詞、back up は動詞として出る点に注意します。",
  },
  "look-forward-to": {
    exampleEn: "We look forward to working with you.",
    exampleJa: "一緒にお仕事できることを楽しみにしております。",
    collocationHintJa: "hearing, seeing, meeting, working が後ろに来やすいです。",
    commonMistakeJa: "to の後ろは名詞か動名詞になる点をよく間違えます。",
  },
  "go-through": {
    exampleEn: "The company went through a difficult period last year.",
    exampleJa: "その会社は昨年、厳しい時期を経験しました。",
    collocationHintJa: "process, document, period, change の文脈で使えます。",
    commonMistakeJa: "through を落とすと別の意味になるので、最後まで必ず含めます。",
  },
  "follow-up-on": {
    exampleEn: "I will follow up on your request tomorrow.",
    exampleJa: "明日、その依頼について追跡確認します。",
    collocationHintJa: "request, email, client inquiry, discussion と相性が良いです。",
    commonMistakeJa: "on まである形とない形の両方がありますが、問題の正答を優先して覚えます。",
  },
  "put-together": {
    exampleEn: "She put together the presentation in one afternoon.",
    exampleJa: "彼女は半日でプレゼン資料をまとめ上げました。",
    collocationHintJa: "presentation, report, proposal, team をまとめる時に使えます。",
    commonMistakeJa: "put up や put off と混ざりやすいので、together の意味を意識します。",
  },
  "set-aside": {
    exampleEn: "We set aside part of the budget for training.",
    exampleJa: "私たちは研修のために予算の一部を取っておきました。",
    collocationHintJa: "budget, seat, time, money を確保する文脈が定番です。",
    commonMistakeJa: "aside で脇に分けておくイメージを持つと定着しやすいです。",
  },
  "break-down": {
    exampleEn: "The printer broke down again this morning.",
    exampleJa: "そのプリンターは今朝また故障しました。",
    collocationHintJa: "machine, car, negotiation, system が主語になりやすいです。",
    commonMistakeJa: "人が落ち込む意味でも使えますが、まずは故障する意味を軸に覚えると整理しやすいです。",
  },
  "draw-up": {
    exampleEn: "The lawyer drew up the contract yesterday.",
    exampleJa: "弁護士は昨日、その契約書を作成しました。",
    collocationHintJa: "contract, list, plan, proposal を作る文脈で出やすいです。",
    commonMistakeJa: "draw だけでは描く意味に寄るので、up まで含めて覚えます。",
  },
  "reach-out-to": {
    exampleEn: "Please reach out to the client this afternoon.",
    exampleJa: "今日の午後、その顧客に連絡してください。",
    collocationHintJa: "client, customer, team member, partner と一緒に使いやすいです。",
    commonMistakeJa: "to を落としやすいので、相手に向かう感覚までまとめて覚えます。",
  },
  "pass-out": {
    exampleEn: "The staff passed out the materials before the session.",
    exampleJa: "スタッフは開始前に資料を配布しました。",
    collocationHintJa: "material, sample, flyer, document が典型です。",
    commonMistakeJa: "気絶する意味もありますが、TOEIC では配布する意味で見分けることが多いです。",
  },
  ...ADDITIONAL_IDIOM_SUPPORT_20260314,
};
