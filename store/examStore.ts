import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ExamState {
    answers: Record<string, string[]>; // questionId -> optionIds[]
    examEndTime: number | null; // Timestamp in ms

    // Actions
    setAnswer: (questionId: string, optionIds: string[]) => void;
    initializeExam: (durationSeconds: number) => void;
    clearExam: () => void;
}

export const useExamStore = create<ExamState>()(
    persist(
        (set, get) => ({
            answers: {},
            examEndTime: null,

            setAnswer: (questionId, optionIds) => {
                set((state) => ({
                    answers: {
                        ...state.answers,
                        [questionId]: optionIds,
                    },
                }));
            },

            initializeExam: (durationSeconds) => {
                const { examEndTime } = get();
                // Only set end time if it doesn't exist (persistence check)
                if (!examEndTime) {
                    set({
                        examEndTime: Date.now() + durationSeconds * 1000,
                        answers: {},
                    });
                }
            },

            clearExam: () => {
                set({ answers: {}, examEndTime: null });
            },
        }),
        {
            name: 'exam-storage', // name of the item in the storage (must be unique)
            storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
            skipHydration: true, // Requested in prompt to avoid server mismatch
        }
    )
);
