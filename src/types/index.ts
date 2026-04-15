// ─── ENUMS ────────────────────────────────────────────────────────────────────

export type Phase = "eigen" | "ki" | "fokus" | "reflexion";
export type AIMode = "standard" | "socratic" | "unreliable";
export type AppView = "landing" | "role-select" | "teacher-setup" | "teacher-session" | "student-join" | "student-session";

// ─── CURRICULUM ───────────────────────────────────────────────────────────────

export interface CurriculumTopic { id: string; label: string; }
export interface CurriculumGrade { grade: number; topics: CurriculumTopic[]; }
export interface Subject { id: string; label: string; color: string; grades: CurriculumGrade[]; }

// ─── SESSION CONFIG ───────────────────────────────────────────────────────────

export interface PhaseTimings {
  eigen: number; ki: number; fokus: number; reflexion: number;
}

export interface SessionConfig {
  id: string;
  sessionCode: string;           // 6-char join code
  subject: string;
  subjectColor: string;
  grade: number;
  topic: string;
  task: string;
  aiMode: AIMode;
  maxPrompts: number;
  phaseTimings: PhaseTimings;
  priorKnowledgeEnabled: boolean;
  priorKnowledgeQuestions: string[];
  imageUploadEnabled: boolean;
  lastWeekQuestion: string;
  promptSuggestions: string[];
  createdAt: number;
}

// ─── STUDENT ──────────────────────────────────────────────────────────────────

export interface Student { id: string; name: string; joinedAt: number; }

// ─── PROMPT & RATING ──────────────────────────────────────────────────────────

export interface PromptRatingDimension { stars: number; comment: string; }

export interface PromptRating {
  praezision: PromptRatingDimension;
  eigenanteil: PromptRatingDimension;
  lernwert: PromptRatingDimension;
}

export interface Prompt {
  id: string;
  studentId: string;
  studentName: string;
  text: string;
  response: string;
  rating?: PromptRating | null;
  timestamp: number;
  phase: Phase;
}

// ─── IMAGE ────────────────────────────────────────────────────────────────────

export interface ImageUpload {
  id: string; studentId: string;
  dataUrl: string; mediaType: string;
  timestamp: number;
}

// ─── PRIOR KNOWLEDGE ──────────────────────────────────────────────────────────

export interface PriorAnswer {
  questionIndex: number; question: string; answer: string;
}

// ─── STRUCTURED FEEDBACK (5 Dimensionen mit Sternen) ─────────────────────────

export interface FeedbackDimension {
  stars: number;       // 1–5
  label: string;
  comment: string;     // 1–2 Sätze, konkret
}

export interface StructuredFeedback {
  vorwissen: FeedbackDimension;
  kritischePruefung: FeedbackDimension;
  umgangMitKI: FeedbackDimension;
  eigenanteil: FeedbackDimension;
  denkqualitaet: FeedbackDimension;
  staerke: string;        // größte Stärke
  blinder_fleck: string;  // größter blinder Fleck
  naechster_schritt: string; // konkrete nächste Handlung
}

// ─── REFLECTION ───────────────────────────────────────────────────────────────

export interface StudentReflection {
  studentId: string;
  transferAnswer: string;  // der eine Transfer-Satz
  submittedAt: number;
}

// ─── CHAT ─────────────────────────────────────────────────────────────────────

export interface ChatMessage { role: "user" | "assistant"; content: string; }

export interface StudentSession {
  student: Student;
  chatHistory: ChatMessage[];
  promptsUsed: number;
  prompts: Prompt[];
  priorAnswers: PriorAnswer[];
  ownThoughts: string;
  images: ImageUpload[];
  reflection?: StudentReflection;
  feedback?: StructuredFeedback;
}

// ─── GROUP ANALYSIS ───────────────────────────────────────────────────────────

export interface TopPrompt {
  rank: number;
  studentName: string;
  text: string;
  reason: string;
}

export interface GroupAnalysis {
  topPrompts: TopPrompt[];
  groupPatterns: string[];
  commonWeaknesses: string[];
  generalFeedback: string;
}

export interface GroupComparison {
  gemeinsames: string;
  unterschiede: string;
  starksteAntwort: string;
  begruendung: string;
  loading?: boolean;
}

// ─── LIVE SESSION ─────────────────────────────────────────────────────────────

export interface LiveSession {
  config: SessionConfig;
  currentPhase: Phase;
  timerSeconds: number;
  timerRunning: boolean;
  studentSessions: Record<string, StudentSession>;
  analysis?: GroupAnalysis;
  groupComparison?: GroupComparison;
  startedAt: number;
}
