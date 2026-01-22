import QuizGame from '../../../services/games/quiz';
import getMultipleChoiceQuestion from '../../../services/multipleChoiceQuestion.service';
import * as updateLeaderboard from '../../../services/leaderboard.service';
import {
  GameMove,
  MCQuestion,
  QuizGameState,
  QuizMove,
  QuizQuestion,
  GameInstance,
} from '../../../types/types';

// Mock external dependencies
jest.mock('../../../services/multipleChoiceQuestion.service');
jest.mock('../../../services/leaderboard.service');

describe('QuizGame tests', () => {
  let quizGame: QuizGame;
  const sampleQuizQuestion: QuizQuestion = {
    id: 'q1',
    text: 'What is 2+2?',
    options: ['3', '4', '5'],
    correctAnswers: ['4'],
  };

  beforeEach(() => {
    // Create a new instance with two sample questions.
    quizGame = new QuizGame('Math', [sampleQuizQuestion, { ...sampleQuizQuestion, id: 'q2' }]);
  });

  describe('constructor', () => {
    it('creates a blank quiz game with proper initial state', () => {
      expect(quizGame.id).toBeDefined();
      expect(typeof quizGame.id).toBe('string');
      expect(quizGame.gameType).toBe('Quiz');
      expect(quizGame.state.status).toBe('WAITING_TO_START');
      expect(quizGame.state.moves).toEqual([]);
      expect(quizGame.state.questions.length).toBeGreaterThanOrEqual(1);
      expect(quizGame.state.player1).toBeUndefined();
      expect(quizGame.state.readyToStart).toBe(false);
    });
  });

  describe('toModel', () => {
    it('should return a representation of the current quiz game state', () => {
      const gameState: GameInstance<QuizGameState> = {
        state: {
          moves: [],
          status: 'WAITING_TO_START',
          questions: quizGame.state.questions,
          scores: {},
          currentQuestion: undefined,
          topic: 'Math',
          player1: undefined,
          readyToStart: false,
        },
        gameID: expect.any(String),
        players: [],
        gameType: 'Quiz',
      };

      expect(quizGame.toModel()).toEqual(gameState);
    });
  });

  describe('startGame', () => {
    beforeEach(() => {
      // Set up the game with two players.
      quizGame.state.player1 = 'host';
      quizGame.state.scores = { host: 0, player2: 0 };
    });

    it('should throw error if non-host tries to start the game', () => {
      expect(() => quizGame.startGame('player2')).toThrow('Only the host can start the game');
    });

    it('should throw error if fewer than 2 players are present', () => {
      quizGame.state.scores = { host: 0 };
      expect(() => quizGame.startGame('host')).toThrow('Need at least 2 players to start');
    });

    it('should start the game when host starts with at least 2 players', () => {
      quizGame.startGame('host');
      expect(quizGame.state.readyToStart).toBe(true);
      expect(quizGame.state.status).toBe('IN_PROGRESS');
      expect(quizGame.state.currentQuestion).toBeDefined();
    });
  });

  describe('applyMove', () => {
    beforeEach(() => {
      // Set game to IN_PROGRESS and define initial state.
      quizGame.state.status = 'IN_PROGRESS';
      quizGame.state.scores = { player1: 0, player2: 0 };
      quizGame.state.player1 = 'player1';
      const [firstQuestion] = quizGame.state.questions;
      quizGame.state.currentQuestion = firstQuestion;
    });

    it('should call startGame and return immediately when move type is START_GAME', async () => {
      const startMove: GameMove<QuizMove> = {
        gameID: 'game123',
        playerID: 'player1',
        move: { type: 'START_GAME' } as QuizMove,
      };
      const startGameSpy = jest.spyOn(quizGame, 'startGame');
      await quizGame.applyMove(startMove);
      expect(startGameSpy).toHaveBeenCalledWith('player1');
    });

    it('should throw an error if game status is not IN_PROGRESS', async () => {
      quizGame.state.status = 'WAITING_TO_START';
      const move: GameMove<QuizMove> = {
        gameID: 'game123',
        playerID: 'player1',
        move: { answer: '4', questionId: 'q1', timeExpired: false } as QuizMove,
      };
      await expect(quizGame.applyMove(move)).rejects.toThrow('Game has not started yet');
    });

    it('should throw an error for invalid question ID', async () => {
      const move: GameMove<QuizMove> = {
        gameID: 'game123',
        playerID: 'player1',
        move: { answer: '4', questionId: 'invalid', timeExpired: false } as QuizMove,
      };
      await expect(quizGame.applyMove(move)).rejects.toThrow('Invalid question ID');
    });

    it('should update score and move to next question on correct answer', async () => {
      const mockLeaderboardEntry = {
        username: 'player1',
        skill: 'Math',
        score: 1,
      };
      // Arrange: mock updateLeaderboard to resolve.
      const updateLeaderboardSpy = jest
        .spyOn(updateLeaderboard, 'updateLeaderboard')
        .mockResolvedValue(mockLeaderboardEntry);

      const move: GameMove<QuizMove> = {
        gameID: 'game123',
        playerID: 'player1',
        move: {
          answer: '4',
          questionId: quizGame.state.questions[0].id,
          timeExpired: false,
        } as QuizMove,
      };

      await quizGame.applyMove(move);
      expect(quizGame.state.scores.player1).toBe(1);
      expect(updateLeaderboardSpy).toHaveBeenCalledWith('player1', quizGame.state.topic, 1);
      expect(quizGame.state.currentQuestion?.id).toBe(quizGame.state.questions[1].id);
      expect(quizGame.state.moves).toContainEqual(move.move);
    });

    it('should not update score if answer is incorrect, but record the move', async () => {
      const move: GameMove<QuizMove> = {
        gameID: 'game123',
        playerID: 'player1',
        move: {
          answer: '3',
          questionId: quizGame.state.questions[0].id,
          timeExpired: false,
        } as QuizMove,
      };

      await quizGame.applyMove(move);
      expect(quizGame.state.scores.player1).toBe(0);
      expect(quizGame.state.currentQuestion?.id).toBe(quizGame.state.questions[0].id);
      expect(quizGame.state.moves).toContainEqual(move.move);
    });

    it('should handle timeExpired move and update currentQuestion', async () => {
      const move: GameMove<QuizMove> = {
        gameID: 'game123',
        playerID: 'player1',
        move: { questionId: quizGame.state.questions[0].id, timeExpired: true } as QuizMove,
      };

      await quizGame.applyMove(move);
      expect(quizGame.state.currentQuestion?.id).toBe(quizGame.state.questions[1].id);
      expect(quizGame.state.moves).toContainEqual(move.move);
    });

    it('should handle timeExpired move to end game', async () => {
      const move: GameMove<QuizMove> = {
        gameID: 'game123',
        playerID: 'player1',
        move: {
          questionId: quizGame.state.questions[quizGame.state.questions.length - 1].id,
          timeExpired: true,
        } as QuizMove,
      };

      await quizGame.applyMove(move);
      expect(quizGame.state.currentQuestion?.id).toBe(undefined);
      expect(quizGame.state.status).toBe('OVER');
    });
  });
});

