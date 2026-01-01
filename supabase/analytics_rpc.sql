-- FUNCTION: get_student_exam_analytics(result_id INT8)
-- Returns JSON object with comprehensive exam analytics.

CREATE OR REPLACE FUNCTION get_student_exam_analytics(p_result_id INT8)
RETURNS JSON AS $$
DECLARE
    v_exam_package_id INT8;
    v_total_score NUMERIC;
    v_max_possible_score NUMERIC;
    v_passing_grade NUMERIC := 60.0; -- Default assumption
    
    v_overview JSON;
    v_subject_breakdown JSON;
    v_question_analysis JSON;
BEGIN
    -- 1. Get Exam Context
    SELECT exam_package_id, total_score 
    INTO v_exam_package_id, v_total_score
    FROM exam_results 
    WHERE id = p_result_id;

    IF v_exam_package_id IS NULL THEN
        RAISE EXCEPTION 'Exam Result ID % not found', p_result_id;
    END IF;

    -- 2. Calculate Max Possible Score for this Package
    -- Sum of max_score of all questions in the package's subjects
    SELECT COALESCE(SUM(q.max_score), 0)
    INTO v_max_possible_score
    FROM questions q
    JOIN subjects s ON q.subject_id = s.id
    JOIN package_subjects ps ON s.id = ps.subject_id
    WHERE ps.exam_package_id = v_exam_package_id;

    IF v_max_possible_score = 0 THEN v_max_possible_score := 1; END IF; -- Avoid div by zero

    -- 3. Build Overview Object
    v_overview := json_build_object(
        'total_score', v_total_score,
        'max_possible_score', v_max_possible_score,
        'percentage', ROUND((v_total_score / v_max_possible_score) * 100, 2),
        'passed', (v_total_score / v_max_possible_score * 100) >= v_passing_grade
    );

    -- 4. Build Subject Breakdown
    -- Aggregates score per subject
    WITH SubjectStats AS (
        SELECT 
            s.name AS subject_name,
            COALESCE(SUM(sa.score_earned), 0) AS score_earned,
            COALESCE(SUM(q.max_score), 0) AS max_score
        FROM questions q
        JOIN subjects s ON q.subject_id = s.id
        LEFT JOIN student_answers sa ON q.id = sa.question_id AND sa.exam_result_id = p_result_id
        JOIN package_subjects ps ON s.id = ps.subject_id
        WHERE ps.exam_package_id = v_exam_package_id
        GROUP BY s.id, s.name
    )
    SELECT json_agg(json_build_object(
        'subject_name', subject_name,
        'score_earned', score_earned,
        'max_score', max_score,
        'accuracy_percentage', CASE WHEN max_score = 0 THEN 0 ELSE ROUND((score_earned / max_score) * 100, 2) END
    ))
    INTO v_subject_breakdown
    FROM SubjectStats;

    -- 5. Build Question Analysis
    WITH QuestionDetails AS (
        SELECT 
            q.id,
            q.question_text,
            q.discussion,
            q.max_score AS question_max_score,
            sa.score_earned,
            sa.is_correct,
            -- Get User Answer Text (Handle NULL if unanswered)
            CASE 
                WHEN sa.selected_option_id IS NOT NULL THEN (SELECT option_text FROM options WHERE id = sa.selected_option_id)
                ELSE 'Tidak Dijawab'
            END AS user_answer_text,
            -- Get Correct Answer Text (Concatenate if multiple correct, but for now single)
            (SELECT option_text FROM options WHERE question_id = q.id AND is_correct = true LIMIT 1) AS correct_answer_text
        FROM questions q
        JOIN subjects s ON q.subject_id = s.id
        JOIN package_subjects ps ON s.id = ps.subject_id
        LEFT JOIN student_answers sa ON q.id = sa.question_id AND sa.exam_result_id = p_result_id
        WHERE ps.exam_package_id = v_exam_package_id
        ORDER BY q.id ASC
    )
    SELECT json_agg(json_build_object(
        'question_id', id,
        'question_text', question_text,
        'discussion', discussion,
        'score_earned', COALESCE(score_earned, 0),
        'max_score', question_max_score,
        'is_correct', COALESCE(is_correct, false),
        'user_answer_text', user_answer_text,
        'correct_answer_text', correct_answer_text
    )) 
    INTO v_question_analysis
    FROM QuestionDetails;

    -- 6. Return Final JSON
    RETURN json_build_object(
        'overview', v_overview,
        'subject_breakdown', COALESCE(v_subject_breakdown, '[]'::json),
        'question_analysis', COALESCE(v_question_analysis, '[]'::json)
    );
END;
$$ LANGUAGE plpgsql;
