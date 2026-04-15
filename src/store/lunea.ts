import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import {
  LiveSession, SessionConfig, Phase, Student, StudentSession,
  Prompt, PriorAnswer, ImageUpload, StudentReflection,
  GroupAnalysis, GroupComparison, ChatMessage, PromptRating,
  StructuredFeedback, AppView,
} from "@/types";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function emptyStudentSession(student: Student): StudentSession {
  return { student, chatHistory: [], promptsUsed: 0, prompts: [], priorAnswers: [], ownThoughts: "", images: [] };
}

// Save session to server (best effort)
async function saveSession(code: string, session: LiveSession) {
  try {
    await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, session }),
    });
  } catch {}
}

// Load session from server
async function loadSession(code: string): Promise<LiveSession | null> {
  try {
    const res = await fetch(`/api/session?code=${code.toUpperCase()}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.session ?? null;
  } catch {
    return null;
  }
}

interface LuneaStore {
  view: AppView;
  setView: (v: AppView) => void;
  activeStudentId: string | null;
  setActiveStudent: (id: string | null) => void;
  session: LiveSession | null;
  startSession: (config: Omit<SessionConfig, "sessionCode">) => string;
  endSession: () => void;
  syncSession: () => void;
  joinSession: (code: string, name: string) => Promise<{ success: boolean; studentId?: string }>;
  setPhase: (phase: Phase) => void;
  tickTimer: () => void;
  toggleTimer: () => void;
  resetTimer: () => void;
  addStudent: (name: string) => string;
  updateStudentOwnThoughts: (studentId: string, thoughts: string) => void;
  addPriorAnswer: (studentId: string, answer: PriorAnswer) => void;
  addPrompt: (studentId: string, prompt: Prompt) => void;
  updatePromptRating: (studentId: string, promptId: string, rating: PromptRating) => void;
  addImage: (studentId: string, image: ImageUpload) => void;
  addChatMessage: (studentId: string, message: ChatMessage) => void;
  setStudentFeedback: (studentId: string, feedback: StructuredFeedback) => void;
  setStudentReflection: (studentId: string, reflection: StudentReflection) => void;
  setGroupAnalysis: (analysis: GroupAnalysis) => void;
  setGroupComparison: (comparison: GroupComparison | null) => void;
}

export const useLuneaStore = create<LuneaStore>((set, get) => ({
  view: "landing",
  setView: (v) => set({ view: v }),
  activeStudentId: null,
  setActiveStudent: (id) => set({ activeStudentId: id }),
  session: null,

  startSession: (configPartial) => {
    const sessionCode = generateCode();
    const config: SessionConfig = { ...configPartial, sessionCode };
    const session: LiveSession = {
      config,
      currentPhase: "eigen",
      timerSeconds: config.phaseTimings.eigen * 60,
      timerRunning: false,
      studentSessions: {},
      startedAt: Date.now(),
    };
    set({ view: "teacher-session", activeStudentId: null, session });
    saveSession(sessionCode, session);
    return sessionCode;
  },

  endSession: () => set({ session: null, view: "landing", activeStudentId: null }),

  syncSession: async () => {
    const { session } = get();
    if (!session) return;
    const latest = await loadSession(session.config.sessionCode);
    if (latest) set({ session: latest });
  },

  joinSession: async (code, name) => {
    // Try server first
    let serverSession = await loadSession(code.toUpperCase());

    // Fallback: check if session exists in current store (same-device demo)
    if (!serverSession) {
      const { session } = get();
      if (session && session.config.sessionCode.toUpperCase() === code.toUpperCase()) {
        serverSession = session;
      }
    }

    if (!serverSession) return { success: false };

    const id = uuidv4();
    const student: Student = { id, name: name.trim(), joinedAt: Date.now() };
    const updated: LiveSession = {
      ...serverSession,
      studentSessions: {
        ...serverSession.studentSessions,
        [id]: emptyStudentSession(student),
      },
    };

    await saveSession(code.toUpperCase(), updated);
    set({ activeStudentId: id, view: "student-session", session: updated });
    return { success: true, studentId: id };
  },

  setPhase: (phase) => set((state) => {
    if (!state.session) return {};
    const session = {
      ...state.session,
      currentPhase: phase,
      timerSeconds: state.session.config.phaseTimings[phase] * 60,
      timerRunning: false,
    };
    saveSession(session.config.sessionCode, session);
    return { session };
  }),

  tickTimer: () => set((state) => {
    if (!state.session?.timerRunning) return {};
    const next = state.session.timerSeconds - 1;
    return { session: { ...state.session, timerSeconds: Math.max(0, next), timerRunning: next > 0 } };
  }),

  toggleTimer: () => set((state) => {
    if (!state.session) return {};
    const session = { ...state.session, timerRunning: !state.session.timerRunning };
    saveSession(session.config.sessionCode, session);
    return { session };
  }),

  resetTimer: () => set((state) => {
    if (!state.session) return {};
    const session = {
      ...state.session,
      timerSeconds: state.session.config.phaseTimings[state.session.currentPhase] * 60,
      timerRunning: false,
    };
    return { session };
  }),

  addStudent: (name) => {
    const id = uuidv4();
    const student: Student = { id, name, joinedAt: Date.now() };
    set((state) => {
      if (!state.session) return {};
      const session = {
        ...state.session,
        studentSessions: { ...state.session.studentSessions, [id]: emptyStudentSession(student) },
      };
      saveSession(session.config.sessionCode, session);
      return { activeStudentId: id, session };
    });
    return id;
  },

  updateStudentOwnThoughts: (studentId, thoughts) => set((state) => {
    const ss = state.session?.studentSessions[studentId];
    if (!state.session || !ss) return {};
    const session = { ...state.session, studentSessions: { ...state.session.studentSessions, [studentId]: { ...ss, ownThoughts: thoughts } } };
    saveSession(session.config.sessionCode, session);
    return { session };
  }),

  addPriorAnswer: (studentId, answer) => set((state) => {
    const ss = state.session?.studentSessions[studentId];
    if (!state.session || !ss) return {};
    const rest = ss.priorAnswers.filter(a => a.questionIndex !== answer.questionIndex);
    const session = { ...state.session, studentSessions: { ...state.session.studentSessions, [studentId]: { ...ss, priorAnswers: [...rest, answer] } } };
    saveSession(session.config.sessionCode, session);
    return { session };
  }),

  addPrompt: (studentId, prompt) => set((state) => {
    const ss = state.session?.studentSessions[studentId];
    if (!state.session || !ss) return {};
    const session = {
      ...state.session,
      studentSessions: {
        ...state.session.studentSessions,
        [studentId]: {
          ...ss,
          prompts: [...ss.prompts, prompt],
          promptsUsed: ss.promptsUsed + 1,
          chatHistory: [...ss.chatHistory, { role: "user" as const, content: prompt.text }, { role: "assistant" as const, content: prompt.response }],
        },
      },
    };
    saveSession(session.config.sessionCode, session);
    return { session };
  }),

  updatePromptRating: (studentId, promptId, rating) => set((state) => {
    const ss = state.session?.studentSessions[studentId];
    if (!state.session || !ss) return {};
    const session = { ...state.session, studentSessions: { ...state.session.studentSessions, [studentId]: { ...ss, prompts: ss.prompts.map(p => p.id === promptId ? { ...p, rating } : p) } } };
    saveSession(session.config.sessionCode, session);
    return { session };
  }),

  addImage: (studentId, image) => set((state) => {
    const ss = state.session?.studentSessions[studentId];
    if (!state.session || !ss) return {};
    return { session: { ...state.session, studentSessions: { ...state.session.studentSessions, [studentId]: { ...ss, images: [...ss.images, image] } } } };
  }),

  addChatMessage: (studentId, message) => set((state) => {
    const ss = state.session?.studentSessions[studentId];
    if (!state.session || !ss) return {};
    return { session: { ...state.session, studentSessions: { ...state.session.studentSessions, [studentId]: { ...ss, chatHistory: [...ss.chatHistory, message] } } } };
  }),

  setStudentFeedback: (studentId, feedback) => set((state) => {
    const ss = state.session?.studentSessions[studentId];
    if (!state.session || !ss) return {};
    const session = { ...state.session, studentSessions: { ...state.session.studentSessions, [studentId]: { ...ss, feedback } } };
    saveSession(session.config.sessionCode, session);
    return { session };
  }),

  setStudentReflection: (studentId, reflection) => set((state) => {
    const ss = state.session?.studentSessions[studentId];
    if (!state.session || !ss) return {};
    const session = { ...state.session, studentSessions: { ...state.session.studentSessions, [studentId]: { ...ss, reflection } } };
    saveSession(session.config.sessionCode, session);
    return { session };
  }),

  setGroupAnalysis: (analysis) => set((state) => {
    if (!state.session) return {};
    const session = { ...state.session, analysis };
    saveSession(session.config.sessionCode, session);
    return { session };
  }),

  setGroupComparison: (comparison) => set((state) => {
    if (!state.session) return {};
    const session = { ...state.session, groupComparison: comparison ?? undefined };
    saveSession(session.config.sessionCode, session);
    return { session };
  }),
}));
