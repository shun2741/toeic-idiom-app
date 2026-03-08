import type { SupabaseClient } from "@supabase/supabase-js";

import { QUESTION_BANK, getQuestionById } from "@/lib/data/idioms";
import type {
  LevelBand,
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
    .select("question_id, answered_at")
    .eq("user_id", userId)
    .order("answered_at", { ascending: false })
    .limit(200);

  if (error) {
    throw error;
  }

  const history = (data ?? []) as Array<{ question_id: string; answered_at: string }>;
  const counts = new Map<string, { count: number; latest: number }>();

  for (const item of history) {
    const current = counts.get(item.question_id);
    const timestamp = new Date(item.answered_at).getTime();

    if (current) {
      current.count += 1;
      current.latest = Math.max(current.latest, timestamp);
    } else {
      counts.set(item.question_id, { count: 1, latest: timestamp });
    }
  }

  const unanswered = filteredQuestionBank.find((question) => !counts.has(question.questionId));
  if (unanswered) {
    return {
      question: unanswered,
      poolCount: filteredQuestionBank.length,
      checkedIdiomsCount: checkedIdiomIds.length,
      choiceOptions: buildChoiceOptions(unanswered, filteredQuestionBank),
      isChecked: checkedIdiomIds.includes(unanswered.idiomId),
    };
  }

  const question = [...filteredQuestionBank].sort((a, b) => {
    const left = counts.get(a.questionId)!;
    const right = counts.get(b.questionId)!;

    if (left.count !== right.count) {
      return left.count - right.count;
    }

    return left.latest - right.latest;
  })[0];

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
  refreshKey?: string,
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

  const seedSource =
    refreshKey?.trim() ||
    `${questionType}-${levelBands.join(",")}-${new Date().toISOString().slice(0, 13)}`;
  const question = filteredQuestionBank[hashString(seedSource) % filteredQuestionBank.length];

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
    .select("question_id, due_at", { count: "exact" })
    .eq("user_id", userId)
    .lte("due_at", new Date().toISOString())
    .order("due_at", { ascending: true })
    .limit(1);

  if (error) {
    throw error;
  }

  const questionId = data?.[0]?.question_id;
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

  return {
    nextReviewAt: dueAt.toISOString(),
    intervalDays,
  };
}
