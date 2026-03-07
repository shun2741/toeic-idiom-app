export type Judgment = "correct" | "almost_correct" | "incorrect";

export type IdiomSeed = {
  id: string;
  expression: string;
  meaningJa: string;
  variants: string[];
  explanationJa: string;
  hintJa: string;
  levelBand: "700" | "730" | "780" | "860";
};

export type QuestionSeed = {
  id: string;
  idiomId: string;
  promptJa: string;
  type: "ja_to_idiom";
};

export type StudyQuestion = {
  questionId: string;
  idiomId: string;
  promptJa: string;
  correctAnswer: string;
  acceptedAnswers: string[];
  explanationJa: string;
  hintJa: string;
  levelBand: IdiomSeed["levelBand"];
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
  promptJa: string;
  correctAnswer: string;
  answeredAt: string;
  judgment: Judgment;
};
