import type { SupabaseClient } from "@supabase/supabase-js";

import { getCachedJudgment, storeCachedJudgment } from "@/lib/data/repository";
import { scoreWithLLM } from "@/lib/scoring/llm";
import { scoreWithRules } from "@/lib/scoring/rule-based";
import type { ScoreResult, StudyQuestion } from "@/lib/types";

export async function gradeAnswer({
  supabase,
  question,
  submittedAnswer,
}: {
  supabase: SupabaseClient;
  question: StudyQuestion;
  submittedAnswer: string;
}): Promise<ScoreResult> {
  const ruleResult = scoreWithRules(question, submittedAnswer);

  if (!ruleResult.shouldEscalate) {
    return ruleResult;
  }

  const cached = await getCachedJudgment(
    supabase,
    question.questionId,
    ruleResult.normalizedAnswer,
  );

  if (cached) {
    return cached;
  }

  const llmResult = await scoreWithLLM({ question, submittedAnswer });

  if (!llmResult) {
    return ruleResult;
  }

  await storeCachedJudgment(
    supabase,
    question.questionId,
    ruleResult.normalizedAnswer,
    llmResult,
  );

  return llmResult;
}
