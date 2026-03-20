import type { SupabaseClient } from "@supabase/supabase-js";

import { QUESTION_BANK, getQuestionById } from "@/lib/data/idioms";
import type {
  LevelBand,
  QuestionOrderMode,
  QuestionSourceMode,
  QuestionType,
} from "@/lib/types";
import { computeReviewIntervalDays } from "@/lib/review/schedule";
import type {
  DailyHistory,
  DashboardStats,
  Judgment,
  RecentMistake,
  ScoreResult,
  StudyQuestion,
} from "@/lib/types";

type AnswerRow = {
  id: string;
  question_id: string;
  score: number;
  judgment: Judgment;
  answered_at: string;
};

type ReviewQueueRow = {
  question_id: string;
  due_at: string;
  consecutive_correct: number;
  last_judgment: Judgment;
};

export async function selectLearnQuestion(
  supabase: SupabaseClient,
  userId: string,
  levelBands: LevelBand[],
  questionType: QuestionType,
  questionSourceMode: QuestionSourceMode,
  questionOrderMode: QuestionOrderMode,
  stepKey?: string,
) {
  const checkedIdiomIds = await getCheckedIdiomIds(supabase, userId);
  const filteredQuestionBank = getQuestionPool({
    levelBands,
    questionType,
    questionSourceMode,
    checkedIdiomIds,
  });

  if (filteredQuestionBank.length === 0) {
    return {
      question: null,
      poolCount: 0,
      checkedIdiomsCount: checkedIdiomIds.length,
      choiceOptions: [],
      isChecked: false,
    };
  }

  const { data, error } = await supabase
    .from("user_answers")
    .select("question_id, answered_at, score, judgment")
    .eq("user_id", userId)
    .order("answered_at", { ascending: false })
    .limit(200);

  if (error) {
    throw error;
  }

  const history = (data ?? []) as AnswerRow[];
  const metrics = buildQuestionMetrics(history);
  const idiomMetrics = buildIdiomMetrics(metrics);
  const question = pickLearnQuestion({
    questionPool: filteredQuestionBank,
    metrics,
    idiomMetrics,
    questionOrderMode,
    step: parseStepKey(stepKey),
  });

  return {
    question,
    poolCount: filteredQuestionBank.length,
    checkedIdiomsCount: checkedIdiomIds.length,
    choiceOptions: buildChoiceOptions(question, filteredQuestionBank),
    isChecked: checkedIdiomIds.includes(question.idiomId),
  };
}

export function selectGuestLearnQuestion(
  levelBands: LevelBand[],
  questionType: QuestionType,
  questionOrderMode: QuestionOrderMode,
  stepKey?: string,
) {
  const filteredQuestionBank = getQuestionPool({
    levelBands,
    questionType,
    questionSourceMode: "all",
    checkedIdiomIds: [],
  });

  if (filteredQuestionBank.length === 0) {
    return {
      question: null,
      poolCount: 0,
      checkedIdiomsCount: 0,
      choiceOptions: [],
      isChecked: false,
    };
  }

  const question = pickGuestQuestion({
    questionPool: filteredQuestionBank,
    questionOrderMode,
    step: parseStepKey(stepKey),
    seedBase: `${questionType}-${levelBands.join(",")}`,
  });

  return {
    question,
    poolCount: filteredQuestionBank.length,
    checkedIdiomsCount: 0,
    choiceOptions: buildChoiceOptions(question, filteredQuestionBank),
    isChecked: false,
  };
}

