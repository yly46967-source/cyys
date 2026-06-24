"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AssessmentAnswer } from "@/types/domain";
import { defaultAssessment } from "@/lib/assessment";

interface AssessmentState {
  step: number;
  answer: AssessmentAnswer;
  setStep: (step: number) => void;
  updateAnswer: (patch: Partial<AssessmentAnswer>) => void;
  reset: () => void;
}

export const useAssessmentStore = create<AssessmentState>()(
  persist(
    (set) => ({
      step: 0,
      answer: defaultAssessment,
      setStep: (step) => set({ step }),
      updateAnswer: (patch) =>
        set((state) => ({ answer: { ...state.answer, ...patch } })),
      reset: () => set({ step: 0, answer: defaultAssessment })
    }),
    {
      name: "assurance-demo-assessment",
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);
