import { MCQuestionResponse } from '../types/types';
import quizAPI from './apis/quizConfig';

const MC_QUESTION_API_URL = 'https://quizapi.io/api/v1/questions';

/**
 * Gets a multiple choice question from quizapi.io with specified category and difficulty
 *
 * @throws Error if there is an issue fetching tags with the question number.
 */
const getMultipleChoiceQuestion = async (
  categoryOfQuestion: string,
  difficultyOfQuestion?: 'easy' | 'medium' | 'hard',
): Promise<MCQuestionResponse> => {
  try {
    const res = await quizAPI.get(`${MC_QUESTION_API_URL}`, {
      params: {
        apiKey: process.env.QUIZ_API_KEY, // API key for authentication
        limit: 1, // Fetch 1 question
        category: categoryOfQuestion, // Filter questions by category
        ...(difficultyOfQuestion && { difficulty: difficultyOfQuestion }), // Only add difficulty if provided
      },
    });

    if (res.status !== 200) {
      throw new Error('Error when fetching multiple choice question');
    }
    return res.data[0];
  } catch (error) {
    return { error: `Error when getting multiple choice question: ${(error as Error).message}` };
  }
};

export default getMultipleChoiceQuestion;