export async function selectReviewQuestion(
  supabase: SupabaseClient,
  userId: string,
) {
  const checkedIdiomIds = await getCheckedIdiomIds(supabase, userId);
  const { data, error, count } = await supabase
    .from("review_queue")
    .select("question_id, due_at, last_judgment", { count: "exact" })
    .eq("user_id", userId)
    .lte("due_at", new Date().toISOString())
    .order("due_at", { ascending: true })
    .limit(20);

  if (error) {
    throw error;
  }

  const dueRows = (data ?? []) as Array<{
    question_id: string;
    due_at: string;
    last_judgment: Judgment;
  }>;
  const questionId = pickReviewQuestionId(dueRows);
  const question = questionId ? getQuestionById(questionId) : null;
  return {
    question,
    dueCount: count ?? 0,
    choiceOptions: question
      ? buildChoiceOptions(
          question,
          QUESTION_BANK.filter(
            (candidate) => candidate.questionType === question.questionType,
          ),
        )
      : [],
    isChecked: question ? checkedIdiomIds.includes(question.idiomId) : false,
  };
}

export async function getDashboardStats(
  supabase: SupabaseClient,
  userId: string,
): Promise<DashboardStats> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    { data: todayAnswers, error: todayError },
    { count: dueReviewCount, error: reviewError },
    { data: recentAnswers, error: recentError },
    { data: weakRows, error: weakError },
    checkedIdiomIds,
  ] =
    await Promise.all([
      supabase
        .from("user_answers")
        .select("score, judgment, answered_at")
        .eq("user_id", userId)
        .gte("answered_at", todayStart.toISOString()),
      supabase
        .from("review_queue")
        .select("question_id", { count: "exact", head: true })
        .eq("user_id", userId)
        .lte("due_at", new Date().toISOString()),
      supabase
        .from("user_answers")
        .select("judgment")
        .eq("user_id", userId)
        .order("answered_at", { ascending: false })
        .limit(30),
      supabase
        .from("review_queue")
        .select("question_id")
        .eq("user_id", userId)
        .neq("last_judgment", "correct"),
      getCheckedIdiomIds(supabase, userId),
    ]);

  if (todayError || reviewError || recentError || weakError) {
    throw todayError || reviewError || recentError || weakError;
  }

  const todayCount = todayAnswers?.length ?? 0;
  const accuracy =
    todayCount === 0
      ? 0
      : (todayAnswers ?? []).reduce((total, item) => total + Number(item.score ?? 0), 0) /
        todayCount;

  let currentStreak = 0;
  for (const item of recentAnswers ?? []) {
    if (item.judgment === "correct" || item.judgment === "almost_correct") {
      currentStreak += 1;
    } else {
      break;
    }
  }

  return {
    todayCount,
    accuracy,
    weakCount: weakRows?.length ?? 0,
    dueReviewCount: dueReviewCount ?? 0,
    currentStreak,
    totalIdioms: new Set(QUESTION_BANK.map((question) => question.idiomId)).size,
    totalQuestions: QUESTION_BANK.length,
    checkedIdiomsCount: checkedIdiomIds.length,
  };
}

export async function getHistoryData(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ dailyHistory: DailyHistory[]; recentMistakes: RecentMistake[] }> {
  const { data, error } = await supabase
    .from("user_answers")
    .select("question_id, score, judgment, answered_at")
    .eq("user_id", userId)
    .order("answered_at", { ascending: false })
    .limit(180);

  if (error) {
    throw error;
  }

  const answers = (data ?? []) as AnswerRow[];
  const groups = new Map<string, { count: number; total: number }>();

  for (const answer of answers) {
    const date = answer.answered_at.slice(0, 10);
    const current = groups.get(date);

    if (current) {
      current.count += 1;
      current.total += Number(answer.score);
    } else {
      groups.set(date, { count: 1, total: Number(answer.score) });
    }
  }

  const dailyHistory = [...groups.entries()]
    .map(([date, value]) => ({
      date,
      count: value.count,
      accuracy: value.total / value.count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14);

  const recentMistakes = answers
    .filter((answer) => answer.judgment !== "correct")
    .slice(0, 8)
    .map((answer) => {
      const question = getQuestionById(answer.question_id);

      return {
        questionId: answer.question_id,
        prompt: question?.prompt ?? "不明",
        correctAnswer: question?.correctAnswer ?? "-",
        answeredAt: answer.answered_at,
        judgment: answer.judgment,
      };
    });

  return { dailyHistory, recentMistakes };
}

export async function getRecentAnswers(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from("user_answers")
    .select("id, question_id, score, judgment, answered_at")
    .eq("user_id", userId)
    .order("answered_at", { ascending: false })
    .limit(6);

  if (error) {
    throw error;
  }

  return ((data ?? []) as AnswerRow[]).map((answer) => ({
    ...answer,
    question: getQuestionById(answer.question_id),
  }));
}

export async function isLlmRateLimited(
  supabase: SupabaseClient,
  userId: string,
) {
  const threshold = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count, error } = await supabase
    .from("user_answers")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("source", "llm")
    .gte("answered_at", threshold);

  if (error) {
    console.error("Failed to check LLM rate limit", error);
    return false;
  }

  return (count ?? 0) >= 20;
}

export async function getCheckedIdiomIds(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from("checked_idioms")
    .select("idiom_id")
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to fetch checked idioms", error);
    return [] as string[];
  }

  return (data ?? []).map((item) => item.idiom_id);
}

