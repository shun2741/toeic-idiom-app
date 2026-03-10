import { normalizeAnswer, normalizeJapaneseAnswer } from "@/lib/scoring/normalize";
import { isDontKnowAnswer } from "@/lib/scoring/dont-know";
import type { ScoreResult, StudyQuestion } from "@/lib/types";

type RuleScoreResult = ScoreResult & {
  normalizedAnswer: string;
  shouldEscalate: boolean;
};

function levenshtein(a: string, b: string) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let i = 0; i < rows; i += 1) {
    matrix[i][0] = i;
  }

  for (let j = 0; j < cols; j += 1) {
    matrix[0][j] = j;
  }

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[rows - 1][cols - 1];
}

function buildIncorrectResult(
  question: StudyQuestion,
  normalizedAnswer: string,
  shouldEscalate: boolean,
  feedbackJa: string,
  errorTags: string[],
): RuleScoreResult {
  return {
    isCorrect: false,
    score: shouldEscalate ? 0.35 : 0,
    judgment: shouldEscalate ? "almost_correct" : "incorrect",
    correctAnswer: question.correctAnswer,
    feedbackJa,
    errorTags,
    normalizedAnswer,
    shouldEscalate,
    source: "rule",
  };
}

export function scoreWithRules(
  question: StudyQuestion,
  submittedAnswer: string,
): RuleScoreResult {
  if (isDontKnowAnswer(submittedAnswer)) {
    return {
      isCorrect: false,
      score: 0,
      judgment: "incorrect",
      correctAnswer: question.correctAnswer,
      feedbackJa: `今回は答えを確認しましょう。正答は「${question.correctAnswer}」です。`,
      errorTags: ["dont_know"],
      normalizedAnswer: "",
      shouldEscalate: false,
      source: "rule",
    };
  }

  if (question.questionType === "sentence_to_ja") {
    return scoreSentenceTranslationWithRules(question, submittedAnswer);
  }

  if (question.questionType === "sentence_ja_to_en") {
    return scoreSentenceTranslationToEnglishWithRules(question, submittedAnswer);
  }

  if (question.questionType === "idiom_to_ja") {
    return scoreJapaneseTranslationWithRules(question, submittedAnswer);
  }

  const normalizedAnswer = normalizeAnswer(submittedAnswer);
  const accepted = Array.from(
    new Set([question.correctAnswer, ...question.acceptedAnswers].map(normalizeAnswer)),
  );

  if (!normalizedAnswer) {
    return buildIncorrectResult(
      question,
      normalizedAnswer,
      false,
      "未入力です。答えを確認して、もう一度入力してみましょう。",
      ["blank_answer"],
    );
  }

  if (accepted.includes(normalizedAnswer)) {
    return {
      isCorrect: true,
      score: 1,
      judgment: "correct",
      correctAnswer: question.correctAnswer,
      feedbackJa: "正解です。自然に書けています。",
      errorTags: [],
      normalizedAnswer,
      shouldEscalate: false,
      source: "rule",
    };
  }

  const exactCandidate = accepted.find((candidate) => candidate === normalizedAnswer);
  if (exactCandidate) {
    return {
      isCorrect: true,
      score: 1,
      judgment: "correct",
      correctAnswer: question.correctAnswer,
      feedbackJa: "表記ゆれの範囲として正解です。",
      errorTags: ["accepted_variant"],
      normalizedAnswer,
      shouldEscalate: false,
      source: "rule",
    };
  }

  const answerTokens = normalizedAnswer.split(" ");
  const candidateDistances = accepted.map((candidate) => ({
    candidate,
    distance: levenshtein(normalizedAnswer, candidate),
  }));
  const nearest = candidateDistances.sort((a, b) => a.distance - b.distance)[0];

  if (
    nearest &&
    nearest.distance <= 1 &&
    Math.abs(nearest.candidate.length - normalizedAnswer.length) <= 1
  ) {
    return {
      isCorrect: false,
      score: 0.82,
      judgment: "almost_correct",
      correctAnswer: question.correctAnswer,
      feedbackJa: "かなり近いです。スペルや語尾をもう一度確認しましょう。",
      errorTags: ["small_typo"],
      normalizedAnswer,
      shouldEscalate: false,
      source: "rule",
    };
  }

  const prepositionNearMatch = accepted.find((candidate) => {
    const candidateTokens = candidate.split(" ");
    if (candidateTokens.length < 2 || candidateTokens.length !== answerTokens.length) {
      return false;
    }

    return (
      candidateTokens.slice(0, -1).join(" ") === answerTokens.slice(0, -1).join(" ") &&
      candidateTokens[candidateTokens.length - 1] !== answerTokens[answerTokens.length - 1]
    );
  });

  if (prepositionNearMatch) {
    return {
      isCorrect: false,
      score: 0.72,
      judgment: "almost_correct",
      correctAnswer: question.correctAnswer,
      feedbackJa: "動詞は合っています。最後の前置詞や副詞を見直すと正答に近づきます。",
      errorTags: ["particle_mistake"],
      normalizedAnswer,
      shouldEscalate: false,
      source: "rule",
    };
  }

  const overlap = accepted.some((candidate) => {
    const candidateTokens = candidate.split(" ");
    const sharedCount = answerTokens.filter((token) => candidateTokens.includes(token)).length;
    return sharedCount >= 1 && sharedCount / Math.max(candidateTokens.length, answerTokens.length) >= 0.5;
  });

  if (overlap) {
    return buildIncorrectResult(
      question,
      normalizedAnswer,
      true,
      "一部は近いですが、意味として合っているかを追加で判定します。",
      ["needs_semantic_check"],
    );
  }

  return buildIncorrectResult(
    question,
    normalizedAnswer,
    false,
    `不正解です。正答は「${question.correctAnswer}」です。`,
    ["different_expression"],
  );
}

