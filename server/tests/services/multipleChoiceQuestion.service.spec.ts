import { MCQuestion } from '../../types/types';
import getMultipleChoiceQuestion from '../../services/multipleChoiceQuestion.service';
import quizAPI from '../../services/apis/quizConfig';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('Message model', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  describe('getMultipleChoiceQuestion', () => {
    const mockMCQuestion: MCQuestion = {
      id: 1,
      question: 'What is the capital of France?',
      description: 'Geography question about European capitals.',
      answers: {
        answer_a: 'Berlin',
        answer_b: 'Madrid',
        answer_c: 'Paris',
        answer_d: 'Rome',
        answer_e: null,
        answer_f: null,
      },
      correct_answers: {
        answer_a_correct: 'false',
        answer_b_correct: 'false',
        answer_c_correct: 'true',
        answer_d_correct: 'false',
        answer_e_correct: 'false',
        answer_f_correct: 'false',
      },
      explanation: 'Paris is the capital of France.',
      tip: 'It is known as the city of love.',
      tags: ['geography', 'capitals'],
      category: 'Geography',
      difficulty: 'easy',
    };
    it('should return a MC question correctly if successful', async () => {
      const mockAPIResponse = {
        status: 200,
        data: [mockMCQuestion], // API usually returns an array
      };

      // Mock the return of API
      jest.spyOn(quizAPI, 'get').mockResolvedValueOnce(mockAPIResponse);
      const result = await getMultipleChoiceQuestion('Geography', 'easy');

      expect(result).toMatchObject(mockMCQuestion);
    });

    it('should return an error if API call returns error', async () => {
      jest
        .spyOn(quizAPI, 'get')
        .mockRejectedValueOnce(() => new Error('Error retrieving question'));

      const result = await getMultipleChoiceQuestion('Geography');
      expect('error' in result).toBe(true);
    });

    it('should return an error if API call fails with error code', async () => {
      const mockAPIResponse = {
        status: 500,
        data: [mockMCQuestion],
      };
      // No user found
      jest.spyOn(quizAPI, 'get').mockResolvedValueOnce(mockAPIResponse);

      const result = await getMultipleChoiceQuestion('Geography');
      expect('error' in result).toBe(true);
    });
  });
});