function getQuestionPool({
  levelBands,
  questionType,
  questionSourceMode,
  checkedIdiomIds,
}: {
  levelBands: LevelBand[];
  questionType: QuestionType;
  questionSourceMode: QuestionSourceMode;
  checkedIdiomIds: string[];
}) {
  return QUESTION_BANK.filter((question) => {
    if (!levelBands.includes(question.levelBand) || question.questionType !== questionType) {
      return false;
    }

    if (questionSourceMode === "checked_only") {
      return checkedIdiomIds.includes(question.idiomId);
    }

    return true;
  });
}

type QuestionMetrics = {
  count: number;
  latest: number;
  weakScore: number;
};

type IdiomMetrics = {
  count: number;
  latest: number;
  weakScore: number;
};

function buildQuestionMetrics(history: AnswerRow[]) {
  const grouped = new Map<string, AnswerRow[]>();

  for (const item of history) {
    const current = grouped.get(item.question_id);

    if (current) {
      current.push(item);
    } else {
      grouped.set(item.question_id, [item]);
    }
  }

  const metrics = new Map<string, QuestionMetrics>();

  for (const [questionId, rows] of grouped.entries()) {
    const latest = rows.reduce(
      (max, row) => Math.max(max, new Date(row.answered_at).getTime()),
      0,
    );
    let correctCount = 0;
    let incorrectCount = 0;
    let almostCount = 0;
    let consecutiveMisses = 0;

    for (const row of rows) {
      if (row.judgment === "correct") {
        correctCount += 1;
      } else if (row.judgment === "almost_correct") {
        almostCount += 1;
      } else {
        incorrectCount += 1;
      }
    }

    for (const row of rows) {
      if (row.judgment === "correct") {
        break;
      }

      consecutiveMisses += 1;
    }

    const lastJudgment = rows[0]?.judgment;
    const weakScore =
      incorrectCount * 4 +
      almostCount * 2 +
      consecutiveMisses * 5 +
      (lastJudgment === "incorrect" ? 3 : 0) +
      (lastJudgment === "almost_correct" ? 1 : 0) -
      correctCount;

    metrics.set(questionId, {
      count: rows.length,
      latest,
      weakScore,
    });
  }

  return metrics;
}

function buildIdiomMetrics(metrics: Map<string, QuestionMetrics>) {
  const idiomMetrics = new Map<string, IdiomMetrics>();

  for (const [questionId, questionMetric] of metrics.entries()) {
    const question = getQuestionById(questionId);
    if (!question) {
      continue;
    }

    const current = idiomMetrics.get(question.idiomId);

    if (current) {
      current.count += questionMetric.count;
      current.latest = Math.max(current.latest, questionMetric.latest);
      current.weakScore += questionMetric.weakScore;
    } else {
      idiomMetrics.set(question.idiomId, {
        count: questionMetric.count,
        latest: questionMetric.latest,
        weakScore: questionMetric.weakScore,
      });
    }
  }

  return idiomMetrics;
}