function scoreJapaneseTranslationWithRules(
  question: StudyQuestion,
  submittedAnswer: string,
): RuleScoreResult {
  const normalizedAnswer = normalizeJapaneseAnswer(submittedAnswer);
  const accepted = Array.from(
    new Set([question.correctAnswer, ...question.acceptedAnswers].map(normalizeJapaneseAnswer)),
  );

  if (!normalizedAnswer) {
    return buildIncorrectResult(
      question,
      normalizedAnswer,
      false,
      "未入力です。意味が伝わる自然な日本語で入力してみましょう。",
      ["blank_answer"],
    );
  }

  if (accepted.includes(normalizedAnswer)) {
    return {
      isCorrect: true,
      score: 1,
      judgment: "correct",
      correctAnswer: question.correctAnswer,
      feedbackJa: "正解です。自然な和訳として問題ありません。",
      errorTags: [],
      normalizedAnswer,
      shouldEscalate: false,
      source: "rule",
    };
  }

  return buildIncorrectResult(
    question,
    normalizedAnswer,
    true,
    "和訳は言い換えの幅があるため、ニュアンスが同じかを追加で判定します。",
    normalizedAnswer.length <= 2 ? ["translation_too_short", "needs_semantic_check"] : ["needs_semantic_check"],
  );
}

function scoreSentenceTranslationWithRules(
  question: StudyQuestion,
  submittedAnswer: string,
): RuleScoreResult {
  const normalizedAnswer = normalizeJapaneseAnswer(submittedAnswer);
  const accepted = Array.from(
    new Set([question.correctAnswer, ...question.acceptedAnswers].map(normalizeJapaneseAnswer)),
  );

  if (!normalizedAnswer) {
    return buildIncorrectResult(
      question,
      normalizedAnswer,
      false,
      "未入力です。英文全体の意味が自然に伝わる日本語で入力してみましょう。",
      ["blank_answer"],
    );
  }

  if (accepted.includes(normalizedAnswer)) {
    return {
      isCorrect: true,
      score: 1,
      judgment: "correct",
      correctAnswer: question.correctAnswer,
      feedbackJa: "正解です。文全体の意味が自然に伝わっています。",
      errorTags: [],
      normalizedAnswer,
      shouldEscalate: false,
      source: "rule",
    };
  }

  return buildIncorrectResult(
    question,
    normalizedAnswer,
    true,
    "英文の和訳は表現の幅があるため、文全体の意味が保たれているかを追加で判定します。",
    normalizedAnswer.length <= 4 ? ["sentence_translation_too_short", "needs_semantic_check"] : ["needs_semantic_check"],
  );
}

function scoreSentenceTranslationToEnglishWithRules(
  question: StudyQuestion,
  submittedAnswer: string,
): RuleScoreResult {
  const normalizedAnswer = normalizeAnswer(submittedAnswer);
  const accepted = Array.from(
    new Set([question.correctAnswer, ...question.acceptedAnswers].map(normalizeAnswer)),
  );

  if (!normalizedAnswer) {
    return buildIncorrectResult(
      question,
      normalizedAnswer,
      false,
      "未入力です。文全体の意味が自然に伝わる英語で入力してみましょう。",
      ["blank_answer"],
    );
  }

  if (accepted.includes(normalizedAnswer)) {
    return {
      isCorrect: true,
      score: 1,
      judgment: "correct",
      correctAnswer: question.correctAnswer,
      feedbackJa: "正解です。自然な英訳として問題ありません。",
      errorTags: [],
      normalizedAnswer,
      shouldEscalate: false,
      source: "rule",
    };
  }

  return buildIncorrectResult(
    question,
    normalizedAnswer,
    true,
    "英訳は表現の幅があるため、文全体の意味と熟語の使い方が自然かを追加で判定します。",
    normalizedAnswer.split(" ").length <= 2
      ? ["english_sentence_too_short", "needs_semantic_check"]
      : ["needs_semantic_check"],
  );
}