describe('Factory method create', () => {
  const sampleMCQuestion: MCQuestion = {
    id: 1,
    question: 'What is 2+2?',
    description: 'A basic math question.',
    explanation: 'The correct answer is 4 because 2+2 equals 4.',
    tip: 'Think about basic addition.',
    answers: {
      answer_a: '3',
      answer_b: '4',
      answer_c: '5',
      answer_d: null,
      answer_e: null,
      answer_f: null,
    },
    correct_answers: {
      answer_a_correct: 'false',
      answer_b_correct: 'true',
      answer_c_correct: 'false',
      answer_d_correct: 'false',
      answer_e_correct: 'false',
      answer_f_correct: 'false',
    },
    tags: ['math', 'addition'],
    category: 'Mathematics',
    difficulty: 'easy',
  };

  it('should create a QuizGame instance with questions from multipleChoiceQuestion service', async () => {
    // Arrange: Mock getMultipleChoiceQuestion to return a valid MCQuestion for all calls.
    (getMultipleChoiceQuestion as jest.Mock).mockResolvedValue(sampleMCQuestion);
    const topic = 'Math';

    // Act: Call the async factory method.
    const game = await QuizGame.create(topic);

    // Assert: Verify the created game instance has the correct topic and three formatted questions.
    expect(game).toBeInstanceOf(QuizGame);
    expect(game.state.topic).toBe(topic);
    expect(game.state.questions.length).toBe(3);
    game.state.questions.forEach((q: QuizQuestion) => {
      expect(q.text).toBe(sampleMCQuestion.question);
      expect(q.options).toEqual(['3', '4', '5']);
      expect(q.correctAnswers).toEqual(['4']);
      expect(q.id).toBeDefined();
    });
  });

  it('should throw an error when one of the multiple choice questions returns an error', async () => {
    // Arrange: Make the first call return an error response.
    (getMultipleChoiceQuestion as jest.Mock)
      .mockResolvedValueOnce({ error: 'API failure' })
      .mockResolvedValue(sampleMCQuestion)
      .mockResolvedValue(sampleMCQuestion);
    const topic = 'Math';

    // Act & Assert: The factory method should throw an error with the appropriate message.
    await expect(QuizGame.create(topic)).rejects.toThrow(
      'Error when getting questions: API failure',
    );
  });
});

