import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { emptyAnswers, type QuizAnswers } from '../lib/types';

// ─────────────────────────────────────────────────────────────────────────
// In-memory quiz state.
//
// HIPAA-by-design: these preferences live ONLY in React state for the session.
// They are never written to localStorage/sessionStorage, a cookie, or the
// network. A hard refresh clears them — that is intentional. When a real
// backend exists, persistence must move to BAA-covered storage behind auth.
// ─────────────────────────────────────────────────────────────────────────

interface QuizContextValue {
  answers: QuizAnswers;
  /** True once the user has actually completed the quiz this session. */
  completed: boolean;
  update: (patch: Partial<QuizAnswers>) => void;
  setCompleted: (v: boolean) => void;
  reset: () => void;
}

const QuizContext = createContext<QuizContextValue | null>(null);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<QuizAnswers>(emptyAnswers);
  const [completed, setCompleted] = useState(false);

  const update = useCallback((patch: Partial<QuizAnswers>) => {
    setAnswers((prev) => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => {
    setAnswers(emptyAnswers);
    setCompleted(false);
  }, []);

  const value = useMemo(
    () => ({ answers, completed, update, setCompleted, reset }),
    [answers, completed, update, reset],
  );

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuiz(): QuizContextValue {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error('useQuiz must be used within <QuizProvider>');
  return ctx;
}
