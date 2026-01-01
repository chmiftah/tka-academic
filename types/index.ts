// types/index.ts

export interface Subject {
    id: number; // int8 di gambar
    name: string;
}

export interface Level {
    id: number;
    name: string;
}

export interface ExamPackage {
    id: number;
    title: string;
    level_id: number;
    start_at: string; // timestamptz
    end_at: string;
    // Relasi (akan di-fetch via join)
    subjects?: Subject[];
    question_count?: number;
}