function parseStepKey(stepKey?: string) {
  const parsed = Number.parseInt(stepKey ?? "0", 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function pickLearnQuestion({
  questionPool,
  metrics,
  idiomMetrics,
  questionOrderMode,
  step,
}: {
  questionPool: StudyQuestion[];
  metrics: Map<string, QuestionMetrics>;
  idiomMetrics: Map<string, IdiomMetrics>;
  questionOrderMode: QuestionOrderMode;
  step: number;
}) {
  if (questionOrderMode === "random") {
    return pickRandomQuestion(questionPool, `learn-${step}`);
  }

  if (questionOrderMode === "unanswered_first") {
    const unanswered = rankRelatedUnansweredQuestions(
      questionPool.filter((question) => !metrics.has(question.questionId)),
      idiomMetrics,
    );

    if (unanswered.length > 0) {
      return unanswered[step % unanswered.length];
    }

    return pickLeastPracticedQuestion(questionPool, metrics);
  }

  if (questionOrderMode === "weak_first") {
    const weakQuestions = [...questionPool]
      .filter(
        (question) =>
          getCombinedWeakScore(question, metrics, idiomMetrics) > 0,
      )
      .sort((a, b) => {
        const leftScore = getCombinedWeakScore(a, metrics, idiomMetrics);
        const rightScore = getCombinedWeakScore(b, metrics, idiomMetrics);

        if (leftScore !== rightScore) {
          return rightScore - leftScore;
        }

        const left = metrics.get(a.questionId) ?? { count: 0, latest: 0, weakScore: 0 };
        const right = metrics.get(b.questionId) ?? { count: 0, latest: 0, weakScore: 0 };
        return left.latest - right.latest;
      });

    if (weakQuestions.length > 0) {
      return weakQuestions[step % weakQuestions.length];
    }

    const unanswered = rankRelatedUnansweredQuestions(
      questionPool.filter((question) => !metrics.has(question.questionId)),
      idiomMetrics,
    );
    if (unanswered.length > 0) {
      return unanswered[step % unanswered.length];
    }

    return pickLeastPracticedQuestion(questionPool, metrics);
  }

  return questionPool[step % questionPool.length];
}

function getCombinedWeakScore(
  question: StudyQuestion,
  metrics: Map<string, QuestionMetrics>,
  idiomMetrics: Map<string, IdiomMetrics>,
) {
  const questionWeak = metrics.get(question.questionId)?.weakScore ?? 0;
  const idiomWeak = idiomMetrics.get(question.idiomId)?.weakScore ?? 0;
  const siblingExposureBoost =
    !metrics.has(question.questionId) && idiomWeak > 0 ? 3 : 0;

  return questionWeak + idiomWeak * 2 + siblingExposureBoost;
}

function rankRelatedUnansweredQuestions(
  unansweredQuestions: StudyQuestion[],
  idiomMetrics: Map<string, IdiomMetrics>,
) {
  return [...unansweredQuestions].sort((a, b) => {
    const left = idiomMetrics.get(a.idiomId) ?? { count: 0, latest: 0, weakScore: 0 };
    const right = idiomMetrics.get(b.idiomId) ?? { count: 0, latest: 0, weakScore: 0 };

    const leftRank = left.weakScore > 0 ? 0 : left.count > 0 ? 1 : 2;
    const rightRank = right.weakScore > 0 ? 0 : right.count > 0 ? 1 : 2;

    if (leftRank !== rightRank) {
      return leftRank - rightRank;
    }

    if (left.weakScore !== right.weakScore) {
      return right.weakScore - left.weakScore;
    }

    if (left.count !== right.count) {
      return right.count - left.count;
    }

    return left.latest - right.latest;
  });
}

function pickGuestQuestion({
  questionPool,
  questionOrderMode,
  step,
  seedBase,
}: {
  questionPool: StudyQuestion[];
  questionOrderMode: QuestionOrderMode;
  step: number;
  seedBase: string;
}) {
  if (questionOrderMode === "random") {
    return pickRandomQuestion(questionPool, `${seedBase}-${step}`);
  }

  return questionPool[step % questionPool.length];
}

function pickLeastPracticedQuestion(
  questionPool: StudyQuestion[],
  metrics: Map<string, QuestionMetrics>,
) {
  return [...questionPool].sort((a, b) => {
    const left = metrics.get(a.questionId) ?? { count: 0, latest: 0, weakScore: 0 };
    const right = metrics.get(b.questionId) ?? { count: 0, latest: 0, weakScore: 0 };

    if (left.count !== right.count) {
      return left.count - right.count;
    }

    return left.latest - right.latest;
  })[0];
}

function pickRandomQuestion(questionPool: StudyQuestion[], seed: string) {
  if (questionPool.length === 1) {
    return questionPool[0];
  }

  const currentIndex = hashString(seed) % questionPool.length;
  const previousIndex = hashString(`${seed}-previous`) % questionPool.length;
  const index =
    currentIndex === previousIndex ? (currentIndex + 1) % questionPool.length : currentIndex;

  return questionPool[index];
}

function hashString(input: string) {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }

  return hash;
}

export function buildChoiceOptions(
  question: StudyQuestion,
  questionPool: StudyQuestion[],
) {
  const candidates = questionPool.filter(
    (candidate) =>
      candidate.questionId !== question.questionId &&
      candidate.questionType === question.questionType,
  );

  const levelMatched = candidates.filter(
    (candidate) => candidate.levelBand === question.levelBand,
  );
  const source = levelMatched.length >= 3 ? levelMatched : candidates;

  const distractors = [...source]
    .sort(
      (left, right) =>
        hashString(`${question.questionId}-${left.questionId}`) -
        hashString(`${question.questionId}-${right.questionId}`),
    )
    .slice(0, 3)
    .map((candidate) => candidate.correctAnswer);

  return [...new Set([question.correctAnswer, ...distractors])]
    .sort(
      (left, right) =>
        hashString(`${question.questionId}-${left}`) -
        hashString(`${question.questionId}-${right}`),
    )
    .slice(0, 4);
}

export async function getCachedJudgment(
  supabase: SupabaseClient,
  questionId: string,
  normalizedAnswer: string,
): Promise<ScoreResult | null> {
  const { data, error } = await supabase
    .from("llm_judgment_cache")
    .select("result")
    .eq("question_id", questionId)
    .eq("normalized_answer", normalizedAnswer)
    .maybeSingle();

  if (error) {
    return null;
  }

  return (data?.result as ScoreResult | undefined) ?? null;
}

export async function storeCachedJudgment(
  supabase: SupabaseClient,
  questionId: string,
  normalizedAnswer: string,
  result: ScoreResult,
) {
  const { error } = await supabase.from("llm_judgment_cache").upsert(
    {
      question_id: questionId,
      normalized_answer: normalizedAnswer,
      result,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "question_id,normalized_answer",
    },
  );

  if (error) {
    console.error("Failed to store LLM cache", error);
  }
}

export async function persistAnswer({
  supabase,
  userId,
  question,
  submittedAnswer,
  normalizedAnswer,
  result,
}: {
  supabase: SupabaseClient;
  userId: string;
  question: StudyQuestion;
  submittedAnswer: string;
  normalizedAnswer: string;
  result: ScoreResult;
}) {
  const { data: previousQueue } = await supabase
    .from("review_queue")
    .select("question_id, due_at, consecutive_correct, last_judgment")
    .eq("user_id", userId)
    .eq("question_id", question.questionId)
    .maybeSingle();

  const previous = previousQueue as ReviewQueueRow | null;
  const consecutiveCorrect =
    result.judgment === "correct" ? (previous?.consecutive_correct ?? 0) + 1 : 0;
  const intervalDays = computeReviewIntervalDays(result.judgment, consecutiveCorrect);
  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + intervalDays);

  const { data: inserted, error: answerError } = await supabase
    .from("user_answers")
    .insert({
      user_id: userId,
      question_id: question.questionId,
      answer_text: submittedAnswer,
      normalized_answer: normalizedAnswer,
      is_correct: result.isCorrect,
      score: result.score,
      judgment: result.judgment,
      correct_answer: result.correctAnswer,
      feedback_ja: result.feedbackJa,
      error_tags: result.errorTags,
      source: result.source,
    })
    .select("id")
    .single();

  if (answerError) {
    throw answerError;
  }

  const { error: reviewError } = await supabase.from("review_queue").upsert(
    {
      user_id: userId,
      question_id: question.questionId,
      due_at: dueAt.toISOString(),
      interval_days: intervalDays,
      consecutive_correct: consecutiveCorrect,
      last_judgment: result.judgment,
      last_answer_id: inserted.id,
    },
    {
      onConflict: "user_id,question_id",
    },
  );

  if (reviewError) {
    throw reviewError;
  }

  if (result.judgment !== "correct") {
    await queueRelatedReviewQuestions({
      supabase,
      userId,
      question,
      result,
      answerId: inserted.id,
      dueAt: dueAt.toISOString(),
      intervalDays,
    });
  }

  return {
    nextReviewAt: dueAt.toISOString(),
    intervalDays,
  };
}

