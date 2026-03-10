export type Judgment = "correct" | "almost_correct" | "incorrect";
export type LevelBand = "700" | "730" | "780" | "860";
export type QuestionType =
  | "ja_to_idiom"
  | "idiom_to_ja"
  | "sentence_to_ja"
  | "sentence_ja_to_en";
export type AnswerMode = "free_text" | "multiple_choice";
export type QuestionSourceMode = "all" | "checked_only";

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
  exampleEn: string;
  exampleJa: string;
  collocationHintJa: string;
  commonMistakeJa: string;
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
  totalIdioms: number;
  totalQuestions: number;
  checkedIdiomsCount: number;
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
