"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function submitExam(packageId: string, answers: Record<string, string>) {
    const supabase = await createClient();

    // 1. Auth Check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error("Unauthorized: You must be logged in to submit.");
    }

    // 2. Fetch Questions & Options to Verify Answers
    const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select(`
            id,
            options (
                id,
                is_correct,
                score_value
            )
        `)
        .eq('exam_package_id', packageId);

    if (questionsError || !questions) {
        throw new Error("Failed to fetch exam data for validation.");
    }

    // 3. Calculate Score
    let totalScore = 0;
    const detailedAnswers: { question_id: string; selected_option_id: number | null; is_correct: boolean; score_earned: number; }[] = [];

    questions.forEach((q: any) => {
        const selectedOptId = answers[q.id];
        const selectedOption = q.options.find((opt: any) => String(opt.id) === String(selectedOptId));

        const isCorrect = selectedOption?.is_correct || false;
        const score = isCorrect ? (selectedOption?.score_value || 0) : 0;

        totalScore += score;

        detailedAnswers.push({
            question_id: q.id,
            selected_option_id: selectedOptId ? parseInt(selectedOptId) : null,
            is_correct: isCorrect,
            score_earned: score
        });
    });

    // 4. Insert Result
    const { data: resultData, error: resultError } = await supabase
        .from('exam_results')
        .insert({
            exam_package_id: parseInt(packageId),
            user_id: user.id, // Linked to authenticated user
            student_name: user.email, // Fallback display name
            total_score: totalScore
        })
        .select()
        .single();

    if (resultError) {
        throw new Error("Failed to save exam result: " + resultError.message);
    }

    // 5. Insert Answers
    const answersToInsert = detailedAnswers.map(ans => ({
        exam_result_id: resultData.id,
        question_id: ans.question_id,
        selected_option_id: ans.selected_option_id,
        is_correct: ans.is_correct,
        score_earned: ans.score_earned
    }));

    const { error: answersError } = await supabase
        .from('student_answers')
        .insert(answersToInsert);

    if (answersError) {
        // Potentially handle partial failure, but for now throw
        throw new Error("Failed to save detailed answers: " + answersError.message);
    }

    // 6. Revalidate & Return
    revalidatePath('/history');
    return { success: true, resultId: resultData.id };
}
