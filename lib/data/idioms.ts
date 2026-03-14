import { ADDITIONAL_IDIOMS_20260314_BATCH3 } from "@/lib/data/idiom-expansion-20260314-batch3";
import { ADDITIONAL_IDIOMS_20260314_BATCH2 } from "@/lib/data/idiom-expansion-20260314-batch2";
import { ADDITIONAL_IDIOMS_20260314 } from "@/lib/data/idiom-expansion-20260314";
import { IDIOM_SUPPORT } from "@/lib/data/idiom-support";
import type { IdiomSeed, StudyQuestion } from "@/lib/types";

export const IDIOM_BANK: IdiomSeed[] = [
  {
    id: "put-off",
    expression: "put off",
    meaningJa: "延期する",
    variants: ["put off"],
    explanationJa: "予定や会議、締切などを先に延ばす時に使います。",
    hintJa: "予定を後ろに送るイメージです。",
    levelBand: "700",
  },
  {
    id: "carry-out",
    expression: "carry out",
    meaningJa: "実行する",
    variants: ["carry out"],
    explanationJa: "計画や調査、業務などを実施する時の定番表現です。",
    hintJa: "plan や survey と一緒に出やすい熟語です。",
    levelBand: "700",
  },
  {
    id: "make-up-for",
    expression: "make up for",
    meaningJa: "埋め合わせる",
    variants: ["make up for"],
    explanationJa: "遅れや不足、損失などを補う意味で使います。",
    hintJa: "for を忘れやすい熟語です。",
    levelBand: "730",
  },
  {
    id: "go-over",
    expression: "go over",
    meaningJa: "見直す",
    variants: ["go over"],
    explanationJa: "資料や数字、計画などを一通り確認する時に使います。",
    hintJa: "review に近い場面で使われます。",
    levelBand: "700",
  },
  {
    id: "figure-out",
    expression: "figure out",
    meaningJa: "理解する",
    variants: ["figure out"],
    explanationJa: "問題の答えや原因を理解して突き止めるニュアンスです。",
    hintJa: "out が抜けやすいです。",
    levelBand: "730",
  },
  {
    id: "hand-in",
    expression: "hand in",
    meaningJa: "提出する",
    variants: ["hand in", "turn in"],
    explanationJa: "レポートや申請書を提出する時に使えます。",
    hintJa: "書類を出すイメージです。",
    levelBand: "700",
  },
  {
    id: "turn-down",
    expression: "turn down",
    meaningJa: "断る",
    variants: ["turn down"],
    explanationJa: "提案や申し出を断る時に使われます。",
    hintJa: "offer を断る文脈で頻出です。",
    levelBand: "730",
  },
  {
    id: "set-up",
    expression: "set up",
    meaningJa: "設立する",
    variants: ["set up"],
    explanationJa: "会社や会議を立ち上げる文脈で幅広く使えます。",
    hintJa: "up を忘れないようにします。",
    levelBand: "700",
  },
  {
    id: "deal-with",
    expression: "deal with",
    meaningJa: "対処する",
    variants: ["deal with"],
    explanationJa: "問題や顧客対応などに取り組む時の基本表現です。",
    hintJa: "with までがセットです。",
    levelBand: "700",
  },
  {
    id: "fill-out",
    expression: "fill out",
    meaningJa: "記入する",
    variants: ["fill out", "fill in"],
    explanationJa: "フォームやアンケートに必要事項を書く時に使います。",
    hintJa: "out/in の両方が出ます。",
    levelBand: "700",
  },
  {
    id: "bring-about",
    expression: "bring about",
    meaningJa: "引き起こす",
    variants: ["bring about"],
    explanationJa: "変化や結果を生み出す時に使われます。",
    hintJa: "cause に近い意味です。",
    levelBand: "780",
  },
  {
    id: "point-out",
    expression: "point out",
    meaningJa: "指摘する",
    variants: ["point out"],
    explanationJa: "問題点や事実をはっきり示す時に使います。",
    hintJa: "out の有無で意味が変わります。",
    levelBand: "700",
  },
  {
    id: "keep-up-with",
    expression: "keep up with",
    meaningJa: "遅れずについていく",
    variants: ["keep up with"],
    explanationJa: "変化の速い仕事や情報に追いつく時の表現です。",
    hintJa: "with まで全部覚える必要があります。",
    levelBand: "780",
  },
  {
    id: "run-out-of",
    expression: "run out of",
    meaningJa: "使い果たす",
    variants: ["run out of"],
    explanationJa: "時間・在庫・予算などがなくなる時に使います。",
    hintJa: "of を抜かしやすいです。",
    levelBand: "730",
  },
  {
    id: "come-up-with",
    expression: "come up with",
    meaningJa: "思いつく",
    variants: ["come up with"],
    explanationJa: "案や解決策を考えつく時に使われます。",
    hintJa: "with が必要です。",
    levelBand: "780",
  },
  {
    id: "look-into",
    expression: "look into",
    meaningJa: "調査する",
    variants: ["look into"],
    explanationJa: "問題や依頼内容を詳しく調べる時に使います。",
    hintJa: "investigate に近い意味です。",
    levelBand: "730",
  },
  {
    id: "take-over",
    expression: "take over",
    meaningJa: "引き継ぐ",
    variants: ["take over"],
    explanationJa: "業務や担当、会社の経営を引き継ぐ時に使われます。",
    hintJa: "over が重要です。",
    levelBand: "730",
  },
  {
    id: "work-on",
    expression: "work on",
    meaningJa: "取り組む",
    variants: ["work on"],
    explanationJa: "課題や企画、改善に対して継続的に作業する表現です。",
    hintJa: "project と一緒に出やすいです。",
    levelBand: "700",
  },
  {
    id: "cut-back-on",
    expression: "cut back on",
    meaningJa: "減らす",
    variants: ["cut back on"],
    explanationJa: "コストや時間、支出を削減する時に自然です。",
    hintJa: "on まで含めて覚えます。",
    levelBand: "780",
  },
  {
    id: "leave-out",
    expression: "leave out",
    meaningJa: "省く",
    variants: ["leave out"],
    explanationJa: "情報や項目を意図的に除外する時に使います。",
    hintJa: "out で外に出すイメージです。",
    levelBand: "730",
  },
  {
    id: "call-off",
    expression: "call off",
    meaningJa: "中止する",
    variants: ["call off"],
    explanationJa: "会議やイベントを取りやめる時の定番表現です。",
    hintJa: "cancel に近い意味です。",
    levelBand: "700",
  },
  {
    id: "check-in",
    expression: "check in",
    meaningJa: "チェックインする",
    variants: ["check in"],
    explanationJa: "ホテルや空港での手続きに使います。",
    hintJa: "travel 文脈の頻出表現です。",
    levelBand: "700",
  },
  {
    id: "take-on",
    expression: "take on",
    meaningJa: "引き受ける",
    variants: ["take on"],
    explanationJa: "仕事や責任、新規案件を受け持つ時に使います。",
    hintJa: "on が抜けると別表現になります。",
    levelBand: "730",
  },
  {
    id: "back-up",
    expression: "back up",
    meaningJa: "裏付ける",
    variants: ["back up"],
    explanationJa: "主張や提案を証拠で支える時に使えます。",
    hintJa: "support に近い意味です。",
    levelBand: "780",
  },
  {
    id: "look-forward-to",
    expression: "look forward to",
    meaningJa: "楽しみにする",
    variants: ["look forward to"],
    explanationJa: "メールや会話で非常に頻出の丁寧な表現です。",
    hintJa: "to までが熟語です。",
    levelBand: "700",
  },
  {
    id: "go-through",
    expression: "go through",
    meaningJa: "経験する",
    variants: ["go through"],
    explanationJa: "困難な経験を通る、書類を詳しく確認する、の両方で使えます。",
    hintJa: "through を省かないようにします。",
    levelBand: "780",
  },
  {
    id: "follow-up-on",
    expression: "follow up on",
    meaningJa: "追跡確認する",
    variants: ["follow up on", "follow up"],
    explanationJa: "依頼後の進捗を確認する時に使われます。",
    hintJa: "on がある形もよく出ます。",
    levelBand: "780",
  },
  {
    id: "put-together",
    expression: "put together",
    meaningJa: "まとめる",
    variants: ["put together"],
    explanationJa: "資料や提案書を組み立てて仕上げる時に使います。",
    hintJa: "資料作成の文脈で覚えると定着しやすいです。",
    levelBand: "730",
  },
  {
    id: "set-aside",
    expression: "set aside",
    meaningJa: "取っておく",
    variants: ["set aside"],
    explanationJa: "時間や予算、席を確保しておく時に使います。",
    hintJa: "aside で脇に置くイメージです。",
    levelBand: "730",
  },
  {
    id: "break-down",
    expression: "break down",
    meaningJa: "故障する",
    variants: ["break down"],
    explanationJa: "機械や交渉などがうまくいかなくなる時に使えます。",
    hintJa: "down で崩れるイメージです。",
    levelBand: "700",
  },
  {
    id: "draw-up",
    expression: "draw up",
    meaningJa: "作成する",
    variants: ["draw up"],
    explanationJa: "契約書や計画書を作成する時のビジネス表現です。",
    hintJa: "contract とよく一緒に出ます。",
    levelBand: "860",
  },
  {
    id: "reach-out-to",
    expression: "reach out to",
    meaningJa: "連絡する",
    variants: ["reach out to"],
    explanationJa: "相手に働きかける、連絡を取る時のやわらかい表現です。",
    hintJa: "to まで含めて自然です。",
    levelBand: "860",
  },
  {
    id: "pass-out",
    expression: "pass out",
    meaningJa: "配布する",
    variants: ["pass out"],
    explanationJa: "資料やサンプルを配る時のカジュアル寄り表現です。",
    hintJa: "hand out と近い意味です。",
    levelBand: "730",
  },
  ...ADDITIONAL_IDIOMS_20260314,
  ...ADDITIONAL_IDIOMS_20260314_BATCH2,
  ...ADDITIONAL_IDIOMS_20260314_BATCH3,
];