function pickReviewQuestionId(
  dueRows: Array<{ question_id: string; due_at: string; last_judgment: Judgment }>,
) {
  if (dueRows.length === 0) {
    return null;
  }

  return [...dueRows]
    .sort((a, b) => {
      const left = getQuestionById(a.question_id);
      const right = getQuestionById(b.question_id);
      const leftPenalty = a.last_judgment === "incorrect" ? 0 : 1;
      const rightPenalty = b.last_judgment === "incorrect" ? 0 : 1;

      if (leftPenalty !== rightPenalty) {
        return leftPenalty - rightPenalty;
      }

      if (a.due_at !== b.due_at) {
        return a.due_at.localeCompare(b.due_at);
      }

      return (left?.questionType ?? "").localeCompare(right?.questionType ?? "");
    })[0]
    ?.question_id ?? null;
}

async function queueRelatedReviewQuestions({
  supabase,
  userId,
  question,
  result,
  answerId,
  dueAt,
  intervalDays,
}: {
  supabase: SupabaseClient;
  userId: string;
  question: StudyQuestion;
  result: ScoreResult;
  answerId: string;
  dueAt: string;
  intervalDays: number;
}) {
  const siblingQuestionIds = QUESTION_BANK.filter(
    (candidate) =>
      candidate.idiomId === question.idiomId &&
      candidate.questionId !== question.questionId,
  ).map((candidate) => candidate.questionId);

  if (siblingQuestionIds.length === 0) {
    return;
  }

  const { data, error } = await supabase
    .from("review_queue")
    .select("question_id, due_at")
    .eq("user_id", userId)
    .in("question_id", siblingQuestionIds);

  if (error) {
    throw error;
  }

  const existingDueAt = new Map(
    ((data ?? []) as Array<{ question_id: string; due_at: string }>).map((row) => [
      row.question_id,
      row.due_at,
    ]),
  );

  const rows = siblingQuestionIds.map((questionId) => {
    const currentDueAt = existingDueAt.get(questionId);

    return {
      user_id: userId,
      question_id: questionId,
      due_at:
        currentDueAt && currentDueAt < dueAt ? currentDueAt : dueAt,
      interval_days: intervalDays,
      consecutive_correct: 0,
      last_judgment: result.judgment,
      last_answer_id: answerId,
    };
  });

  const { error: upsertError } = await supabase.from("review_queue").upsert(rows, {
    onConflict: "user_id,question_id",
  });

  if (upsertError) {
    throw upsertError;
  }
}
