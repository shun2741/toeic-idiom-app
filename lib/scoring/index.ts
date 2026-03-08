import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getCachedJudgment,
  isLlmRateLimited,
  storeCachedJudgment,
} from "@/lib/data/repository";
import { acquireLlmCircuitSlot } from "@/lib/security/llm-circuit-breaker";
import { scoreWithLLM } from "@/lib/scoring/llm";
import { scoreWithRules } from "@/lib/scoring/rule-based";
import type { ScoreResult, StudyQuestion } from "@/lib/types";

export async function gradeAnswer({
  supabase,
  userId,
  question,
  submittedAnswer,
}: {
  supabase: SupabaseClient;
  userId: string;
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

  if (await isLlmRateLimited(supabase, userId)) {
    return {
      ...ruleResult,
      feedbackJa:
        "判定回数が短時間に集中しているため、追加のAI判定を一時的に止めています。少し時間を空けて再度試してください。",
      errorTags: [...ruleResult.errorTags, "llm_rate_limited"],
    };
  }

  const circuit = acquireLlmCircuitSlot();
  if (!circuit.allowed) {
    return {
      ...ruleResult,
      feedbackJa:
        "AI 判定が短時間に集中しているため、追加の意味判定を一時的に止めています。少し時間を空けて再度試してください。",
      errorTags: [...ruleResult.errorTags, "llm_circuit_open"],
    };
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

export async function gradeGuestAnswer({
  question,
  submittedAnswer,
  llmRateLimited,
}: {
  question: StudyQuestion;
  submittedAnswer: string;
  llmRateLimited: boolean;
}): Promise<ScoreResult> {
  const ruleResult = scoreWithRules(question, submittedAnswer);

  if (!ruleResult.shouldEscalate) {
    return ruleResult;
  }

  if (llmRateLimited) {
    return {
      ...ruleResult,
      feedbackJa:
        "ゲストモードでのAI判定回数が短時間に集中しているため、追加判定を一時的に止めています。少し時間を空けて再度試してください。",
      errorTags: [...ruleResult.errorTags, "guest_llm_rate_limited"],
    };
  }

  const circuit = acquireLlmCircuitSlot();
  if (!circuit.allowed) {
    return {
      ...ruleResult,
      feedbackJa:
        "体験モードでの AI 判定が短時間に集中しているため、追加判定を一時的に止めています。少し時間を空けて再度試してください。",
      errorTags: [...ruleResult.errorTags, "guest_llm_circuit_open"],
    };
  }

  const llmResult = await scoreWithLLM({ question, submittedAnswer });
  return llmResult ?? ruleResult;
}
