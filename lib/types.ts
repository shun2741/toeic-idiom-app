export type Judgment = "correct" | "almost_correct" | "incorrect";
export type LevelBand = "700" | "730" | "780" | "860";
export type QuestionType = "ja_to_idiom" | "idiom_to_ja";

export type IdiomSeed = {
  id: string;
  expression: string;
  meaningJa: string;
  variants: string[];
  translationVariantsJa?: string[];
  explanationJa: string;
  hintJa: string;
  levelBand: LevelBand;
};

export type QuestionSeed = {
  id: string;
  idiomId: string;
  prompt: string;
  type: QuestionType;
};

export type StudyQuestion = {
  questionId: string;
  idiomId: string;
  prompt: string;
  promptLabel: string;
  promptDescription: string;
  correctAnswer: string;
  acceptedAnswers: string[];
  questionType: QuestionType;
  sourceExpression: string;
  sourceMeaningJa: string;
  explanationJa: string;
  hintJa: string;
  levelBand: LevelBand;
};

export type ScoreResult = {
  isCorrect: boolean;
  score: number;
  judgment: Judgment;
  correctAnswer: string;
  feedbackJa: string;
  errorTags: string[];
  source: "rule" | "llm";
};

export type DashboardStats = {
  todayCount: number;
  accuracy: number;
  weakCount: number;
  dueReviewCount: number;
  currentStreak: number;
};

export type DailyHistory = {
  date: string;
  count: number;
  accuracy: number;
};

export type RecentMistake = {
  questionId: string;
  prompt: string;
  correctAnswer: string;
  answeredAt: string;
  judgment: Judgment;
};