describe('applyMove additional branches', () => {
  let quizGame: QuizGame;
  const sampleQuizQuestion: QuizQuestion = {
    id: 'q1',
    text: 'What is 2+2?',
    options: ['3', '4', '5'],
    correctAnswers: ['4'],
  };

  beforeEach(() => {
    // Create a game with two questions for testing purposes.
    quizGame = new QuizGame('Math', [sampleQuizQuestion, { ...sampleQuizQuestion, id: 'q2' }]);
    quizGame.state.status = 'IN_PROGRESS';
    quizGame.state.scores = { player1: 0, player2: 0 };
    quizGame.state.player1 = 'player1';
    // Set the current question to the first question.
    const [firstQuestion] = quizGame.state.questions;
    quizGame.state.currentQuestion = firstQuestion;
  });

  it('should not process duplicate timeExpired event for the same question', async () => {
    const move: GameMove<QuizMove> = {
      gameID: 'game123',
      playerID: 'player1',
      move: { questionId: quizGame.state.questions[0].id, timeExpired: true } as QuizMove,
    };

    // First timeExpired move should update the state.
    await quizGame.applyMove(move);
    const movesCountAfterFirst = quizGame.state.moves.length;

    // Attempt to apply a duplicate timeExpired move for the same question.
    await quizGame.applyMove(move);

    // Assert: The duplicate move should not be added.
    expect(quizGame.state.moves.length).toBe(movesCountAfterFirst);
    // Also, the current question should have advanced only once (from q1 to q2).
    expect(quizGame.state.currentQuestion?.id).toBe('q2');
  });

  it('should update score and end game if correct answer is given on the last question', async () => {
    // Arrange: Set the game to have only one question (making it the last one).
    quizGame.state.questions = [sampleQuizQuestion];
    quizGame.state.currentQuestion = sampleQuizQuestion;
    // Initialize scores such that player2 is ahead.
    quizGame.state.scores = { player1: 0, player2: 1 };

    // Spy on updateLeaderboard and mock it to resolve.
    const updateLeaderboardSpy = jest
      .spyOn(updateLeaderboard, 'updateLeaderboard')
      .mockResolvedValue({ username: 'player1', skill: 'Math', score: 1 });

    const move: GameMove<QuizMove> = {
      gameID: 'game123',
      playerID: 'player1',
      move: { answer: '4', questionId: sampleQuizQuestion.id, timeExpired: false } as QuizMove,
    };

    // Act: Apply the move.
    await quizGame.applyMove(move);

    // Assert:
    expect(quizGame.state.scores.player1).toBe(1);
    expect(updateLeaderboardSpy).toHaveBeenCalledWith('player1', 'Math', 1);
    // Since this was the last question, the game should now be over.
    expect(quizGame.state.currentQuestion).toBeUndefined();
    expect(quizGame.state.status).toBe('OVER');
    // Winners should be determined by the max score.
    expect(quizGame.state.winners).toEqual(expect.arrayContaining(['player1', 'player2']));
  });
});
