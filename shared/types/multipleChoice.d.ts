/**
 * - `id`: A unique identifier for the question.
 * - `question`: The main question prompt.
 * - `description`: A brief description or additional context for the question.
 * - `answers`: An object containing potential answers for the question, each answer key (`answer_a` to `answer_f`) holds a string or `null` if not available.
 * - `correct_answers`: An object where each answer key (`answer_a_correct` to `answer_f_correct`) contains a string ("true" or "false") indicating whether that specific answer is correct.
 * - `explanation`: A detailed explanation of the correct answer.
 * - `tip`: Optional tip for the user, providing extra help or guidance for answering the question.
 * - `tags`: An array of strings used to categorize or tag the question.
 * - `category`: The category or subject matter of the question (e.g., "Linux", "Math", etc.).
 * - `difficulty`: The difficulty level of the question
 */
export interface MCQuestion {
  id: number;
  question: string;
  description: string;
  answers: {
    answer_a: string | null;
    answer_b: string | null;
    answer_c: string | null;
    answer_d: string | null;
    answer_e: string | null;
    answer_f: string | null;
  };
  correct_answers: {
    answer_a_correct: string;
    answer_b_correct: string;
    answer_c_correct: string;
    answer_d_correct: string;
    answer_e_correct: string;
    answer_f_correct: string;
  };
  explanation: string;
  tip: string | null;
  tags: string[];
  category: string;
  difficulty: string;
}

export type MCQuestionResponse = MCQuestion | { error: string };