function getSupport(idiom: IdiomSeed) {
  return {
    exampleEn:
      IDIOM_SUPPORT[idiom.id]?.exampleEn ??
      `Please use "${idiom.expression}" in a short business sentence.`,
    exampleJa:
      IDIOM_SUPPORT[idiom.id]?.exampleJa ??
      `${idiom.expression} は「${idiom.meaningJa}」の意味で使います。`,
    collocationHintJa:
      IDIOM_SUPPORT[idiom.id]?.collocationHintJa ??
      `${idiom.expression} は業務や連絡の文脈で見かけやすい熟語です。`,
    commonMistakeJa: IDIOM_SUPPORT[idiom.id]?.commonMistakeJa ?? idiom.hintJa,
  };
}

export const QUESTION_BANK: StudyQuestion[] = [
  ...IDIOM_BANK.map(
    (idiom): StudyQuestion => {
      const support = getSupport(idiom);

      return {
        questionId: `q-${idiom.id}`,
        idiomId: idiom.id,
        prompt: idiom.meaningJa,
        promptLabel: "日本語",
        promptDescription: "対応する英熟語を、半角スペースを含めて入力してください。",
        correctAnswer: idiom.expression,
        acceptedAnswers: idiom.variants,
        questionType: "ja_to_idiom",
        sourceExpression: idiom.expression,
        sourceMeaningJa: idiom.meaningJa,
        explanationJa: idiom.explanationJa,
        hintJa: idiom.hintJa,
        ...support,
        levelBand: idiom.levelBand,
      };
    },
  ),
  ...IDIOM_BANK.map(
    (idiom): StudyQuestion => {
      const support = getSupport(idiom);

      return {
        questionId: `q-${idiom.id}-ja`,
        idiomId: idiom.id,
        prompt: idiom.expression,
        promptLabel: "英熟語",
        promptDescription:
          "意味が自然に伝わる日本語で入力してください。表現が多少違っても、意味が合っていれば正解になることがあります。",
        correctAnswer: idiom.meaningJa,
        acceptedAnswers: [idiom.meaningJa, ...(idiom.translationVariantsJa ?? [])],
        questionType: "idiom_to_ja",
        sourceExpression: idiom.expression,
        sourceMeaningJa: idiom.meaningJa,
        explanationJa: idiom.explanationJa,
        hintJa: `${idiom.hintJa} 和訳は言い換えでも意味が合えば評価対象です。`,
        ...support,
        levelBand: idiom.levelBand,
      };
    },
  ),
  ...IDIOM_BANK.map(
    (idiom): StudyQuestion => {
      const support = getSupport(idiom);

      return {
        questionId: `q-${idiom.id}-sentence-ja`,
        idiomId: idiom.id,
        prompt: support.exampleEn,
        promptLabel: "英文",
        promptDescription:
          "英文全体の意味が自然に伝わる日本語で入力してください。スマホではキーボードの音声入力も使えます。",
        correctAnswer: support.exampleJa,
        acceptedAnswers: [support.exampleJa],
        questionType: "sentence_to_ja",
        sourceExpression: idiom.expression,
        sourceMeaningJa: idiom.meaningJa,
        explanationJa: idiom.explanationJa,
        hintJa: `${idiom.hintJa} 熟語だけでなく、文全体の流れが自然に伝わる和訳を目指しましょう。`,
        ...support,
        levelBand: idiom.levelBand,
      };
    },
  ),
  ...IDIOM_BANK.map(
    (idiom): StudyQuestion => {
      const support = getSupport(idiom);

      return {
        questionId: `q-${idiom.id}-sentence-en`,
        idiomId: idiom.id,
        prompt: support.exampleJa,
        promptLabel: "日本語の例文",
        promptDescription:
          "文全体の意味が自然に伝わる英語で入力してください。対象の英熟語を使えるとより理想的です。",
        correctAnswer: support.exampleEn,
        acceptedAnswers: [support.exampleEn],
        questionType: "sentence_ja_to_en",
        sourceExpression: idiom.expression,
        sourceMeaningJa: idiom.meaningJa,
        explanationJa: idiom.explanationJa,
        hintJa: `${idiom.hintJa} できるだけ ${idiom.expression} を使って英訳してみましょう。`,
        ...support,
        levelBand: idiom.levelBand,
      };
    },
  ),
];

export function getQuestionById(questionId: string) {
  return QUESTION_BANK.find((question) => question.questionId === questionId) ?? null;
}
