import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import { getOpenAIModel, hasOpenAIEnv } from "@/lib/supabase/env";
import type { ScoreResult, StudyQuestion } from "@/lib/types";

const llmScoreSchema = z.object({
  isCorrect: z.boolean(),
  score: z.number().min(0).max(1),
  judgment: z.enum(["correct", "almost_correct", "incorrect"]),
  feedbackJa: z.string().min(1),
  errorTags: z.array(z.string()).max(5),
});

let openaiClient: OpenAI | null = null;

function getClient() {
  if (!hasOpenAIEnv()) {
    return null;
  }

  openaiClient ||= new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  return openaiClient;
}

export async function scoreWithLLM({
  question,
  submittedAnswer,
}: {
  question: StudyQuestion;
  submittedAnswer: string;
}): Promise<ScoreResult | null> {
  const client = getClient();

  if (!client) {
    return null;
  }

  const response = await client.responses.parse({
    model: getOpenAIModel(),
    input: [
      {
        role: "system",
        content:
          "You score TOEIC idiom answers from Japanese prompts. Be strict. Only mark correct when the learner answer is a natural equivalent to the target idiom or an accepted close variant. Output Japanese feedback only.",
      },
      {
        role: "user",
        content: JSON.stringify({
          promptJa: question.promptJa,
          correctAnswer: question.correctAnswer,
          acceptedAnswers: question.acceptedAnswers,
          learnerAnswer: submittedAnswer,
          explanationJa: question.explanationJa,
          outputRule:
            "Return a compact JSON object. judgment must be correct, almost_correct, or incorrect. score is between 0 and 1.",
        }),
      },
    ],
    text: {
      format: zodTextFormat(llmScoreSchema, "llm_score"),
    },
  });

  const parsed = response.output_parsed;
  if (!parsed) {
    return null;
  }

  return {
    ...parsed,
    correctAnswer: question.correctAnswer,
    source: "llm",
  };
}
